"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { effectivePrice, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function PriceTag({ product, large }: { product: Product; large?: boolean }) {
  const price = effectivePrice(product);
  const onSale = price < product.price;
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`font-bold text-primary ${large ? "text-2xl" : "text-base"}`}>{formatPrice(price)}</span>
      {onSale && (
        <span className={`text-muted-foreground line-through ${large ? "text-base" : "text-xs"}`}>
          {formatPrice(product.price)}
        </span>
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const toast = useToast();
  const price = effectivePrice(product);
  const discount = price < product.price ? Math.round((1 - price / product.price) * 100) : 0;
  const soldOut = product.stock <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage src={product.images[0]} alt={product.name} className="transition duration-300 group-hover:scale-105" />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-center text-xs font-medium text-white">
            Hết hàng
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/products/${product.id}`} className="line-clamp-2 text-sm font-medium hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2">
          <PriceTag product={product} />
          <button
            type="button"
            disabled={soldOut}
            aria-label={`Thêm ${product.name} vào giỏ`}
            onClick={() => {
              add(product);
              toast("Đã thêm vào giỏ hàng");
            }}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
          >
            <ShoppingCart className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-2 p-3">
            <div className="h-4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
