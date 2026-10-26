"use client";

import { LayoutDashboard, LogOut, Package, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { storeConfig } from "@/config/store";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";

function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm sản phẩm..."
        aria-label="Tìm sản phẩm"
        className="h-10 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </form>
  );
}

function UserMenu() {
  const { user, profile, isAdmin, logout, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (loading) return <div className="size-9 animate-pulse rounded-full bg-muted" />;
  if (!user) {
    return (
      <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
        Đăng nhập
      </Link>
    );
  }

  const name = profile?.displayName || user.email || "Tài khoản";
  const item = "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted";
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Menu tài khoản"
        className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
      >
        {name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg">
          <div className="truncate px-3 py-2 text-sm font-medium">{name}</div>
          <hr className="my-1" />
          <Link href="/account" className={item} onClick={() => setOpen(false)}>
            <User className="size-4" /> Tài khoản
          </Link>
          <Link href="/orders" className={item} onClick={() => setOpen(false)}>
            <Package className="size-4" /> Đơn hàng của tôi
          </Link>
          {isAdmin && (
            <Link href="/admin" className={item} onClick={() => setOpen(false)}>
              <LayoutDashboard className="size-4" /> Trang quản trị
            </Link>
          )}
          <button
            type="button"
            className={`${item} text-red-600`}
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
          >
            <LogOut className="size-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { count, ready } = useCart();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            {storeConfig.name.charAt(0)}
          </span>
          <span>{storeConfig.name}</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link href="/" className="rounded-lg px-3 py-2 hover:bg-muted">
            Trang chủ
          </Link>
          <Link href="/products" className="rounded-lg px-3 py-2 hover:bg-muted">
            Sản phẩm
          </Link>
        </nav>
        <SearchBox className="ml-auto hidden w-full max-w-sm sm:block" />
        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <ThemeToggle />
          <Link
            href="/cart"
            aria-label="Giỏ hàng"
            className="relative inline-flex size-9 items-center justify-center rounded-lg hover:bg-muted"
          >
            <ShoppingCart className="size-5" />
            {ready && count > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          <UserMenu />
        </div>
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
