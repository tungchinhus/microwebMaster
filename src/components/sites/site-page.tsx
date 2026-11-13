"use client";

import { TriangleAlert, ArrowDown, ArrowLeft, ArrowUp, Check, Eye, EyeOff, GripVertical, ImageIcon, Loader2, Package, Pencil, Plus, Save, Settings2, Trash2, Type, Undo2, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { formatVnd } from "@/config/site";
import { getBackend } from "@/lib/sites/backend";
import { ADDONS, SECTIONS, REGIONS, getComponentDef, type ComponentDef, type ComponentType, type RegionId } from "@/lib/sites/components";
import { useSessionUser, useSite } from "@/lib/sites/hooks";
import { sampleProducts } from "@/lib/sites/products";
import { addonTotal, addons, allTypes, newUid, placedTypes, safeImageUrl, type CustomerSite, type PlacedComponent, type SiteHeroText, type SiteProduct } from "@/lib/sites/types";
import { DEFAULT_LOOK, applyVariant, getProject, variantsOf, type Project } from "@/lib/showcase/catalog";
import { CartDrawer, LoginModal, renderBlock } from "./site-blocks";
import { SiteRuntimeProvider } from "./site-runtime";

const HEADING_FONTS = { sans: "inherit", serif: 'var(--font-serif-vn), Georgia, "Times New Roman", serif', mono: 'ui-monospace, "SFMono-Regular", Menlo, monospace' };

function themeVars(project: Project): CSSProperties {
  const p = project.palette;
  const look = project.look ?? DEFAULT_LOOK;
  return {
    "--bg": p.bg,
    "--fg": p.fg,
    "--accent": p.accent,
    "--soft": p.soft,
    "--card": p.card ?? "#ffffff",
    "--r": String(Math.max(look.radius, 0.15)),
    "--pill": look.pillButtons ? "999px" : `calc(${Math.max(look.radius, 0.3)} * 0.6rem)`,
    "--hfont": HEADING_FONTS[look.headingFont],
    "--hweight": String(look.headingWeight),
  } as CSSProperties;
}

/** Phần so sánh để biết bản nháp đã khác bản đã lưu chưa. */
const snapshot = (s: CustomerSite) => JSON.stringify({ n: s.name, v: s.variant, r: s.regions, p: s.products ?? [], h: s.hero ?? {} });

export function SitePage() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const wantEdit = params.get("sua") === "1";
  const saved = useSite(id);
  const user = useSessionUser();
  const isAdmin = !!user?.isAdmin;

  const [draft, setDraft] = useState<CustomerSite | null>(null);
  const [editing, setEditing] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [libraryFor, setLibraryFor] = useState<RegionId | null>(null);
  const [propsFor, setPropsFor] = useState<{ region: RegionId; uid: string } | null>(null);
  const [panel, setPanel] = useState<"products" | "hero" | null>(null);
  /** Kéo thả để sắp xếp: khối đang kéo và vị trí sẽ thả */
  const [drag, setDrag] = useState<{ region: RegionId; uid: string } | null>(null);
  const [dropAt, setDropAt] = useState<{ region: RegionId; index: number } | null>(null);

  // Mở link có ?sua=1 khi đã là admin: vào thẳng chế độ chỉnh sửa.
  if (!autoStarted && wantEdit && isAdmin && saved) {
    setAutoStarted(true);
    setEditing(true);
    setDraft(saved);
  }

  const dirty = !!(editing && draft && saved && snapshot(draft) !== snapshot(saved));

  // Có người khác vừa lưu trong lúc mình đang mở chỉnh sửa mà chưa sửa gì: lấy bản mới.
  if (editing && draft && saved && !dirty && draft.updatedAt !== saved.updatedAt) {
    setDraft(saved);
  }

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const shown = editing && draft ? draft : saved;
  const base = shown ? getProject(shown.template) : undefined;
  const project = useMemo(
    () =>
      shown && base
        ? {
            ...applyVariant(base, shown.variant),
            name: shown.name || base.name,
            headline: shown.hero?.headline || base.headline,
            summary: shown.hero?.subtitle || base.summary,
            announcement: shown.hero?.announcement || base.announcement,
          }
        : undefined,
    [shown, base],
  );
  const customProducts = shown?.products;
  const products = useMemo(() => (customProducts?.length ? customProducts : base ? sampleProducts(base) : []), [customProducts, base]);
  const regions = shown?.regions;
  const placed = useMemo(() => (regions ? placedTypes(regions) : new Set<ComponentType>()), [regions]);

  if (!id) return <Notice title="Thiếu mã web" text="Đường dẫn cần có dạng /site?id=ma-web." />;
  if (saved === undefined) return <Notice title="Đang tải..." loading />;
  if (saved === null || !shown || !project || !regions) return <Notice title="Không tìm thấy web này" text="Web có thể đã bị xoá hoặc đường dẫn bị sai." />;

  /* ------------------------------------------------------------ Thao tác sửa */

  const update = (fn: (s: CustomerSite) => CustomerSite) => setDraft((d) => (d ? fn(d) : d));
  const updateRegion = (region: RegionId, fn: (list: PlacedComponent[]) => PlacedComponent[]) =>
    update((s) => ({ ...s, regions: { ...s.regions, [region]: fn(s.regions[region]) } }));

  const addComponent = (region: RegionId, type: ComponentType) => {
    const def = getComponentDef(type);
    if (!def) return;
    updateRegion(region, (list) => [...list, { uid: newUid(), type, props: { ...(def.defaults ?? {}) } }]);
    setLibraryFor(null);
  };
  const move = (region: RegionId, uid: string, dir: -1 | 1) =>
    updateRegion(region, (list) => {
      const i = list.findIndex((c) => c.uid === uid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const moveTo = (region: RegionId, uid: string, index: number) =>
    updateRegion(region, (list) => {
      const from = list.findIndex((c) => c.uid === uid);
      if (from < 0) return list;
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(from < index ? index - 1 : index, 0, item);
      return next;
    });
  const toggleHidden = (region: RegionId, uid: string) =>
    updateRegion(region, (list) => list.map((c) => (c.uid === uid ? { ...c, hidden: !c.hidden } : c)));
  const remove = (region: RegionId, uid: string) => updateRegion(region, (list) => list.filter((c) => c.uid !== uid));
  const setProps = (region: RegionId, uid: string, props: Record<string, string>) =>
    updateRegion(region, (list) => list.map((c) => (c.uid === uid ? { ...c, props } : c)));

  const startEditing = () => {
    setDraft(saved);
    setEditing(true);
    setMessage(null);
  };
  const stopEditing = () => {
    if (dirty && !window.confirm("Bỏ các thay đổi chưa lưu?")) return;
    setEditing(false);
    setDraft(null);
    setLibraryFor(null);
    setPropsFor(null);
    setPanel(null);
  };
  const discard = () => {
    if (window.confirm("Bỏ các thay đổi chưa lưu và quay về bản đang chạy?")) setDraft(saved);
  };
  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage(null);
    const next: CustomerSite = { ...draft, updatedAt: Date.now(), updatedBy: user?.email };
    try {
      await getBackend().saveSite(next);
      setDraft(next);
      setMessage({ kind: "ok", text: "Đã lưu. Web của khách đã cập nhật." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Lưu không được." });
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------- Hiển thị */

  const region = (rid: RegionId, layout: "inline" | "stack" | "floating") => {
    const list = editing ? regions[rid] : regions[rid].filter((c) => !c.hidden);
    const canDrag = editing && layout === "stack";
    const endDrag = () => {
      setDrag(null);
      setDropAt(null);
    };
    const items = list.map((c, i) => {
      const block = renderBlock(c);
      if (!editing) return <div key={c.uid}>{block}</div>;
      const def = getComponentDef(c.type)!;
      const dropHere = canDrag && drag?.region === rid && dropAt?.region === rid;
      return (
        <div
          key={c.uid}
          id={`khoi-${c.uid}`}
          onDragOver={
            canDrag && drag?.region === rid
              ? (e) => {
                  e.preventDefault();
                  const box = e.currentTarget.getBoundingClientRect();
                  const index = e.clientY < box.top + box.height / 2 ? i : i + 1;
                  if (dropAt?.index !== index || dropAt.region !== rid) setDropAt({ region: rid, index });
                }
              : undefined
          }
          onDrop={
            canDrag && drag?.region === rid
              ? (e) => {
                  e.preventDefault();
                  if (dropAt) moveTo(rid, drag.uid, dropAt.index);
                  endDrag();
                }
              : undefined
          }
          className={`group/item relative rounded-xl outline-1 outline-transparent outline-offset-2 transition hover:outline-indigo-500 ${
            drag?.uid === c.uid ? "opacity-40" : ""
          } ${dropHere && dropAt.index === i ? "before:absolute before:inset-x-0 before:-top-8 before:h-1 before:rounded-full before:bg-indigo-500" : ""} ${
            dropHere && dropAt.index === i + 1 && i === list.length - 1 ? "after:absolute after:inset-x-0 after:-bottom-8 after:h-1 after:rounded-full after:bg-indigo-500" : ""
          }`}
        >
          <div className={c.hidden ? "pointer-events-none opacity-35 grayscale" : ""}>{block}</div>
          {c.hidden && (
            <span className="absolute top-3 left-3 z-20 inline-flex items-center gap-1 rounded-full bg-zinc-900/85 px-2.5 py-1 text-[11px] font-semibold text-white">
              <EyeOff className="size-3.5" /> Đang ẩn, khách không thấy
            </span>
          )}
          <div
            className={`absolute z-30 flex items-center gap-0.5 rounded-full bg-zinc-900 p-1 text-white shadow-lg transition ${
              layout === "stack" ? "-top-4 right-3 opacity-90 md:opacity-0" : "-top-9 right-0 opacity-0"
            } group-focus-within/item:opacity-100 group-hover/item:opacity-100`}
          >
            {canDrag && (
              <span
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  const el = document.getElementById(`khoi-${c.uid}`);
                  if (el) e.dataTransfer.setDragImage(el, 40, 20);
                  setDrag({ region: rid, uid: c.uid });
                }}
                onDragEnd={endDrag}
                title="Kéo để đổi vị trí"
                className="hidden cursor-grab rounded-full p-1.5 hover:bg-white/15 active:cursor-grabbing md:block"
              >
                <GripVertical className="size-3.5" />
              </span>
            )}
            <span className="px-2 text-[11px] font-medium whitespace-nowrap">{def.name}</span>
            <IconBtn label={layout === "inline" ? "Sang trái" : "Lên"} disabled={i === 0} onClick={() => move(rid, c.uid, -1)}>
              <ArrowUp className={`size-3.5 ${layout === "inline" ? "-rotate-90" : ""}`} />
            </IconBtn>
            <IconBtn label={layout === "inline" ? "Sang phải" : "Xuống"} disabled={i === list.length - 1} onClick={() => move(rid, c.uid, 1)}>
              <ArrowDown className={`size-3.5 ${layout === "inline" ? "-rotate-90" : ""}`} />
            </IconBtn>
            {c.type === "hero" ? (
              <IconBtn label="Sửa chữ banner" onClick={() => setPanel("hero")}>
                <Pencil className="size-3.5" />
              </IconBtn>
            ) : def.fields?.length ? (
              <IconBtn label="Sửa nội dung" onClick={() => setPropsFor({ region: rid, uid: c.uid })}>
                <Pencil className="size-3.5" />
              </IconBtn>
            ) : null}
            <IconBtn label={c.hidden ? "Hiện lại" : "Ẩn với khách"} onClick={() => toggleHidden(rid, c.uid)}>
              {c.hidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            </IconBtn>
            <IconBtn label="Gỡ khỏi trang" onClick={() => remove(rid, c.uid)}>
              <Trash2 className="size-3.5 text-red-300" />
            </IconBtn>
          </div>
        </div>
      );
    });

    const flex = layout === "inline" ? "flex flex-wrap items-center gap-2" : layout === "floating" ? "flex flex-col items-end gap-3" : "space-y-14";
    if (!editing) return list.length ? <div className={flex}>{items}</div> : null;

    const info = REGIONS.find((r) => r.id === rid)!;
    return (
      <div className={`relative rounded-2xl border-2 border-dashed border-indigo-400/80 bg-indigo-500/[0.04] ${layout === "inline" ? "px-2 pt-5 pb-2" : "p-4 pt-7"}`}>
        <span className="absolute -top-3 left-3 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-white">{info.name}</span>
        <div className={flex}>
          {items}
          <button
            onClick={() => setLibraryFor(rid)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-indigo-500 bg-white/90 font-semibold text-indigo-700 transition hover:bg-indigo-600 hover:text-white ${
              layout === "inline" ? "h-9 px-3 text-xs" : "px-4 py-2 text-sm"
            } ${layout === "stack" && list.length ? "mx-auto flex" : ""}`}
          >
            <Plus className="size-4" /> {layout === "inline" ? "Thêm" : "Thêm component"}
          </button>
        </div>
      </div>
    );
  };

  const variants = base ? variantsOf(base) : [];
  const editedComponent = propsFor ? regions[propsFor.region].find((c) => c.uid === propsFor.uid) : undefined;

  return (
    <SiteRuntimeProvider siteId={shown.id} project={project} products={products} placed={placed} user={user} editing={editing}>
      <div className={`wsite flex min-h-dvh flex-col ${isAdmin ? "pt-14" : ""}`} style={themeVars(project)}>
        {isAdmin && (
          <AdminBar
            site={shown}
            editing={editing}
            dirty={dirty}
            saving={saving}
            message={message}
            variants={variants.map((v) => ({ id: v.id, name: v.name }))}
            onVariant={(v) => update((s) => ({ ...s, variant: v }))}
            onName={(n) => update((s) => ({ ...s, name: n }))}
            onProducts={() => setPanel("products")}
            onHero={() => setPanel("hero")}
            productCount={shown.products?.length ?? 0}
            onStart={startEditing}
            onStop={stopEditing}
            onDiscard={discard}
            onSave={save}
          />
        )}

        <div style={{ background: project.palette.accent }} className="px-4 py-2 text-center text-sm font-medium text-white">
          {project.announcement}
        </div>
        {region("top", "stack")}

        <header className={`z-20 border-b border-[color-mix(in_srgb,var(--fg)_10%,transparent)] bg-[var(--bg)] ${isAdmin ? "" : "sticky top-0"}`}>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4">
            <span className="ws-h text-2xl">
              {project.name}
              <span className="ws-accent">.</span>
            </span>
            <nav className="ws-muted hidden gap-6 text-[15px] lg:flex">
              {project.nav.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </nav>
            <div className="ml-auto">{region("header", "inline")}</div>
          </div>
        </header>

        <main id="noi-dung" className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-12">
          {editing && (placed.has("cart") || placed.has("search")) && !placed.has("products") && (
            <p className="mb-8 flex items-start gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 [font-family:var(--font-sans-vn),sans-serif]">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                Trang có {[placed.has("cart") && "Giỏ hàng", placed.has("search") && "Tìm kiếm"].filter(Boolean).join(" và ")} nhưng khối Danh sách sản phẩm đang ẩn hoặc chưa có,
                khách sẽ không có gì để chọn. Hiện lại khối sản phẩm, hoặc thêm từ nút Thêm component.
              </span>
            </p>
          )}
          {region("main", "stack")}
        </main>

        <footer className="border-t border-[color-mix(in_srgb,var(--fg)_10%,transparent)]">
          <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
            {region("footer", "stack")}
            <div className="ws-muted flex flex-wrap justify-between gap-3 text-sm">
              <span>© {project.name}</span>
              <span>{project.nav.join(" · ")}</span>
            </div>
          </div>
        </footer>

        <div className={`fixed right-5 bottom-5 z-40 ${editing ? "w-56" : ""}`}>{region("floating", "floating")}</div>

        {placed.has("cart") && <CartDrawer />}
        {placed.has("login") && <LoginModal />}

        {editing && panel === "products" && (
          <ProductsEditor
            products={draft?.products ?? []}
            samples={base ? sampleProducts(base) : []}
            onClose={() => setPanel(null)}
            onSave={(list) => {
              update((s) => ({ ...s, products: list }));
              setPanel(null);
            }}
          />
        )}
        {editing && panel === "hero" && base && (
          <HeroEditor
            value={draft?.hero ?? {}}
            defaults={{ headline: base.headline, subtitle: base.summary, announcement: base.announcement }}
            onClose={() => setPanel(null)}
            onSave={(hero) => {
              update((s) => ({ ...s, hero }));
              setPanel(null);
            }}
          />
        )}
        {editing && libraryFor && <Library region={libraryFor} placed={allTypes(regions)} onPick={(t) => addComponent(libraryFor, t)} onClose={() => setLibraryFor(null)} />}
        {editing && propsFor && editedComponent && (
          <PropsEditor
            component={editedComponent}
            onClose={() => setPropsFor(null)}
            onSave={(p) => {
              setProps(propsFor.region, propsFor.uid, p);
              setPropsFor(null);
            }}
          />
        )}
      </div>
    </SiteRuntimeProvider>
  );
}

/* ------------------------------------------------------------ Thanh admin */

function AdminBar(props: {
  site: CustomerSite;
  editing: boolean;
  dirty: boolean;
  saving: boolean;
  message: { kind: "ok" | "error"; text: string } | null;
  variants: { id: string; name: string }[];
  onVariant: (id: string) => void;
  onName: (name: string) => void;
  onProducts: () => void;
  onHero: () => void;
  productCount: number;
  onStart: () => void;
  onStop: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const { site, editing, dirty, saving, message } = props;
  const total = addonTotal(site.regions);
  const count = addons(site.regions).length;
  const btn = "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition disabled:opacity-40";
  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-14 items-center gap-3 overflow-x-auto bg-zinc-900 px-3 text-white shadow-lg [font-family:var(--font-sans-vn),sans-serif]">
      <Link href="/quan-tri" className={`${btn} shrink-0 text-white/80 hover:bg-white/10 hover:text-white`}>
        <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Quản trị</span>
      </Link>
      <div className="min-w-0 max-w-40 shrink lg:max-w-none">
        <div className="truncate text-sm font-semibold">{site.customer || "Khách hàng"}</div>
        <div className="truncate text-[11px] text-white/60">
          {count} mua thêm · {formatVnd(total)}
        </div>
      </div>

      {editing && (
        <div className="flex shrink-0 items-center gap-2">
          <input
            value={site.name}
            onChange={(e) => props.onName(e.target.value)}
            className="hidden h-9 w-36 rounded-full bg-white/10 px-3 text-sm outline-none focus:bg-white/15 xl:block"
            aria-label="Tên hiển thị trên web"
          />
          <button onClick={props.onProducts} className={`${btn} bg-white/10 hover:bg-white/15`}>
            <Package className="size-4" /> <span className="hidden md:inline">Sản phẩm</span> ({props.productCount})
          </button>
          <button onClick={props.onHero} className={`${btn} hidden bg-white/10 hover:bg-white/15 md:inline-flex`}>
            <Type className="size-4" /> Chữ banner
          </button>
          <select value={site.variant} onChange={(e) => props.onVariant(e.target.value)} className="h-9 rounded-full bg-white/10 px-3 text-sm outline-none" aria-label="Giao diện">
            {props.variants.map((v) => (
              <option key={v.id} value={v.id} className="text-zinc-900">
                Giao diện: {v.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {message && <span className={`hidden text-sm xl:inline ${message.kind === "ok" ? "text-emerald-300" : "text-red-300"}`}>{message.text}</span>}
        {editing ? (
          <>
            {dirty && <span className="hidden text-xs text-amber-300 sm:inline">Chưa lưu</span>}
            <button onClick={props.onDiscard} disabled={!dirty || saving} className={`${btn} hover:bg-white/10`}>
              <Undo2 className="size-4" /> <span className="hidden lg:inline">Hoàn tác</span>
            </button>
            <button onClick={props.onStop} className={`${btn} hover:bg-white/10`}>
              <Eye className="size-4" /> <span className="hidden lg:inline">Xem như khách</span>
            </button>
            <button onClick={props.onSave} disabled={!dirty || saving} className={`${btn} bg-indigo-500 hover:bg-indigo-400`}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Lưu
            </button>
          </>
        ) : (
          <button onClick={props.onStart} className={`${btn} bg-indigo-500 hover:bg-indigo-400`}>
            <Settings2 className="size-4" /> Bật chỉnh sửa
          </button>
        )}
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label} aria-label={label} className="rounded-full p-1.5 hover:bg-white/15 disabled:opacity-30">
      {children}
    </button>
  );
}

/* ------------------------------------------------- Thư viện component, sửa nội dung */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 [font-family:var(--font-sans-vn),sans-serif]" onClick={onClose}>
      <div className="flex max-h-[85dvh] w-full max-w-2xl flex-col rounded-3xl bg-white text-zinc-900 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100" aria-label="Đóng">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function Library({ region, placed, onPick, onClose }: { region: RegionId; placed: Set<ComponentType>; onPick: (t: ComponentType) => void; onClose: () => void }) {
  const info = REGIONS.find((r) => r.id === region)!;
  const sections = SECTIONS.filter((c) => c.regions.includes(region));
  const paid = ADDONS.filter((c) => c.regions.includes(region));
  const others = ADDONS.filter((c) => !c.regions.includes(region));
  const card = (c: ComponentDef) => {
    const taken = !!c.unique && placed.has(c.type);
    const missing = (c.worksBestWith ?? []).filter((t) => !placed.has(t));
    return (
      <button
        key={c.type}
        disabled={taken}
        onClick={() => onPick(c.type)}
        className="flex flex-col gap-1.5 rounded-2xl border border-zinc-200 p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-zinc-200 disabled:hover:bg-transparent"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold">{c.name}</span>
          <span className={`shrink-0 text-sm font-semibold ${c.price ? "text-indigo-600" : "text-emerald-700"}`}>{c.price ? `+${formatVnd(c.price)}` : "Có trong mẫu"}</span>
        </div>
        <span className="text-sm leading-relaxed text-zinc-600">{c.description}</span>
        {taken ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <Check className="size-3.5" /> Đã có trên trang
          </span>
        ) : missing.length ? (
          <span className="text-xs text-amber-700">Nên thêm cùng: {missing.map((t) => getComponentDef(t)?.name).join(", ")}</span>
        ) : null}
      </button>
    );
  };
  return (
    <Modal title={`Thêm vào vùng "${info.name}"`} onClose={onClose}>
      <p className="mb-4 text-sm text-zinc-500">{info.hint.replace(/\.+$/, "")}. Khối mới thêm nằm cuối vùng, kéo hoặc bấm mũi tên để đổi vị trí.</p>
      {sections.length > 0 && (
        <>
          <h3 className="mb-2 text-sm font-bold text-zinc-700">Khối của mẫu (miễn phí)</h3>
          <div className="mb-6 grid gap-3 sm:grid-cols-2">{sections.map(card)}</div>
          <h3 className="mb-2 text-sm font-bold text-zinc-700">Component mua thêm (cộng vào báo giá)</h3>
        </>
      )}
      <div className="grid gap-3 sm:grid-cols-2">{paid.map(card)}</div>
      {others.length > 0 && (
        <p className="mt-4 text-xs text-zinc-500">
          Component khác đặt ở vùng khác: {others.map((c) => `${c.name} (${c.regions.map((r) => REGIONS.find((x) => x.id === r)?.name).join(", ")})`).join("; ")}.
        </p>
      )}
    </Modal>
  );
}

function PropsEditor({ component, onSave, onClose }: { component: PlacedComponent; onSave: (p: Record<string, string>) => void; onClose: () => void }) {
  const def = getComponentDef(component.type)!;
  const [values, setValues] = useState(component.props);
  return (
    <Modal title={`Sửa nội dung: ${def.name}`} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(values);
        }}
      >
        {def.fields?.map((f) => (
          <label key={f.key} className="block space-y-1.5">
            <span className="text-sm font-medium">{f.label}</span>
            {f.multiline ? (
              <textarea
                value={values[f.key] ?? ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                rows={5}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 outline-none focus:border-indigo-500"
              />
            ) : (
              <input
                value={values[f.key] ?? ""}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 outline-none focus:border-indigo-500"
              />
            )}
          </label>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-zinc-100">
            Huỷ
          </button>
          <button className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Áp dụng</button>
        </div>
        <p className="text-xs text-zinc-500">Bấm Lưu trên thanh admin để đưa thay đổi lên web của khách.</p>
      </form>
    </Modal>
  );
}

const input = "w-full rounded-xl border border-zinc-300 px-3 py-2.5 outline-none focus:border-indigo-500";

function ProductsEditor({
  products,
  samples,
  onSave,
  onClose,
}: {
  products: SiteProduct[];
  samples: SiteProduct[];
  onSave: (list: SiteProduct[]) => void;
  onClose: () => void;
}) {
  const [list, setList] = useState<SiteProduct[]>(products.length ? products : []);
  const set = (i: number, patch: Partial<SiteProduct>) => setList((l) => l.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const valid = list.filter((p) => p.name.trim());
  return (
    <Modal title="Sản phẩm, dịch vụ của web" onClose={onClose}>
      <p className="mb-4 text-sm text-zinc-500">
        Hiện ở khối Danh sách sản phẩm và giỏ hàng. Chưa nhập gì thì web dùng {samples.length} sản phẩm mẫu theo lĩnh vực.
      </p>
      <div className="space-y-3">
        {list.map((p, i) => (
          <div key={p.id} className="grid gap-2 rounded-2xl border border-zinc-200 p-3 sm:grid-cols-[72px_1fr]">
            <div className="hidden aspect-square place-items-center overflow-hidden rounded-xl bg-zinc-100 sm:grid">
              {safeImageUrl(p.image) ? (
                // eslint-disable-next-line @next/next/no-img-element -- xem trước ảnh admin dán link
                <img src={safeImageUrl(p.image)} alt="" className="size-full object-cover" />
              ) : (
                <ImageIcon className="size-5 text-zinc-400" />
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
              <input value={p.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Tên sản phẩm" aria-label="Tên sản phẩm" className={input} />
              <input
                value={p.price ? String(p.price) : ""}
                onChange={(e) => set(i, { price: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                inputMode="numeric"
                placeholder="Giá (đ)"
                aria-label="Giá"
                className={input}
              />
              <button onClick={() => setList((l) => l.filter((_, j) => j !== i))} className="rounded-xl px-3 text-red-600 hover:bg-red-50" aria-label="Xoá sản phẩm">
                <Trash2 className="size-4" />
              </button>
              <input value={p.image ?? ""} onChange={(e) => set(i, { image: e.target.value })} placeholder="Link ảnh https://..." aria-label="Link ảnh" className={`${input} sm:col-span-3`} />
              <input value={p.description ?? ""} onChange={(e) => set(i, { description: e.target.value })} placeholder="Mô tả ngắn (không bắt buộc)" aria-label="Mô tả" className={`${input} sm:col-span-3`} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => setList((l) => [...l, { id: newUid(), name: "", price: 0 }])} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
          <Plus className="size-4" /> Thêm sản phẩm
        </button>
        {!list.length && (
          <button onClick={() => setList(samples.map((s) => ({ ...s, id: newUid() })))} className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-100">
            Bắt đầu từ sản phẩm mẫu
          </button>
        )}
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 border-t border-zinc-200 pt-4">
        <span className="mr-auto text-xs text-zinc-500">Bấm Lưu trên thanh admin để đưa lên web của khách.</span>
        <button onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-zinc-100">
          Huỷ
        </button>
        <button onClick={() => onSave(valid.map((p) => ({ ...p, name: p.name.trim(), image: p.image?.trim() || undefined, description: p.description?.trim() || undefined })))} className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          Áp dụng ({valid.length})
        </button>
      </div>
    </Modal>
  );
}

function HeroEditor({
  value,
  defaults,
  onSave,
  onClose,
}: {
  value: SiteHeroText;
  defaults: Required<SiteHeroText>;
  onSave: (v: SiteHeroText) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState<SiteHeroText>(value);
  const fields: { key: keyof SiteHeroText; label: string; multiline?: boolean }[] = [
    { key: "announcement", label: "Dòng thông báo trên cùng" },
    { key: "headline", label: "Tiêu đề lớn" },
    { key: "subtitle", label: "Mô tả ngắn (hiện trên điện thoại)", multiline: true },
  ];
  return (
    <Modal title="Chữ trên banner" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ headline: v.headline?.trim() || undefined, subtitle: v.subtitle?.trim() || undefined, announcement: v.announcement?.trim() || undefined });
        }}
      >
        {fields.map((f) => (
          <label key={f.key} className="block space-y-1.5">
            <span className="text-sm font-medium">{f.label}</span>
            {f.multiline ? (
              <textarea value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} placeholder={defaults[f.key]} rows={3} className={input} />
            ) : (
              <input value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} placeholder={defaults[f.key]} className={input} />
            )}
          </label>
        ))}
        <p className="text-xs text-zinc-500">Để trống thì dùng chữ mặc định của mẫu (chữ mờ trong ô).</p>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-zinc-100">
            Huỷ
          </button>
          <button className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Áp dụng</button>
        </div>
      </form>
    </Modal>
  );
}

function Notice({ title, text, loading }: { title: string; text?: string; loading?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      {loading && <Loader2 className="size-6 animate-spin text-muted-foreground" />}
      <h1 className="text-2xl font-bold">{title}</h1>
      {text && <p className="text-muted-foreground">{text}</p>}
      {!loading && (
        <Link href="/" className="mt-2 text-primary underline">
          Về trang chủ
        </Link>
      )}
    </div>
  );
}
