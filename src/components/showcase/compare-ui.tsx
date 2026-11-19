"use client";

import { Check, GitCompareArrows, Plus, X } from "lucide-react";
import Link from "next/link";
import { getProject } from "@/lib/showcase/catalog";
import { COMPARE_MAX, useCompareHydration, useCompareStore } from "@/store/compare-store";

/** Nút "So sánh" nằm trên thẻ mẫu (thẻ là một Link nên phải chặn điều hướng). */
export function CompareToggle({ slug, className = "" }: { slug: string; className?: string }) {
  const active = useCompareStore((s) => s.slugs.includes(slug));
  const toggle = useCompareStore((s) => s.toggle);
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur transition ${
        active ? "bg-primary text-primary-foreground" : "bg-white/85 text-zinc-900 hover:bg-white"
      } ${className}`}
    >
      {active ? <Check className="size-3" /> : <Plus className="size-3" />} So sánh
    </button>
  );
}

/** Thanh nổi ở cuối màn hình khi đã chọn ít nhất một mẫu để so sánh. */
export function CompareBar() {
  useCompareHydration();
  const slugs = useCompareStore((s) => s.slugs);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  if (!slugs.length) return null;
  const projects = slugs.map(getProject).filter((p) => !!p);

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-3xl flex-wrap items-center gap-3 rounded-3xl border border-border bg-card/95 p-3 pl-5 shadow-2xl shadow-black/15 backdrop-blur">
        <GitCompareArrows className="size-5 text-primary" />
        <div className="flex flex-1 flex-wrap gap-2">
          {projects.map((p) => (
            <span key={p.slug} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium">
              {p.name}
              <button onClick={() => remove(p.slug)} aria-label={`Bỏ ${p.name}`} className="rounded-full p-0.5 hover:bg-foreground/10">
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          {slugs.length < COMPARE_MAX && (
            <span className="self-center text-sm text-muted-foreground">Chọn thêm tối đa {COMPARE_MAX - slugs.length} mẫu</span>
          )}
        </div>
        <button onClick={clear} className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
          Xoá
        </button>
        <Link
          href={`/so-sanh?mau=${slugs.join(",")}`}
          aria-disabled={slugs.length < 2}
          className={`inline-flex h-11 items-center rounded-full px-5 font-semibold transition ${
            slugs.length < 2 ? "pointer-events-none bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:brightness-110"
          }`}
        >
          So sánh {slugs.length}/{COMPARE_MAX}
        </Link>
      </div>
    </div>
  );
}
