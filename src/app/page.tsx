import { BuilderForm } from "@/components/builder/builder-form";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <SiteHeader>
        <Link href="/result" className="rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
          Kết quả
        </Link>
      </SiteHeader>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="mb-8 max-w-2xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tạo website bán hàng{" "}
            <span className="bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">bằng AI</span>
          </h1>
          <p className="text-muted-foreground">
            Chọn loại web, theme, nhập thông tin cửa hàng. Web Master gọi Gemini để viết toàn bộ mã nguồn React + Tailwind + Firebase,
            gồm cả trang bán hàng và trang quản trị.
          </p>
        </div>
        <BuilderForm />
      </main>
    </>
  );
}
