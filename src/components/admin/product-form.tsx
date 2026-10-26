"use client";

import { ImagePlus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Card, ErrorMessage } from "@/components/ui/misc";
import { useToast } from "@/context/toast-context";
import { listCategories } from "@/lib/data/categories";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  updateProduct,
  uploadProductImage,
} from "@/lib/data/products";
import { slugify } from "@/lib/format";
import type { Product, ProductInput } from "@/lib/types";
import { useAsync } from "@/lib/use-async";

const MAX_IMAGES = 10;
const MAX_SIZE = 5 * 1024 * 1024;

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const toast = useToast();
  const categories = useAsync(listCategories, "categories");
  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    salePrice: product?.salePrice ? String(product.salePrice) : "",
    stock: product ? String(product.stock) : "0",
    categoryId: product?.categoryId ?? "",
    featured: product?.featured ?? false,
    active: product?.active ?? true,
  });
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, MAX_IMAGES - images.length);
    const invalid = list.find((f) => !f.type.startsWith("image/") || f.size > MAX_SIZE);
    if (invalid) {
      toast(`"${invalid.name}" không phải ảnh hoặc lớn hơn 5MB`, "error");
      return;
    }
    setUploading(true);
    try {
      const urls = await Promise.all(list.map(uploadProductImage));
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast("Tải ảnh lên thất bại", "error");
    } finally {
      setUploading(false);
    }
  };

  const validate = (): ProductInput | string => {
    const price = Number(form.price);
    const salePrice = form.salePrice ? Number(form.salePrice) : null;
    const stock = Number(form.stock);
    if (!form.name.trim()) return "Vui lòng nhập tên sản phẩm.";
    if (!Number.isFinite(price) || price < 0) return "Giá bán không hợp lệ.";
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice >= price))
      return "Giá khuyến mãi phải nhỏ hơn giá bán.";
    if (!Number.isInteger(stock) || stock < 0) return "Tồn kho phải là số nguyên không âm.";
    if (!form.categoryId) return "Vui lòng chọn danh mục.";
    return {
      name: form.name.trim(),
      slug: slugify(form.name),
      sku: form.sku.trim(),
      description: form.description.trim(),
      price,
      salePrice,
      stock,
      categoryId: form.categoryId,
      featured: form.featured,
      active: form.active,
      images,
    };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validate();
    if (typeof result === "string") {
      setError(result);
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (product) await updateProduct(product.id, result);
      else await createProduct(result);
      await Promise.all(removedImages.map(deleteProductImage));
      toast(product ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setError("Không lưu được sản phẩm. Kiểm tra quyền admin và thử lại.");
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!product || !confirm(`Xóa sản phẩm "${product.name}"? Thao tác này không thể hoàn tác.`)) return;
    setSaving(true);
    try {
      await deleteProduct(product.id);
      await Promise.all(product.images.map(deleteProductImage));
      toast("Đã xóa sản phẩm");
      router.push("/admin/products");
    } catch {
      toast("Không xóa được sản phẩm", "error");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1fr_340px]" noValidate>
      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <Field label="Tên sản phẩm" htmlFor="name">
            <Input id="name" value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Mã SKU" htmlFor="sku">
            <Input id="sku" value={form.sku} onChange={set("sku")} />
          </Field>
          <Field label="Mô tả" htmlFor="description">
            <Textarea id="description" rows={8} value={form.description} onChange={set("description")} />
          </Field>
        </Card>

        <Card className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Hình ảnh ({images.length}/{MAX_IMAGES})</h2>
            <span className="text-xs text-muted-foreground">Ảnh đầu tiên là ảnh đại diện</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                <ProductImage src={url} alt="" sizes="120px" />
                <div className="absolute inset-0 flex items-start justify-end gap-1 bg-black/0 p-1 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                  {i > 0 && (
                    <button
                      type="button"
                      className="rounded bg-white/90 px-1.5 text-[10px] font-medium text-black"
                      onClick={() => setImages((prev) => [url, ...prev.filter((u) => u !== url)])}
                    >
                      Đặt đầu
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Xóa ảnh"
                    className="rounded bg-white/90 p-0.5 text-red-600"
                    onClick={() => {
                      setImages((prev) => prev.filter((u) => u !== url));
                      setRemovedImages((prev) => [...prev, url]);
                    }}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary">
                <ImagePlus className="size-6" />
                {uploading ? "Đang tải..." : "Thêm ảnh"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    onFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <Field label="Giá bán (VND)" htmlFor="price">
            <Input id="price" type="number" min={0} step={1000} value={form.price} onChange={set("price")} />
          </Field>
          <Field label="Giá khuyến mãi (VND)" htmlFor="salePrice" hint="Bỏ trống nếu không giảm giá">
            <Input id="salePrice" type="number" min={0} step={1000} value={form.salePrice} onChange={set("salePrice")} />
          </Field>
          <Field label="Tồn kho" htmlFor="stock">
            <Input id="stock" type="number" min={0} step={1} value={form.stock} onChange={set("stock")} />
          </Field>
          <Field label="Danh mục" htmlFor="categoryId">
            <Select id="categoryId" value={form.categoryId} onChange={set("categoryId")}>
              <option value="">-- Chọn danh mục --</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={set("active")} className="size-4 accent-primary" />
            Đang bán (hiển thị trên cửa hàng)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={set("featured")} className="size-4 accent-primary" />
            Sản phẩm nổi bật
          </label>
        </Card>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={saving} disabled={uploading} className="flex-1">
            {product ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </Button>
          {product && (
            <Button type="button" variant="danger" onClick={onDelete} disabled={saving}>
              <Trash2 className="size-4" /> Xóa
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
