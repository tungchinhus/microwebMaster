"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductGrid, ProductGridSkeleton } from "@/components/shop/product-card";
import { ErrorMessage, EmptyState } from "@/components/ui/misc";
import { listCategories } from "@/lib/data/categories";
import { listActiveProducts } from "@/lib/data/products";
import { useAsync } from "@/lib/use-async";

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Xem tất cả <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function HomeContent() {
  const products = useAsync(listActiveProducts, "products");
  const categories = useAsync(listCategories, "categories");

  if (products.error) {
    return <ErrorMessage>Không tải được sản phẩm. Vui lòng kiểm tra cấu hình Firebase và thử lại.</ErrorMessage>;
  }

  const all = products.data ?? [];
  const featured = all.filter((p) => p.featured).slice(0, 8);
  const newest = all.slice(0, 8);

  return (
    <div className="space-y-12">
      {(categories.data?.length ?? 0) > 0 && (
        <Section title="Danh mục">
          <div className="flex flex-wrap gap-2">
            {categories.data!.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {products.loading ? (
        <Section title="Sản phẩm nổi bật">
          <ProductGridSkeleton count={4} />
        </Section>
      ) : all.length === 0 ? (
        <EmptyState title="Chưa có sản phẩm" description="Cửa hàng đang cập nhật sản phẩm, bạn quay lại sau nhé." />
      ) : (
        <>
          {featured.length > 0 && (
            <Section title="Sản phẩm nổi bật" href="/products">
              <ProductGrid products={featured} />
            </Section>
          )}
          <Section title="Hàng mới về" href="/products?sort=newest">
            <ProductGrid products={newest} />
          </Section>
        </>
      )}
    </div>
  );
}
