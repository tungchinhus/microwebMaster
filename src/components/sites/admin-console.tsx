"use client";

import { ChevronDown, Copy, ExternalLink, Inbox, Loader2, LogOut, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatVnd } from "@/config/site";
import { DEMO_ADMIN_EMAIL, FIREBASE_ENABLED, getBackend } from "@/lib/sites/backend";
import { useSessionUser } from "@/lib/sites/hooks";
import { formatPrice } from "@/lib/sites/products";
import { templateBlocks, layoutTypes } from "@/lib/sites/layouts";
import { getComponentDef } from "@/lib/sites/components";
import { addonTotal, addons, emptyRegions, newUid, nowMs, type CustomerSite, type Submission } from "@/lib/sites/types";
import { PROJECTS, getCategory, getProject, normalizeVi, variantsOf } from "@/lib/showcase/catalog";

const field =
  "w-full rounded-2xl border border-border bg-card px-4 py-3 text-[15px] outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

function slugify(s: string): string {
  return normalizeVi(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "web";
}

export function AdminConsole() {
  const user = useSessionUser();
  if (user === undefined) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user || !user.isAdmin) return <AdminLogin signedInAs={user?.email} />;
  return <Dashboard email={user.email} />;
}

function AdminLogin({ signedInAs }: { signedInAs?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await getBackend().signIn(String(d.get("email")), String(d.get("password")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập không được.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="max-w-md rounded-[28px] border border-border/60 bg-card p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold">Đăng nhập quản trị</h2>
          <p className="text-sm text-muted-foreground">Quyền cao nhất: tạo và chỉnh sửa web của khách hàng.</p>
        </div>
      </div>
      {signedInAs && (
        <p className="mb-4 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {signedInAs} không có quyền admin.{" "}
          <button onClick={() => void getBackend().signOut()} className="font-semibold underline">
            Đăng xuất
          </button>
        </p>
      )}
      <form className="space-y-3" onSubmit={submit}>
        <input name="email" type="email" required placeholder="Email" autoComplete="username" defaultValue={FIREBASE_ENABLED ? "" : DEMO_ADMIN_EMAIL} className={field} />
        <input name="password" type="password" required placeholder="Mật khẩu" autoComplete="current-password" className={field} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={busy} className="w-full rounded-full bg-primary py-3.5 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60">
          {busy ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        {FIREBASE_ENABLED
          ? "Tài khoản admin là tài khoản Firebase Auth có tài liệu admins/{uid} trong Firestore (xem README)."
          : "Đang chạy chế độ thử: dữ liệu chỉ lưu trong trình duyệt này. Mật khẩu admin thử xem trong README; cấu hình Firebase để dùng thật."}
      </p>
    </div>
  );
}

function Dashboard({ email }: { email: string }) {
  const [sites, setSites] = useState<CustomerSite[] | null>(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setSites(await getBackend().listSites());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách web.");
      setSites([]);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    getBackend()
      .listSites()
      .then((list) => alive && setSites(list))
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Không tải được danh sách web.");
        setSites([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3 rounded-full border border-border/60 bg-card py-2 pr-2 pl-5 text-sm">
        <ShieldCheck className="size-4 text-primary" />
        <span>
          Đang đăng nhập admin: <b>{email}</b>
        </span>
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{FIREBASE_ENABLED ? "Firebase" : "Chế độ thử (trình duyệt này)"}</span>
        <button onClick={() => void getBackend().signOut()} className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-muted">
          <LogOut className="size-4" /> Đăng xuất
        </button>
      </div>

      <CreateSite onCreated={reload} />

      <section>
        <h2 className="mb-4 text-2xl font-bold tracking-tight">Web của khách hàng</h2>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        {sites === null ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : sites.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">Chưa có web nào. Tạo web đầu tiên ở trên.</p>
        ) : (
          <div className="space-y-3">
            {sites.map((s) => (
              <SiteRow key={s.id} site={s} onDeleted={reload} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CreateSite({ onCreated }: { onCreated: () => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const [template, setTemplate] = useState(getProject(params.get("mau") ?? "")?.slug ?? PROJECTS[0].slug);
  const project = getProject(template)!;
  const variants = variantsOf(project);
  const [variant, setVariant] = useState(params.get("giao-dien") ?? "");
  const variantId = variants.some((v) => v.id === variant) ? variant : variants[0].id;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const customer = String(d.get("customer")).trim();
    const name = String(d.get("name")).trim() || project.name;
    const id = `${slugify(customer || name)}-${newUid().slice(0, 4)}`;
    const now = nowMs();
    setBusy(true);
    setError("");
    try {
      await getBackend().saveSite({ id, name, customer, template, variant: variantId, regions: { ...emptyRegions(), main: templateBlocks(project) }, layout: 2, createdAt: now, updatedAt: now });
      onCreated();
      router.push(`/site?id=${id}&sua=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo web không được.");
      setBusy(false);
    }
  };

  return (
    <section id="tao-web" className="scroll-mt-24 rounded-[28px] border border-border/60 bg-card p-6 sm:p-8">
      <h2 className="mb-1 text-2xl font-bold tracking-tight">Tạo web cho khách</h2>
      <p className="mb-6 text-muted-foreground">Chọn mẫu và giao diện khách đã ưng. Web được ráp từ các khối của mẫu, bạn sắp xếp lại và thêm component họ muốn mua.</p>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Tên khách hàng</span>
          <input name="customer" required placeholder="Ví dụ: Chị Hoa, spa Quận 3" className={field} />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Tên hiển thị trên web</span>
          <input name="name" placeholder={project.name} className={field} />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Mẫu</span>
          <select value={template} onChange={(e) => setTemplate(e.target.value)} className={field}>
            {PROJECTS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} · {getCategory(p.category)?.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium">Giao diện</span>
          <select value={variantId} onChange={(e) => setVariant(e.target.value)} className={field}>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-muted-foreground md:col-span-2">
          Mẫu gồm các khối: <b className="font-medium text-foreground">{layoutTypes(project).map((t) => getComponentDef(t)?.name).join(" · ")}</b>. Mở ra là sắp xếp, ẩn, sửa chữ
          hoặc thêm khối ngay trên trang.
        </p>
        {error && <p className="text-sm text-red-500 md:col-span-2">{error}</p>}
        <div className="md:col-span-2">
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Tạo và mở chỉnh sửa
          </button>
        </div>
      </form>
    </section>
  );
}

const FIELD_LABEL: Record<string, string> = { name: "Họ tên", phone: "SĐT", email: "Email", address: "Địa chỉ", note: "Ghi chú", message: "Lời nhắn", service: "Dịch vụ", date: "Ngày", time: "Giờ", payment: "Thanh toán", account: "Tài khoản" };

const KIND_LABEL: Record<Submission["kind"], string> = { order: "Đơn hàng", booking: "Đặt lịch", contact: "Liên hệ", newsletter: "Nhận tin" };

function SiteRow({ site, onDeleted }: { site: CustomerSite; onDeleted: () => void }) {
  const project = getProject(site.template);
  const variant = project ? variantsOf(project).find((v) => v.id === site.variant) : undefined;
  const components = addons(site.regions);
  const [subs, setSubs] = useState<Submission[] | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSubs = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        setSubs(await getBackend().listSubmissions(site.id));
      } catch {
        setSubs([]);
      }
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/site?id=${site.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Không copy được: admin vẫn mở link bằng nút bên cạnh.
    }
  };

  const del = async () => {
    if (!window.confirm(`Xoá web "${site.name}" của ${site.customer}? Không khôi phục được.`)) return;
    await getBackend().deleteSite(site.id);
    onDeleted();
  };

  const action = "inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm font-medium transition hover:border-foreground/30";

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h3 className="text-lg font-semibold">{site.customer || site.name}</h3>
            <span className="text-sm text-muted-foreground">
              {site.name} · mẫu {project?.name ?? site.template} · {variant?.name ?? site.variant}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {components.length === 0 && <span className="text-sm text-muted-foreground">Chưa mua thêm component nào</span>}
            {components.map((c) => (
              <span key={c.uid} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
                {getComponentDef(c.type)?.name}
              </span>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Mua thêm: <b className="text-foreground">{formatVnd(addonTotal(site.regions))}</b> · cập nhật {new Date(site.updatedAt).toLocaleString("vi-VN")}
            {site.updatedBy ? ` bởi ${site.updatedBy}` : ""}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/site?id=${site.id}&sua=1`} className={`${action} border-primary bg-primary text-primary-foreground hover:brightness-110`}>
            <Pencil className="size-4" /> Chỉnh sửa
          </Link>
          <Link href={`/site?id=${site.id}`} target="_blank" className={action}>
            <ExternalLink className="size-4" /> Mở web
          </Link>
          <button onClick={copyLink} className={action}>
            <Copy className="size-4" /> {copied ? "Đã copy" : "Copy link"}
          </button>
          <button onClick={toggleSubs} className={action}>
            <Inbox className="size-4" /> Đơn & yêu cầu <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
          </button>
          <button onClick={del} className={`${action} text-red-600 hover:border-red-300`} aria-label="Xoá web">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-4 border-t border-border pt-4">
          {subs === null ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : subs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có đơn hàng hay yêu cầu nào.</p>
          ) : (
            <ul className="space-y-2">
              {subs.map((s) => (
                <li key={s.id} className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <b>{KIND_LABEL[s.kind]}</b>
                    <span className="text-muted-foreground">{new Date(s.createdAt).toLocaleString("vi-VN")}</span>
                    {s.total !== undefined && <span className="ml-auto font-semibold">{formatPrice(s.total)}</span>}
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    {Object.entries(s.data)
                      .filter(([, v]) => v)
                      .map(([k, v]) => `${FIELD_LABEL[k] ?? k}: ${v}`)
                      .join(" · ")}
                  </div>
                  {s.items && <div className="mt-1">{s.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
