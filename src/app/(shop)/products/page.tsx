import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shop/product-card";
import { Catalog } from "./catalog";

export const metadata: Metadata = { title: "Sản phẩm" };

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <Catalog />
    </Suspense>
  );
}
