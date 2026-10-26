"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { RequireAuth } from "@/components/require-auth";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Card, EmptyState, ErrorMessage } from "@/components/ui/misc";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { placeOrder } from "@/lib/data/orders";
import { calcShippingFee, formatPrice } from "@/lib/format";
import { shippingSchema } from "@/lib/order-schema";

type Errors = Partial<Record<"fullName" | "phone" | "address" | "note", string>>;

function CheckoutForm() {
  const router = useRouter();
  const { profile } = useAuth();
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState({
    fullName: profile?.displayName ?? "",
    phone: profile?.phone ?? "",
    address: "",
    note: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return <EmptyState title="Giỏ hàng trống" action={<ButtonLink href="/products">Mua sắm ngay</ButtonLink>} />;
  }

  const shippingFee = calcShippingFee(subtotal);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const parsed = shippingSchema.safeParse(form);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof Errors] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const orderId = await placeOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shipping: parsed.data,
      });
      clear();
      router.replace(`/orders/${orderId}?success=1`);
    } catch (err) {
      setSubmitError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]" noValidate>
      <Card className="space-y-4 p-5">
        <h2 className="font-semibold">Thông tin giao hàng</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Họ và tên" htmlFor="fullName" error={errors.fullName}>
            <Input id="fullName" autoComplete="name" value={form.fullName} onChange={set("fullName")} />
          </Field>
          <Field label="Số điện thoại" htmlFor="phone" error={errors.phone}>
            <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} />
          </Field>
        </div>
        <Field label="Địa chỉ nhận hàng" htmlFor="address" error={errors.address} hint="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành">
          <Input id="address" autoComplete="street-address" value={form.address} onChange={set("address")} />
        </Field>
        <Field label="Ghi chú (không bắt buộc)" htmlFor="note" error={errors.note}>
          <Textarea id="note" value={form.note} onChange={set("note")} />
        </Field>
        <div className="space-y-2">
          <h2 className="font-semibold">Phương thức thanh toán</h2>
          <label className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-3 text-sm">
            <input type="radio" checked readOnly className="accent-primary" />
            Thanh toán khi nhận hàng (COD)
          </label>
        </div>
      </Card>

      <Card className="h-fit space-y-4 p-5">
        <h2 className="font-semibold">Đơn hàng ({items.length} sản phẩm)</h2>
        <div className="max-h-72 space-y-3 overflow-y-auto">
          {items.map((i) => (
            <div key={i.productId} className="flex gap-3 text-sm">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                <ProductImage src={i.image} alt={i.name} sizes="48px" />
              </div>
              <div className="flex-1">
                <div className="line-clamp-1">{i.name}</div>
                <div className="text-muted-foreground">x{i.quantity}</div>
              </div>
              <div className="font-medium">{formatPrice(i.price * i.quantity)}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Vận chuyển</span><span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span></div>
          <div className="flex justify-between text-base font-semibold"><span>Tổng cộng</span><span className="text-primary">{formatPrice(subtotal + shippingFee)}</span></div>
        </div>
        {submitError && <ErrorMessage>{submitError}</ErrorMessage>}
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Đặt hàng
        </Button>
      </Card>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Thanh toán</h1>
      <RequireAuth>
        <CheckoutForm />
      </RequireAuth>
    </div>
  );
}
