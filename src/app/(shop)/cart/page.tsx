"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { ButtonLink } from "@/components/ui/button";
import { Card, EmptyState, Spinner } from "@/components/ui/misc";
import { storeConfig } from "@/config/store";
import { useCart } from "@/context/cart-context";
import { calcShippingFee, formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, ready, subtotal, setQuantity, remove } = useCart();

  if (!ready) return <Spinner />;
  if (items.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        description="Hãy chọn vài sản phẩm bạn thích nhé."
        action={<ButtonLink href="/products">Tiếp tục mua sắm</ButtonLink>}
      />
    );
  }

  const shippingFee = calcShippingFee(subtotal);
  const remaining = storeConfig.freeShippingThreshold - subtotal;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Giỏ hàng</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4">
              <Link href={`/products/${item.productId}`} className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <ProductImage src={item.image} alt={item.name} sizes="80px" />
              </Link>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <Link href={`/products/${item.productId}`} className="line-clamp-2 text-sm font-medium hover:text-primary">
                    {item.name}
                  </Link>
                  <div className="text-sm text-muted-foreground">{formatPrice(item.price)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-border">
                    <button type="button" aria-label="Giảm" className="p-2 hover:bg-muted" onClick={() => setQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button type="button" aria-label="Tăng" className="p-2 hover:bg-muted" onClick={() => setQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <div className="w-28 text-right text-sm font-semibold">{formatPrice(item.price * item.quantity)}</div>
                  <button type="button" aria-label="Xóa" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-red-600" onClick={() => remove(item.productId)}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card className="h-fit space-y-3 p-5">
          <h2 className="font-semibold">Tóm tắt đơn hàng</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Phí vận chuyển</span>
            <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
          </div>
          {remaining > 0 && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
              Mua thêm {formatPrice(remaining)} để được miễn phí vận chuyển.
            </p>
          )}
          <div className="flex justify-between border-t border-border pt-3 font-semibold">
            <span>Tổng cộng</span>
            <span className="text-primary">{formatPrice(subtotal + shippingFee)}</span>
          </div>
          <ButtonLink href="/checkout" size="lg" className="w-full">
            Tiến hành đặt hàng
          </ButtonLink>
          <p className="text-center text-xs text-muted-foreground">Giá cuối cùng được xác nhận khi đặt hàng.</p>
        </Card>
      </div>
    </div>
  );
}
