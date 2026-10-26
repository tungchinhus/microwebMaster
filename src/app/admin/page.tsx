"use client";

import { AlertTriangle, DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { PageHeader } from "@/components/admin/admin-shell";
import { Card, ErrorMessage, OrderStatusBadge, Spinner } from "@/components/ui/misc";
import { listAllOrders } from "@/lib/data/orders";
import { listAllProducts } from "@/lib/data/products";
import { listUsers } from "@/lib/data/users";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order, Product, UserProfile } from "@/lib/types";
import { useAsync } from "@/lib/use-async";

const LOW_STOCK = 5;
const DAY = 24 * 60 * 60 * 1000;

function Stat({ icon: Icon, label, value, hint }: { icon: typeof Package; label: string; value: string; hint?: string }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-xl font-bold">{value}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
    </Card>
  );
}

function RevenueChart({ orders }: { orders: Order[] }) {
  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const from = start.getTime() - (6 - i) * DAY;
      const total = orders
        .filter((o) => o.status !== "cancelled" && o.createdAt && o.createdAt >= from && o.createdAt < from + DAY)
        .reduce((s, o) => s + o.total, 0);
      return { label: new Date(from).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit" }), total };
    });
  }, [orders]);
  const max = Math.max(...days.map((d) => d.total), 1);

  return (
    <Card className="p-5">
      <h2 className="mb-4 font-semibold">Doanh thu 7 ngày qua</h2>
      <div className="flex h-48 items-end gap-2">
        {days.map((d) => (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full max-w-12 rounded-t-md bg-primary transition-all"
              style={{ height: `${Math.max((d.total / max) * 100, d.total ? 4 : 1)}%` }}
              title={formatPrice(d.total)}
            />
            <span className="text-xs text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

async function loadDashboard(): Promise<{ orders: Order[]; products: Product[]; users: UserProfile[] }> {
  const [orders, products, users] = await Promise.all([listAllOrders(), listAllProducts(), listUsers()]);
  return { orders, products, users };
}

export default function AdminDashboard() {
  const { data, loading, error } = useAsync(loadDashboard, "dashboard");

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorMessage>Không tải được dữ liệu. Kiểm tra quyền admin và Firestore index.</ErrorMessage>;

  const { orders, products, users } = data;
  const valid = orders.filter((o) => o.status !== "cancelled");
  const revenue = orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter((p) => p.active && p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock);

  return (
    <div className="space-y-6">
      <PageHeader title="Tổng quan" description="Tình hình kinh doanh của cửa hàng" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={DollarSign} label="Doanh thu (đơn hoàn thành)" value={formatPrice(revenue)} />
        <Stat icon={ShoppingBag} label="Đơn hàng" value={String(valid.length)} hint={`${pending} đơn chờ xác nhận`} />
        <Stat icon={Package} label="Sản phẩm" value={String(products.length)} hint={`${products.filter((p) => p.active).length} đang bán`} />
        <Stat icon={Users} label="Khách hàng" value={String(users.filter((u) => u.role === "customer").length)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <RevenueChart orders={orders} />
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4 text-amber-500" /> Sắp hết hàng
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tồn kho đều ổn.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lowStock.slice(0, 8).map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <Link href={`/admin/products/${p.id}`} className="truncate hover:text-primary">{p.name}</Link>
                  <span className={p.stock === 0 ? "font-semibold text-red-600" : "text-amber-600"}>{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="font-semibold">Đơn hàng mới nhất</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">Xem tất cả</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id} className="hover:bg-muted/50">
                  <td className="px-5 py-3 font-mono"><Link href={`/admin/orders/${o.id}`} className="hover:text-primary">#{o.id.slice(0, 8).toUpperCase()}</Link></td>
                  <td className="px-5 py-3">{o.shipping.fullName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-right font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td className="px-5 py-6 text-center text-muted-foreground" colSpan={5}>Chưa có đơn hàng.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
