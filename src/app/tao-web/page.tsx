import type { Metadata } from "next";
import Link from "next/link";
import { BuilderForm } from "@/components/builder/builder-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Tự tạo website bằng AI" };

export default function BuilderPage() {
  return (
    <>
      <SiteHeader>
        <Link href="/result" className="rounded-full px-3.5 py-2 text-foreground/80 hover:bg-muted hover:text-foreground">
          Kết quả
        </Link>
      </SiteHeader>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <div className="mb-8 max-w-2xl space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Tự tạo website bằng AI</h1>
          <p className="text-lg text-muted-foreground">
            Chọn loại web, theme, nhập thông tin cửa hàng. Web Master gọi Gemini để viết toàn bộ mã nguồn React + Tailwind + Firebase,
            gồm cả trang bán hàng và trang quản trị. Muốn chúng tôi làm giúp?{" "}
            <Link href="/bao-gia" className="font-medium text-primary underline underline-offset-4">
              Gửi yêu cầu báo giá
            </Link>
            .
          </p>
        </div>
        <BuilderForm />
      </main>
    </>
  );
}
