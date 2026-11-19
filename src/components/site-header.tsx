import { LayoutTemplate, Menu } from "lucide-react";
import Link from "next/link";
import { SITE } from "@/config/site";

const NAV = [
  { href: "/kho", label: "Mẫu web" },
  { href: "/#bang-gia", label: "Bảng giá" },
  { href: "/tao-web", label: "Tự tạo bằng AI" },
  { href: "/#hoi-dap", label: "Hỏi đáp" },
];

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 rounded-full border border-border/60 bg-card/90 pr-2 pl-4 sm:gap-6 sm:pl-5 shadow-sm shadow-black/[0.03] backdrop-blur">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-lg font-bold tracking-tight whitespace-nowrap">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LayoutTemplate className="size-4" />
          </span>
          {SITE.name}
        </Link>
        <nav className="hidden items-center gap-1 text-[15px] md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-3.5 py-2 text-foreground/80 transition hover:bg-muted hover:text-foreground">
              {n.label}
            </Link>
          ))}
          {children}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/bao-gia"
            className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold whitespace-nowrap text-primary-foreground transition hover:brightness-110 sm:h-12 sm:px-6 sm:text-[15px]"
          >
            Xin báo giá
          </Link>
          <details className="group relative md:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full hover:bg-muted [&::-webkit-details-marker]:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Mở menu</span>
            </summary>
            <nav className="absolute top-14 right-0 flex w-56 flex-col rounded-2xl border border-border bg-card p-2 shadow-xl">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-xl px-4 py-3 text-[15px] hover:bg-muted">
                  {n.label}
                </Link>
              ))}
              {children}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2.5 text-lg font-bold">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LayoutTemplate className="size-4" />
            </span>
            {SITE.name}
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{SITE.tagline}. Giá cố định, bàn giao trong {SITE.deliveryDays}.</p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="font-semibold">Khám phá</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link href="/kho" className="hover:text-foreground">Kho mẫu web</Link></li>
            <li><Link href="/#bang-gia" className="hover:text-foreground">Bảng giá</Link></li>
            <li><Link href="/tao-web" className="hover:text-foreground">Tự tạo bằng AI</Link></li>
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <div className="font-semibold">Liên hệ</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href={`mailto:${SITE.contactEmail}`} className="hover:text-foreground">{SITE.contactEmail}</a></li>
            {SITE.zaloPhone && <li>Zalo: {SITE.zaloPhone}</li>}
            <li><Link href="/bao-gia" className="hover:text-foreground">Gửi yêu cầu báo giá</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">© {SITE.name}. Mọi mẫu trong kho đều có thể đổi màu, nội dung và tính năng.</div>
    </footer>
  );
}
