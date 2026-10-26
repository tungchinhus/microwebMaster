"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/require-auth";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, ErrorMessage, OrderStatusBadge, Spinner } from "@/components/ui/misc";
import { useAuth } from "@/context/auth-context";
import { listMyOrders } from "@/lib/data/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { useAsync } from "@/lib/use-async";

function MyOrders() {
  const { user } = useAuth();
  const { data: orders, loading, error } = useAsync(() => listMyOrders(user!.uid), user?.uid ?? null);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage>Không tải được đơn hàng, vui lòng thử lại.</ErrorMessage>;
  if (!orders?.length) {
    return <EmptyState title="Bạn chưa có đơn hàng nào" action={<ButtonLink href="/products">Mua sắm ngay</ButtonLink>} />;
  }
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Link key={o.id} href={`/orders/${o.id}`} className="block">
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:border-primary">
            <div>
              <div className="font-mono text-sm font-medium">#{o.id.slice(0, 8).toUpperCase()}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} sản phẩm
              </div>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={o.status} />
              <span className="font-semibold">{formatPrice(o.total)}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
      <RequireAuth>
        <MyOrders />
      </RequireAuth>
    </div>
  );
}
