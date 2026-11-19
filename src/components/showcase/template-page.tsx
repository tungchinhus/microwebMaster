"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CartDrawer, LoginModal, renderBlock } from "@/components/sites/site-blocks";
import { solidAccent, themeVars } from "@/components/sites/site-page";
import { SiteRuntimeProvider } from "@/components/sites/site-runtime";
import type { ComponentType, RegionId } from "@/lib/sites/components";
import { templateBlocks } from "@/lib/sites/layouts";
import { sampleProducts } from "@/lib/sites/products";
import { emptyRegions, newUid, placedTypes, type PlacedComponent, type SiteRegions } from "@/lib/sites/types";
import { getComponentDef } from "@/lib/sites/components";
import { applyVariant, getCategory, normalizeVi, type Project } from "@/lib/showcase/catalog";
import { Phone } from "lucide-react";
import { maskMoney } from "./mini-site";

/** Nút đầu trang có sẵn trong bản xem trước theo lĩnh vực (bán hàng thì có tìm kiếm và giỏ hàng). */
const HEADER_BY_KIND: Partial<Record<string, ComponentType[]>> = { shop: ["search", "cart"] };

/** Từ khoá của mục menu → loại khối nên cuộn tới. */
const NAV_HINTS: [RegExp, ComponentType[]][] = [
  [/lien he|dia chi|chi nhanh|cua hang|showroom|vi tri|ban do/, ["locations", "contact", "booking"]],
  [/dat (lich|ban|cho|phong)|dang ky|tap thu|lai thu|hen/, ["booking", "contact"]],
  [/khuyen mai|uu dai|sale|giam gia|combo|voucher/, ["deals", "plans", "cta"]],
  [/bang gia|goi|the thanh vien|hoc phi|gia/, ["plans", "products"]],
  [/tin|blog|cam nang|bai viet|kien thuc|su kien/, ["blog"]],
  [/bac si|doi ngu|giang vien|hlv|huan luyen|tho|stylist|chuyen gia|nhan su/, ["team"]],
  [/lich|thoi khoa bieu|khung gio/, ["schedule", "booking"]],
  [/tien do|lich trinh|hanh trinh/, ["timeline"]],
  [/gioi thieu|ve chung toi|cau chuyen|tong quan/, ["about", "features"]],
  [/tien ich|tien nghi|vi sao/, ["features"]],
  [/hinh anh|thu vien|tac pham|khong gian|phoi canh|anh/, ["gallery"]],
  [/danh muc|nganh|chuyen khoa|dong xe|bo mon/, ["categories", "features"]],
  [/danh gia|cam nhan|khach hang/, ["reviews"]],
  [/hoi dap|faq|cau hoi/, ["faq"]],
  [/quy trinh|lo trinh|cach/, ["steps"]],
];

const anchorOf = (c: PlacedComponent) => `khoi-${c.type}`;

/** Gắn mỗi mục menu với một khối trên trang để bấm là cuộn tới (khớp theo tên khối, rồi theo từ khoá). */
function navTargets(nav: string[], blocks: PlacedComponent[]): string[] {
  const used = new Set<string>();
  const title = (c: PlacedComponent) => normalizeVi(c.props.title || getComponentDef(c.type)?.name || "");
  return nav.map((item) => {
    const n = normalizeVi(item);
    const free = blocks.filter((c) => c.type !== "hero" && !used.has(c.uid));
    const words = n.split(/\s+/).filter((w) => w.length > 2);
    let hit = free.find((c) => title(c).includes(n) || (words.length > 0 && words.every((w) => title(c).includes(w))));
    if (!hit) for (const [re, types] of NAV_HINTS) if (re.test(n) && (hit = types.map((t) => free.find((c) => c.type === t)).find(Boolean))) break;
    hit ??= free.find((c) => c.type === "products") ?? free.find((c) => c.type === "categories") ?? free[0];
    if (!hit) return "#noi-dung";
    used.add(hit.uid);
    return `#${anchorOf(hit)}`;
  });
}

/**
 * Toàn bộ trang của một mẫu trong kho, dựng từ đúng các khối mà web khách nhận được
 * (banner, điểm nổi bật, sản phẩm, đặt lịch, hỏi đáp...). Chỉ để xem: form không gửi, giá bị che.
 */
