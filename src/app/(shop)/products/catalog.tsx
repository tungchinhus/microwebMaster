"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { EmptyState, ErrorMessage } from "@/components/ui/misc";
import { listCategories } from "@/lib/data/categories";
import { listActiveProducts } from "@/lib/data/products";
import { effectivePrice, slugify } from "@/lib/format";
import { useAsync } from "@/lib/use-async";

const PAGE_SIZE = 12;
const SORTS = {
  newest: "Mới nhất",
  "price-asc": "Giá thấp đến cao",
  "price-desc": "Giá cao đến thấp",
  name: "Tên A-Z",
} as const;
type SortKey = keyof typeof SORTS;

export function Catalog() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const sort = (params.get("sort") as SortKey) in SORTS ? (params.get("sort") as SortKey) : "newest";
  const inStock = params.get("inStock") === "1";
  const [limit, setLimit] = useState(PAGE_SIZE);

  const products = useAsync(listActiveProducts, "products");
  const categories = useAsync(listCategories, "categories");

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    setLimit(PAGE_SIZE);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    const needle = slugify(q).replace(/-/g, " ");
    const list = (products.data ?? []).filter(
      (p) =>
        (!category || p.categoryId === category) &&
        (!inStock || p.stock > 0) &&
        (!needle || slugify(`${p.name} ${p.sku ?? ""}`).replace(/-/g, " ").includes(needle)),
    );
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    if (sort === "price-desc") sorted.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    return sorted;
  }, [products.data, q, category, inStock, sort]);

  const activeCategory = categories.data?.find((c) => c.id === category);

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Danh mục</h2>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {[{ id: "", name: "Tất cả" }, ...(categories.data ?? [])].map((c) => (
              <button
                key={c.id || "all"}
                type="button"
                onClick={() => setParam("category", c.id)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                  category === c.id ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted lg:bg-transparent"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setParam("inStock", e.target.checked ? "1" : "")}
            className="size-4 accent-primary"
          />
          Chỉ hiện hàng còn
        </label>
      </aside>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{activeCategory?.name ?? "Tất cả sản phẩm"}</h1>
            <p className="text-sm text-muted-foreground">
              {q && <>Kết quả cho &quot;{q}&quot; · </>}
              {products.loading ? "Đang tải..." : `${filtered.length} sản phẩm`}
            </p>
          </div>
          <Select
            aria-label="Sắp xếp"
            value={sort}
            onChange={(e) => setParam("sort", e.target.value === "newest" ? "" : e.target.value)}
            className="w-auto"
          >
            {Object.entries(SORTS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {products.error ? (
          <ErrorMessage>Không tải được sản phẩm, vui lòng thử lại.</ErrorMessage>
        ) : products.loading ? (
          <ProductGridSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState title="Không tìm thấy sản phẩm" description="Thử đổi từ khóa hoặc bỏ bớt bộ lọc." />
        ) : (
          <>
            <ProductGrid products={filtered.slice(0, limit)} />
            {filtered.length > limit && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                  Xem thêm {Math.min(PAGE_SIZE, filtered.length - limit)} sản phẩm
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
