"use client";

import Link from "next/link";
import { use, useState } from "react";
import { OrderSummary } from "@/components/order-summary";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Spinner } from "@/components/ui/misc";
import { useToast } from "@/context/toast-context";
import { getOrder, updateOrderStatus } from "@/lib/data/orders";
import { ORDER_STATUS_LABELS } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { useAsync } from "@/lib/use-async";

/** Các bước chuyển trạng thái hợp lệ. */
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const { data: order, loading, reload } = useAsync(() => getOrder(id), id);
  const [busy, setBusy] = useState<OrderStatus | null>(null);

  if (loading && !order) return <Spinner />;
  if (!order) return <EmptyState title="Không tìm thấy đơn hàng" />;

  const change = async (status: OrderStatus) => {
    if (status === "cancelled" && !confirm("Hủy đơn này? Tồn kho sẽ được hoàn lại.")) return;
    setBusy(status);
    try {
      await updateOrderStatus(order.id, status);
      toast(`Đã chuyển sang "${ORDER_STATUS_LABELS[status]}"`);
      reload();
    } catch (err) {
      toast((err as Error).message || "Không cập nhật được trạng thái", "error");
    } finally {
      setBusy(null);
    }
  };

  const actions = NEXT_STATUS[order.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Đơn hàng #{order.id.slice(0, 8).toUpperCase()}</h1>
        <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">Quay lại</Link>
      </div>
      <OrderSummary
        order={order}
        actions={
          <Card className="space-y-3 p-4">
            <h2 className="font-semibold">Xử lý đơn</h2>
            <div className="text-sm text-muted-foreground">Khách: {order.userEmail}</div>
            {actions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Đơn đã kết thúc, không thể đổi trạng thái.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {actions.map((s) => (
                  <Button
                    key={s}
                    variant={s === "cancelled" ? "outline" : "primary"}
                    className={s === "cancelled" ? "text-red-600" : ""}
                    loading={busy === s}
                    disabled={busy !== null}
                    onClick={() => change(s)}
                  >
                    {s === "cancelled" ? "Hủy đơn" : `Chuyển sang: ${ORDER_STATUS_LABELS[s]}`}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        }
      />
    </div>
  );
}
