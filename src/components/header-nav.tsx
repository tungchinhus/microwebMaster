"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export const NAV = [
  { href: "/kho", label: "Mẫu web" },
  { href: "/#bang-gia", label: "Bảng giá" },
  { href: "/tao-web", label: "Tự tạo bằng AI" },
  { href: "/#hoi-dap", label: "Hỏi đáp" },
];

/** Mục đang xem được tô đậm và đánh dấu aria-current để khách biết mình đang ở đâu (kể cả trang con /mau, /demo). */
function useActive() {
  const path = usePathname();
  return (href: string) => {
    if (href.includes("#")) return false;
    if (href === "/kho") return path === "/kho" || path.startsWith("/mau/") || path.startsWith("/so-sanh");
    return path === href || path.startsWith(`${href}/`);
  };
}

type IsActive = (href: string) => boolean;
const never: IsActive = () => false;

/** Bọc trong Suspense: đường dẫn hiện tại chỉ biết khi chạy, lúc dựng sẵn thì hiện menu không tô mục nào. */
export function DesktopNav() {
  return (
    <Suspense fallback={<DesktopLinks isActive={never} />}>
      <WithActive render={(isActive) => <DesktopLinks isActive={isActive} />} />
    </Suspense>
  );
}

export function MobileNav() {
  return (
    <Suspense fallback={<MobileLinks isActive={never} />}>
      <WithActive render={(isActive) => <MobileLinks isActive={isActive} />} />
    </Suspense>
  );
}

function WithActive({ render }: { render: (isActive: IsActive) => React.ReactNode }) {
  return render(useActive());
}

function DesktopLinks({ isActive }: { isActive: IsActive }) {
  return NAV.map((n) => {
    const active = isActive(n.href);
    return (
      <Link
        key={n.href}
        href={n.href}
        aria-current={active ? "page" : undefined}
        className={`rounded-full px-3.5 py-2 transition hover:bg-muted hover:text-foreground ${active ? "bg-muted font-semibold text-foreground" : "text-foreground/80"}`}
      >
        {n.label}
      </Link>
    );
  });
}

function MobileLinks({ isActive }: { isActive: IsActive }) {
  return NAV.map((n) => {
    const active = isActive(n.href);
    return (
      <Link
        key={n.href}
        href={n.href}
        aria-current={active ? "page" : undefined}
        // Đóng menu (thẻ <details>) sau khi bấm, kể cả với liên kết cùng trang như #bang-gia.
        onClick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")}
        className={`rounded-xl px-4 py-3 text-[15px] hover:bg-muted ${active ? "bg-muted font-semibold" : ""}`}
      >
        {n.label}
      </Link>
    );
  });
}
