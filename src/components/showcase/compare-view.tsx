"use client";

import { Check, Maximize2, Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { formatVnd } from "@/config/site";
import { FEATURES, featuresOf, getCategory, getProject, variantsOf, type Project } from "@/lib/showcase/catalog";
import { COMPARE_MAX, useCompareStore } from "@/store/compare-store";
import { DesktopPreview } from "./mini-site";

function Cell({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Check className="size-4" />
    </span>
  ) : (
    <Minus className="size-4 text-muted-foreground/50" />
  );
}

export function CompareView() {
  const params = useSearchParams();
  const router = useRouter();
  const projects = (params.get("mau") ?? "")
    .split(",")
    .map((s) => getProject(s))
    .filter((p): p is Project => !!p)
    .slice(0, COMPARE_MAX);
  const slugs = projects.map((p) => p.slug);

  // Giữ thanh so sánh ở các trang khác khớp với danh sách đang xem.
  useEffect(() => {
    useCompareStore.setState({ slugs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join(",")]);

  const removeAt = (slug: string) => {
    const next = slugs.filter((s) => s !== slug);
    router.replace(next.length ? `/so-sanh?mau=${next.join(",")}` : "/so-sanh", { scroll: false });
  };

  if (!projects.length) {
    return (
      <div className="rounded-[28px] border-2 border-dashed border-border p-12 text-center text-muted-foreground">
        Chưa chọn mẫu nào. Vào{" "}
        <Link href="/kho" className="font-medium text-foreground underline underline-offset-4">
          kho mẫu
        </Link>{" "}
        và bấm <span className="font-medium text-foreground">+ So sánh</span> trên 2 đến 3 mẫu.
      </div>
    );
  }

  const featureRows = FEATURES.filter((f) => projects.some((p) => featuresOf(p).includes(f.id)));
  const cols = `minmax(150px, 0.8fr) repeat(${projects.length + (projects.length < COMPARE_MAX ? 1 : 0)}, minmax(220px, 1fr))`;
  const row = "grid items-center gap-4 border-t border-border py-4";

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-10">
      <div className="min-w-[680px]">
        <div className="grid items-start gap-4 pb-6" style={{ gridTemplateColumns: cols }}>
          <div />
          {projects.map((p) => (
            <div key={p.slug} className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/5">
                <DesktopPreview project={p} />
                <button
                  onClick={() => removeAt(p.slug)}
                  aria-label={`Bỏ ${p.name} khỏi so sánh`}
                  className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <div>
                <Link href={`/mau/${p.slug}`} className="text-xl font-semibold tracking-tight hover:underline">
                  {p.name}
                </Link>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
              </div>
            </div>
          ))}
          {projects.length < COMPARE_MAX && (
            <Link
              href="/kho"
              className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <Plus className="size-6" />
              <span className="text-sm font-medium">Thêm mẫu</span>
            </Link>
          )}
        </div>

        {[
          { label: "Lĩnh vực", render: (p: Project) => getCategory(p.category)?.name },
          { label: "Giá trọn gói", render: (p: Project) => <span className="font-semibold">từ {formatVnd(p.price)}</span> },
          { label: "Số giao diện", render: (p: Project) => `${variantsOf(p).length} giao diện` },
          { label: "Tự tạo bằng AI", render: (p: Project) => <Cell ok={!!p.aiReady} /> },
        ].map((r) => (
          <div key={r.label} className={row} style={{ gridTemplateColumns: cols }}>
            <div className="text-sm font-medium text-muted-foreground">{r.label}</div>
            {projects.map((p) => (
              <div key={p.slug} className="text-[15px]">
                {r.render(p)}
              </div>
            ))}
          </div>
        ))}

        <div className="mt-6 mb-1 text-lg font-semibold">Tính năng</div>
        {featureRows.map((f) => (
          <div key={f.id} className={row} style={{ gridTemplateColumns: cols }}>
            <div className="text-[15px]">{f.name}</div>
            {projects.map((p) => (
              <div key={p.slug}>
                <Cell ok={featuresOf(p).includes(f.id)} />
              </div>
            ))}
          </div>
        ))}

        <div className="grid gap-4 border-t border-border pt-6" style={{ gridTemplateColumns: cols }}>
          <div />
          {projects.map((p) => (
            <div key={p.slug} className="flex flex-col gap-2">
              <Link
                href={`/bao-gia?mau=${p.slug}`}
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Xin báo giá
              </Link>
              <Link
                href={`/demo/${p.slug}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border font-semibold transition hover:bg-muted"
              >
                <Maximize2 className="size-4" /> Xem demo
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
