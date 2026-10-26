"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/admin/admin-shell";
import { Input } from "@/components/ui/form";
import { Card, ErrorMessage, Spinner } from "@/components/ui/misc";
import { listAllOrders } from "@/lib/data/orders";
import { listUsers } from "@/lib/data/users";
import { formatDate, formatPrice, slugify } from "@/lib/format";
import { useAsync } from "@/lib/use-async";

async function load() {
  const [users, orders] = await Promise.all([listUsers(), listAllOrders()]);
  return { users, orders };
}

export default function AdminCustomersPage() {
  const { data, loading, error } = useAsync(load, "admin-customers");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!data) return [];
    const stats = new Map<string, { count: number; spent: number }>();
    for (const o of data.orders) {
      const s = stats.get(o.userId) ?? { count: 0, spent: 0 };
      s.count += 1;
      if (o.status === "completed") s.spent += o.total;
      stats.set(o.userId, s);
    }
    const needle = slugify(q);
    return data.users
      .filter((u) => !needle || slugify(`${u.displayName} ${u.email} ${u.phone}`).includes(needle))
      .map((u) => ({ ...u, ...(stats.get(u.uid) ?? { count: 0, spent: 0 }) }));
  }, [data, q]);

  return (
    <div>
      <PageHeader title="Khách hàng" description={data ? `${data.users.length} tài khoản` : undefined} />
      <Input className="mb-4 max-w-sm" placeholder="Tìm theo tên, email, SĐT..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm khách hàng" />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage>Không tải được danh sách khách hàng.</ErrorMessage>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Điện thoại</th>
                <th className="px-4 py-3">Ngày tham gia</th>
                <th className="px-4 py-3 text-right">Số đơn</th>
                <th className="px-4 py-3 text-right">Đã chi (hoàn thành)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((u) => (
                <tr key={u.uid} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {u.displayName || "(chưa đặt tên)"}
                      {u.role === "admin" && <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">Admin</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">{u.phone || "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">{u.count}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(u.spent)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Không có khách hàng.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
