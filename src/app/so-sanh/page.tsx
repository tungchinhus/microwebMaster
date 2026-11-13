import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareView } from "@/components/showcase/compare-view";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "So sánh mẫu" };

export default function ComparePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-14">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">So sánh mẫu</h1>
        <p className="mt-5 mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Đặt 2 đến 3 mẫu cạnh nhau để xem khác nhau ở tính năng, giao diện và giá.
        </p>
        <Suspense fallback={<div className="h-96" />}>
          <CompareView />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
