"use client";

import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { PriceTag } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { getProduct } from "@/lib/data/products";
import { useAsync } from "@/lib/use-async";

export function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { add } = useCart();
  const toast = useToast();
  // Khách không có quyền đọc sản phẩm đã ẩn, nên lỗi quyền cũng coi như không tìm thấy.
  const { data: product, loading } = useAsync(() => getProduct(id).catch(() => null), id);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (loading) return <Spinner />;
  if (!product || !product.active) {
    return (
      <EmptyState
        title="Không tìm thấy sản phẩm"
        description="Sản phẩm có thể đã ngừng bán."
        action={<Link href="/products" className="text-sm font-medium text-primary hover:underline">Xem sản phẩm khác</Link>}
      />
    );
  }

  const soldOut = product.stock <= 0;
  const maxQty = Math.min(product.stock, 99);

  return (
    <div className="space-y-10">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Trang chủ</Link> /{" "}
        <Link href="/products" className="hover:text-foreground">Sản phẩm</Link> /{" "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
            <ProductImage src={product.images[activeImage]} alt={product.name} sizes="(min-width: 768px) 50vw, 100vw" priority />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Ảnh ${i + 1}`}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  <ProductImage src={img} alt="" sizes="100px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
            {product.sku && <p className="text-sm text-muted-foreground">Mã: {product.sku}</p>}
          </div>
          <PriceTag product={product} large />
          <p className={`text-sm font-medium ${soldOut ? "text-red-600" : "text-emerald-600"}`}>
            {soldOut ? "Tạm hết hàng" : `Còn ${product.stock} sản phẩm`}
          </p>

          {!soldOut && (
            <div className="flex items-center gap-3">
              <span className="text-sm">Số lượng</span>
              <div className="flex items-center rounded-lg border border-border">
                <button type="button" aria-label="Giảm" className="p-2.5 hover:bg-muted" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button type="button" aria-label="Tăng" className="p-2.5 hover:bg-muted" onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}>
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              variant="outline"
              disabled={soldOut}
              onClick={() => {
                add(product, quantity);
                toast("Đã thêm vào giỏ hàng");
              }}
            >
              <ShoppingCart className="size-5" /> Thêm vào giỏ
            </Button>
            <Button
              size="lg"
              disabled={soldOut}
              onClick={() => {
                add(product, quantity);
                router.push("/cart");
              }}
            >
              <Zap className="size-5" /> Mua ngay
            </Button>
          </div>

          <div className="space-y-2 border-t border-border pt-5">
            <h2 className="font-semibold">Mô tả sản phẩm</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description || "Đang cập nhật."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
