import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminConsole } from "@/components/sites/admin-console";
import { SiteFooter, SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Quản trị web khách hàng", robots: { index: false } };

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-14">
        <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">Quản trị</h1>
        <Suspense fallback={<div className="h-96" />}>
          <AdminConsole />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
