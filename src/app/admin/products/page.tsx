"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/admin/admin-shell";
import { ProductImage } from "@/components/product-image";
import { ButtonLink } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Card, ErrorMessage, Spinner } from "@/components/ui/misc";
import { useToast } from "@/context/toast-context";
import { listCategories } from "@/lib/data/categories";
import { listAllProducts, updateProduct } from "@/lib/data/products";
import { effectivePrice, formatPrice, slugify } from "@/lib/format";
import { useAsync } from "@/lib/use-async";

export default function AdminProductsPage() {
  const toast = useToast();
  const products = useAsync(listAllProducts, "admin-products");
  const categories = useAsync(listCategories, "categories");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const categoryName = useMemo(
    () => Object.fromEntries((categories.data ?? []).map((c) => [c.id, c.name])),
    [categories.data],
  );

  const filtered = useMemo(() => {
    const needle = slugify(q);
    return (products.data ?? []).filter(
      (p) =>
        (!needle || slugify(`${p.name} ${p.sku}`).includes(needle)) &&
        (!category || p.categoryId === category) &&
        (!status ||
          (status === "active" && p.active) ||
          (status === "hidden" && !p.active) ||
          (status === "out" && p.stock <= 0)),
    );
  }, [products.data, q, category, status]);

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await updateProduct(id, { active });
      products.setData((products.data ?? []).map((p) => (p.id === id ? { ...p, active } : p)));
    } catch {
      toast("Không cập nhật được", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        description={products.data ? `${products.data.length} sản phẩm` : undefined}
        actions={
          <ButtonLink href="/admin/products/new">
            <Plus className="size-4" /> Thêm sản phẩm
          </ButtonLink>
        }
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px_180px]">
        <Input placeholder="Tìm theo tên hoặc SKU..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm sản phẩm" />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Lọc danh mục">
          <option value="">Tất cả danh mục</option>
          {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Lọc trạng thái">
          <option value="">Mọi trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="hidden">Đã ẩn</option>
          <option value="out">Hết hàng</option>
        </Select>
      </div>

      {products.loading ? (
        <Spinner />
      ) : products.error ? (
        <ErrorMessage>Không tải được sản phẩm.</ErrorMessage>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3 text-right">Giá</th>
                <th className="px-4 py-3 text-right">Tồn kho</th>
                <th className="px-4 py-3 text-center">Đang bán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-primary">
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                        <ProductImage src={p.images[0]} alt="" sizes="44px" />
                      </span>
                      <span>
                        <span className="line-clamp-1 font-medium">{p.name}</span>
                        {p.sku && <span className="text-xs text-muted-foreground">{p.sku}</span>}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryName[p.categoryId] ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    {formatPrice(effectivePrice(p))}
                    {effectivePrice(p) < p.price && (
                      <div className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</div>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${p.stock <= 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : ""}`}>
                    {p.stock}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      aria-label={`Đang bán: ${p.name}`}
                      checked={p.active}
                      onChange={(e) => toggleActive(p.id, e.target.checked)}
                      className="size-4 accent-primary"
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Không có sản phẩm phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
