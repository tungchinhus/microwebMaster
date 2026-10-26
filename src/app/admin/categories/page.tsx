"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Card, ErrorMessage, Spinner } from "@/components/ui/misc";
import { useToast } from "@/context/toast-context";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/data/categories";
import { listAllProducts } from "@/lib/data/products";
import { slugify } from "@/lib/format";
import type { Category } from "@/lib/types";
import { useAsync } from "@/lib/use-async";

const emptyForm = { name: "", description: "", sortOrder: "0" };

export default function AdminCategoriesPage() {
  const toast = useToast();
  const categories = useAsync(listCategories, "categories");
  const products = useAsync(listAllProducts, "admin-products");
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const productCount = (id: string) => (products.data ?? []).filter((p) => p.categoryId === id).length;

  const startEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? "", sortOrder: String(c.sortOrder) });
  };
  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const input = {
      name: form.name.trim(),
      slug: slugify(form.name),
      description: form.description.trim(),
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (editing) await updateCategory(editing.id, input);
      else await createCategory(input);
      toast(editing ? "Đã cập nhật danh mục" : "Đã thêm danh mục");
      reset();
      categories.reload();
    } catch {
      toast("Không lưu được danh mục", "error");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (c: Category) => {
    if (productCount(c.id) > 0) {
      toast("Danh mục còn sản phẩm, hãy chuyển sản phẩm sang danh mục khác trước", "error");
      return;
    }
    if (!confirm(`Xóa danh mục "${c.name}"?`)) return;
    try {
      await deleteCategory(c.id);
      categories.reload();
      toast("Đã xóa danh mục");
    } catch {
      toast("Không xóa được danh mục", "error");
    }
  };

  return (
    <div>
      <PageHeader title="Danh mục" description="Nhóm sản phẩm hiển thị trên cửa hàng" />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="overflow-x-auto">
          {categories.loading ? (
            <Spinner />
          ) : categories.error ? (
            <div className="p-4"><ErrorMessage>Không tải được danh mục.</ErrorMessage></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3 text-right">Thứ tự</th>
                  <th className="px-4 py-3 text-right">Sản phẩm</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.data?.map((c) => (
                  <tr key={c.id} className={editing?.id === c.id ? "bg-primary/5" : "hover:bg-muted/50"}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.name}</div>
                      {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                    </td>
                    <td className="px-4 py-3 text-right">{c.sortOrder}</td>
                    <td className="px-4 py-3 text-right">{productCount(c.id)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" aria-label="Sửa" className="rounded p-1.5 hover:bg-muted" onClick={() => startEdit(c)}>
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" aria-label="Xóa" className="rounded p-1.5 text-red-600 hover:bg-muted" onClick={() => onDelete(c)}>
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.data?.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">Chưa có danh mục.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="h-fit p-5">
          <form className="space-y-4" onSubmit={onSubmit}>
            <h2 className="font-semibold">{editing ? "Sửa danh mục" : "Thêm danh mục"}</h2>
            <Field label="Tên danh mục" htmlFor="cat-name">
              <Input id="cat-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Mô tả" htmlFor="cat-desc">
              <Input id="cat-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <Field label="Thứ tự hiển thị" htmlFor="cat-order" hint="Số nhỏ hiển thị trước">
              <Input id="cat-order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" loading={saving} className="flex-1">{editing ? "Lưu" : "Thêm"}</Button>
              {editing && <Button type="button" variant="outline" onClick={reset}>Hủy</Button>}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
