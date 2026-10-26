import type { Metadata } from "next";
import Link from "next/link";
import { ResultView } from "@/components/result/result-view";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Kết quả" };

export default function ResultPage() {
  return (
    <>
      <SiteHeader>
        <Link href="/" className="rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
          Cấu hình
        </Link>
      </SiteHeader>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <ResultView />
      </main>
    </>
  );
}
