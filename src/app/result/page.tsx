import type { Metadata } from "next";
import Link from "next/link";
import { ResultView } from "@/components/result/result-view";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Kết quả" };

export default function ResultPage() {
  return (
    <>
      <SiteHeader>
        <Link href="/tao-web" className="rounded-full px-3.5 py-2 text-foreground/80 hover:bg-muted hover:text-foreground">
          Cấu hình
        </Link>
      </SiteHeader>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <ResultView />
      </main>
    </>
  );
}
