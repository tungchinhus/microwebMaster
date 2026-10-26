"use client";

import { use } from "react";
import { PageHeader } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
import { EmptyState, Spinner } from "@/components/ui/misc";
import { getProduct } from "@/lib/data/products";
import { useAsync } from "@/lib/use-async";

export function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: product, loading } = useAsync(() => getProduct(id), id);

  if (loading) return <Spinner />;
  if (!product) return <EmptyState title="Không tìm thấy sản phẩm" />;
  return (
    <div>
      <PageHeader title="Sửa sản phẩm" description={product.name} />
      <ProductForm key={product.id} product={product} />
    </div>
  );
}
