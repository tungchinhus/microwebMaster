"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use } from "react";
import { OrderSummary } from "@/components/order-summary";
import { RequireAuth } from "@/components/require-auth";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { useAuth } from "@/context/auth-context";
import { getOrder } from "@/lib/data/orders";
import { useAsync } from "@/lib/use-async";

function OrderContent({ id }: { id: string }) {
  const { user } = useAuth();
  const success = useSearchParams().get("success") === "1";
  const { data: order, loading } = useAsync(() => getOrder(id).catch(() => null), user ? id : null);

  if (loading) return <Spinner />;
  if (!order) return <EmptyState title="Không tìm thấy đơn hàng" />;

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="size-6 shrink-0" />
          <div>
            <div className="font-semibold">Đặt hàng thành công!</div>
            <div className="text-sm">Chúng tôi sẽ gọi điện xác nhận đơn trong thời gian sớm nhất.</div>
          </div>
        </div>
      )}
      <OrderSummary order={order} />
    </div>
  );
}

export function OrderView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        <Link href="/orders" className="text-sm font-medium text-primary hover:underline">
          Tất cả đơn hàng
        </Link>
      </div>
      <RequireAuth>
        <OrderContent id={id} />
      </RequireAuth>
    </div>
  );
}
