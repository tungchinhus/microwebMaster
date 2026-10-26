import { ProductImage } from "@/components/product-image";
import { Card, OrderStatusBadge } from "@/components/ui/misc";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";

/** Chi tiết một đơn hàng, dùng chung cho khách và admin. */
export function OrderSummary({ order, actions }: { order: Order; actions?: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="divide-y divide-border">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <div className="font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</div>
            <div className="text-xs text-muted-foreground">Đặt lúc {formatDate(order.createdAt)}</div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3 p-4 text-sm">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
              <ProductImage src={item.image} alt={item.name} sizes="56px" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-muted-foreground">
                {formatPrice(item.price)} x {item.quantity}
              </div>
            </div>
            <div className="font-semibold">{formatPrice(item.price * item.quantity)}</div>
          </div>
        ))}
        <div className="space-y-1.5 p-4 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Vận chuyển</span><span>{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</span></div>
          <div className="flex justify-between text-base font-semibold"><span>Tổng cộng</span><span className="text-primary">{formatPrice(order.total)}</span></div>
        </div>
      </Card>
      <div className="space-y-4">
        <Card className="space-y-2 p-4 text-sm">
          <h2 className="font-semibold">Giao đến</h2>
          <div>{order.shipping.fullName}</div>
          <div>{order.shipping.phone}</div>
          <div className="text-muted-foreground">{order.shipping.address}</div>
          {order.shipping.note && <div className="text-muted-foreground">Ghi chú: {order.shipping.note}</div>}
          <div className="border-t border-border pt-2 text-muted-foreground">Thanh toán khi nhận hàng (COD)</div>
        </Card>
        {actions}
      </div>
    </div>
  );
}