export function TemplatePage({ project: base }: { project: Project }) {
  const params = useSearchParams();
  const variant = params.get("giao-dien");
  const project = useMemo(() => applyVariant(base, variant), [base, variant]);
  const regions = useMemo<SiteRegions>(() => {
    const r = emptyRegions();
    r.main = templateBlocks(base, new Set(), (i) => `xem-${i}`);
    const kind = getCategory(base.category)?.kind ?? "shop";
    r.header = (HEADER_BY_KIND[kind] ?? []).map((type) => ({ uid: `xem-${type}`, type, props: {} }));
    return r;
  }, [base]);
  const products = useMemo(() => sampleProducts(base), [base]);
  const links = useMemo(() => navTargets(project.nav, regions.main), [project.nav, regions.main]);
  const firstPlace = useMemo(() => {
    const loc = regions.main.find((c) => c.type === "locations");
    const row = (loc?.props.items ?? "").split("\n")[0]?.split("|").map((x) => x.trim()) ?? [];
    return { addr: row[1] || "Số 1 Đường Mẫu, Quận 1, TP.HCM", hours: row[2] || "8:00 – 21:00 mỗi ngày", phone: row[3] || "0900 000 000" };
  }, [regions.main]);
  const placed = useMemo(() => placedTypes(regions), [regions]);
  const mainAction = placed.has("booking")
    ? { href: "#dat-lich", label: "Đặt lịch" }
    : placed.has("cart")
      ? { href: "#san-pham", label: "Mua ngay" }
      : placed.has("contact")
        ? { href: "#lien-he", label: "Nhận tư vấn" }
        : { href: "#noi-dung", label: "Xem ngay" };

  const list = (rid: RegionId, cls: string) =>
    regions[rid].length ? (
      <div className={cls}>
        {regions[rid].map((c: PlacedComponent) => (
          <div key={c.uid || newUid()} id={rid === "main" ? anchorOf(c) : undefined} className={rid === "main" ? "scroll-mt-28" : undefined}>
            {renderBlock(c)}
          </div>
        ))}
      </div>
    ) : null;

  return (
    <SiteRuntimeProvider siteId={`xem-${base.slug}`} project={project} products={products} placed={placed} user={null} editing={false} preview>
      <div className="wsite wm-mask-prices flex min-h-dvh flex-col pb-16 md:pb-0" style={themeVars(project)}>
        <div style={{ background: solidAccent(project.palette.accent) }} className="px-4 py-2 text-center text-sm font-medium text-white">
          {maskMoney(project.announcement)}
        </div>
        <header className="sticky top-0 z-20 border-b border-[color-mix(in_srgb,var(--fg)_10%,transparent)] bg-[var(--bg)]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4">
            <span className="ws-h text-2xl">
              {project.name}
              <span className="ws-accent">.</span>
            </span>
            <nav className="ws-muted hidden gap-6 text-[15px] lg:flex">
              {project.nav.map((n, i) => (
                <a key={n} href={links[i]} className="transition hover:text-[var(--fg)]">
                  {n}
                </a>
              ))}
            </nav>
            <div className="ml-auto">{list("header", "flex flex-wrap items-center gap-2")}</div>
          </div>
          {/* Điện thoại: menu cuộn ngang ngay dưới tên, bấm là tới phần tương ứng */}
          <nav className="ws-muted -mt-1 flex gap-2 overflow-x-auto px-4 pb-3 text-sm [scrollbar-width:none] lg:hidden">
            {project.nav.map((n, i) => (
              <a key={n} href={links[i]} className="ws-soft shrink-0 px-3 py-1.5 font-medium whitespace-nowrap">
                {n}
              </a>
            ))}
          </nav>
        </header>
        <main id="noi-dung" className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-16">{list("main", "space-y-16 sm:space-y-20")}</main>
        <footer className="border-t border-[color-mix(in_srgb,var(--fg)_10%,transparent)] bg-[color-mix(in_srgb,var(--fg)_3%,var(--bg))]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="space-y-3">
              <div className="ws-h text-xl">
                {project.name}
                <span className="ws-accent">.</span>
              </div>
              <p className="ws-muted max-w-xs leading-relaxed">{project.summary}</p>
            </div>
            <div className="space-y-2">
              <div className="font-semibold">Khám phá</div>
              {project.nav.map((n, i) => (
                <a key={n} href={links[i]} className="ws-muted block hover:text-[var(--fg)]">
                  {n}
                </a>
              ))}
            </div>
            <div className="ws-muted space-y-2">
              <div className="font-semibold text-[var(--fg)]">Liên hệ</div>
              <p>{firstPlace.addr}</p>
              <p>Hotline: {firstPlace.phone}</p>
              <p>Giờ mở cửa: {firstPlace.hours}</p>
            </div>
            <div className="ws-muted space-y-2">
              <div className="font-semibold text-[var(--fg)]">Chính sách</div>
              <p>Chính sách bảo mật</p>
              <p>Điều khoản sử dụng</p>
              <p>Hướng dẫn thanh toán</p>
            </div>
          </div>
          <div className="ws-muted border-t border-[color-mix(in_srgb,var(--fg)_8%,transparent)] px-4 py-4 text-center text-xs">© {new Date().getFullYear()} {project.name}. Bản xem trước của mẫu.</div>
        </footer>
        {/* Điện thoại: thanh hành động dính đáy màn hình như web bán hàng, phòng khám ở VN (gọi + hành động chính). */}
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-[color-mix(in_srgb,var(--fg)_10%,transparent)] bg-[var(--bg)]/95 p-2.5 backdrop-blur md:hidden">
          <a href={`tel:${firstPlace.phone.replace(/\s/g, "")}`} className="ws-btn-ghost flex-1 !py-2.5 text-sm">
            <Phone className="size-4" /> Gọi ngay
          </a>
          <a href={mainAction.href} className="ws-btn flex-[1.4] !py-2.5 text-sm">
            {mainAction.label}
          </a>
        </div>
        {placed.has("cart") && <CartDrawer />}
        {placed.has("login") && <LoginModal />}
      </div>
    </SiteRuntimeProvider>
  );
}
