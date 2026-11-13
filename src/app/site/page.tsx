import type { Metadata } from "next";
import { Suspense } from "react";
import { SitePage } from "@/components/sites/site-page";

export const metadata: Metadata = { title: "Website", robots: { index: false } };

/** Web của từng khách hàng: /site?id=<mã web>. Dùng query để vẫn xuất được trang tĩnh. */
export default function CustomerSitePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <SitePage />
    </Suspense>
  );
}
