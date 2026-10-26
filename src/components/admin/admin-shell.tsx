"use client";

import { FolderTree, LayoutDashboard, Menu, Package, ShoppingBag, Store, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { RequireAuth } from "@/components/require-auth";
import { storeConfig } from "@/config/store";
import { useAuth } from "@/context/auth-context";

const nav = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { href: "/admin/customers", label: "Khách hàng", icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      <Link href="/admin" className="mb-4 flex items-center gap-2 px-2 py-1 text-lg font-bold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          {storeConfig.name.charAt(0)}
        </span>
        {storeConfig.name} Admin
      </Link>
      {nav.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-border pt-3">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
          <Store className="size-4" /> Xem cửa hàng
        </Link>
      </div>
    </nav>
  );

  return (
    <RequireAuth admin>
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-border bg-card lg:block">{sidebar}</aside>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64 bg-card shadow-xl">{sidebar}</aside>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur">
            <button type="button" className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="Mở menu" onClick={() => setOpen(true)}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <ThemeToggle />
              <span className="hidden text-muted-foreground sm:inline">{profile?.displayName || profile?.email}</span>
              <button type="button" onClick={logout} className="rounded-lg px-3 py-1.5 text-red-600 hover:bg-muted">
                Đăng xuất
              </button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
