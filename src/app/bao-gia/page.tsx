import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteForm } from "@/components/showcase/quote-form";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Xin báo giá" };

export default function QuotePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-14">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">Xin báo giá</h1>
        <p className="mt-5 mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Cho chúng tôi biết bạn cần gì. Báo giá cố định, không phát sinh nếu không đổi phạm vi.
        </p>
        <Suspense fallback={<div className="h-96" />}>
          <QuoteForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
