"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/admin/admin-shell";
import { Input } from "@/components/ui/form";
import { Card, ErrorMessage, OrderStatusBadge, Spinner } from "@/components/ui/misc";
import { listAllOrders } from "@/lib/data/orders";
import { ORDER_STATUS_LABELS, formatDate, formatPrice, slugify } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { useAsync } from "@/lib/use-async";

export default function AdminOrdersPage() {
  const { data: orders, loading, error } = useAsync(listAllOrders, "admin-orders");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const o of orders ?? []) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const needle = slugify(q);
    return (orders ?? []).filter(
      (o) =>
        (!status || o.status === status) &&
        (!needle || slugify(`${o.id} ${o.shipping.fullName} ${o.shipping.phone} ${o.userEmail}`).includes(needle)),
    );
  }, [orders, status, q]);

  const tab = (value: OrderStatus | "", label: string, count: number) => (
    <button
      key={value || "all"}
      type="button"
      onClick={() => setStatus(value)}
      className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
        status === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      }`}
    >
      {label} <span className="opacity-70">({count})</span>
    </button>
  );

  return (
    <div>
      <PageHeader title="Đơn hàng" />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {tab("", "Tất cả", orders?.length ?? 0)}
          {ORDER_STATUSES.map((s) => tab(s, ORDER_STATUS_LABELS[s], counts[s] ?? 0))}
        </div>
        <Input className="lg:max-w-xs" placeholder="Mã đơn, tên, SĐT, email..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm đơn hàng" />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage>Không tải được đơn hàng.</ErrorMessage>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.shipping.fullName}</div>
                    <div className="text-xs text-muted-foreground">{o.shipping.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Không có đơn hàng.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
