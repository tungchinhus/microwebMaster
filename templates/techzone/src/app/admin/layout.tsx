import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Spinner } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // AdminShell đọc pathname, nên cần Suspense để các route động vẫn prerender được.
  return (
    <Suspense fallback={<Spinner />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
