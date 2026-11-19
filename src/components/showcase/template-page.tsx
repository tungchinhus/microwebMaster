"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CartDrawer, LoginModal, renderBlock } from "@/components/sites/site-blocks";
import { themeVars } from "@/components/sites/site-page";
import { SiteRuntimeProvider } from "@/components/sites/site-runtime";
import type { ComponentType, RegionId } from "@/lib/sites/components";
import { templateBlocks } from "@/lib/sites/layouts";
import { sampleProducts } from "@/lib/sites/products";
import { emptyRegions, newUid, placedTypes, type PlacedComponent, type SiteRegions } from "@/lib/sites/types";
import { applyVariant, getCategory, type Project } from "@/lib/showcase/catalog";
import { maskMoney } from "./mini-site";

/** Nút đầu trang có sẵn trong bản xem trước theo lĩnh vực (bán hàng thì có tìm kiếm và giỏ hàng). */
const HEADER_BY_KIND: Partial<Record<string, ComponentType[]>> = { shop: ["search", "cart"] };

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
  const placed = useMemo(() => placedTypes(regions), [regions]);

  const list = (rid: RegionId, cls: string) =>
    regions[rid].length ? (
      <div className={cls}>
        {regions[rid].map((c: PlacedComponent) => (
          <div key={c.uid || newUid()}>{renderBlock(c)}</div>
        ))}
      </div>
    ) : null;

  return (
    <SiteRuntimeProvider siteId={`xem-${base.slug}`} project={project} products={products} placed={placed} user={null} editing={false} preview>
      <div className="wsite wm-mask-prices flex min-h-dvh flex-col" style={themeVars(project)}>
        <div style={{ background: project.palette.accent }} className="px-4 py-2 text-center text-sm font-medium text-white">
          {maskMoney(project.announcement)}
        </div>
        <header className="sticky top-0 z-20 border-b border-[color-mix(in_srgb,var(--fg)_10%,transparent)] bg-[var(--bg)]">
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
            <div className="ml-auto">{list("header", "flex flex-wrap items-center gap-2")}</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-12">{list("main", "space-y-14")}</main>
        <footer className="border-t border-[color-mix(in_srgb,var(--fg)_10%,transparent)]">
          <div className="ws-muted mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-4 py-10 text-sm">
            <span>© {project.name}</span>
            <span>{project.nav.join(" · ")}</span>
          </div>
        </footer>
        {placed.has("cart") && <CartDrawer />}
        {placed.has("login") && <LoginModal />}
      </div>
    </SiteRuntimeProvider>
  );
}
