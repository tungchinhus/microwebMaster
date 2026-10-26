import { storeConfig } from "@/config/store";
import type { OrderStatus, Product } from "./types";

const currencyFormatter = new Intl.NumberFormat(storeConfig.locale, {
  style: "currency",
  currency: storeConfig.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(millis: number | null): string {
  if (!millis) return "";
  return new Date(millis).toLocaleString(storeConfig.locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function effectivePrice(product: Pick<Product, "price" | "salePrice">): number {
  return product.salePrice && product.salePrice < product.price
    ? product.salePrice
    : product.price;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function calcShippingFee(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= storeConfig.freeShippingThreshold ? 0 : storeConfig.shippingFee;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};
