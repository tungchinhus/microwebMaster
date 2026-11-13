import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/showcase/catalog-browser";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Kho mẫu web" };

export default function CatalogPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-14">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">Kho mẫu</h1>
        <p className="mt-5 mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Web mẫu do đội {SITE.name} dựng. Muốn web tương tự cho bạn? Gửi yêu cầu, chúng tôi báo giá trong ngày.
        </p>
        <Suspense fallback={<div className="h-96" />}>
          <CatalogBrowser />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
