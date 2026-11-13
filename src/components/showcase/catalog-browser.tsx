"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, FEATURES, PROJECTS, featuresOf, getCategory, matchesQuery, type FeatureId } from "@/lib/showcase/catalog";
import { ProjectCard } from "./cards";
import { CompareBar } from "./compare-ui";

const pill = (active: boolean) =>
  `rounded-full border px-5 py-2.5 text-[15px] transition ${
    active ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/30"
  }`;

const chip = (active: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
    active ? "border-primary bg-primary/10 font-medium text-primary" : "border-border bg-card text-foreground/80 hover:border-foreground/30"
  }`;

export function CatalogBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawCategory = params.get("loai") ?? "";
  const category = getCategory(rawCategory) ? rawCategory : "";
  const selected = (params.get("tinh-nang") ?? "").split(",").filter((f): f is FeatureId => FEATURES.some((x) => x.id === f));
  const [query, setQuery] = useState(params.get("q") ?? "");

  const update = (next: { loai?: string; tinhNang?: string[]; q?: string }) => {
    const sp = new URLSearchParams();
    const loai = next.loai ?? category;
    const tinhNang = next.tinhNang ?? selected;
    const q = next.q ?? query;
    if (loai) sp.set("loai", loai);
    if (tinhNang.length) sp.set("tinh-nang", tinhNang.join(","));
    if (q.trim()) sp.set("q", q.trim());
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggleFeature = (id: FeatureId) =>
    update({ tinhNang: selected.includes(id) ? selected.filter((f) => f !== id) : [...selected, id] });

  const list = PROJECTS.filter(
    (p) => (!category || p.category === category) && selected.every((f) => featuresOf(p).includes(f)) && matchesQuery(p, query),
  );
  const filtering = !!(category || selected.length || query.trim());

  return (
    <>
      <div className="relative mb-6 max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            update({ q: e.target.value });
          }}
          placeholder="Tìm mẫu: bán trà, đặt lịch spa, tuyển dụng..."
          aria-label="Tìm mẫu"
          className="h-14 w-full rounded-full border border-border bg-card pr-5 pl-13 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button className={pill(!category)} onClick={() => update({ loai: "" })}>
          Tất cả
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={pill(category === c.id)} onClick={() => update({ loai: c.id })}>
            {c.name}
          </button>
        ))}
        <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-5 py-2.5 text-[15px] text-muted-foreground">
          Lĩnh vực khác <span className="rounded-full border border-border px-2 text-xs">Sắp có</span>
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="size-4" /> Cần có:
        </span>
        {FEATURES.map((f) => (
          <button key={f.id} className={chip(selected.includes(f.id))} aria-pressed={selected.includes(f.id)} onClick={() => toggleFeature(f.id)}>
            {f.name}
            {selected.includes(f.id) && <X className="size-3.5" />}
          </button>
        ))}
      </div>

      <div className="mt-8 mb-6 flex items-center gap-4 text-muted-foreground">
        <span>{list.length} mẫu</span>
        {filtering && (
          <button
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => {
              setQuery("");
              update({ loai: "", tinhNang: [], q: "" });
            }}
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {list.length ? (
        <div className="grid gap-5 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border-2 border-dashed border-border p-12 text-center text-muted-foreground">
          Chưa có mẫu khớp bộ lọc. Thử bỏ bớt tính năng, hoặc{" "}
          <Link href="/bao-gia" className="font-medium text-foreground underline underline-offset-4">
            gửi yêu cầu làm riêng
          </Link>
          .
        </div>
      )}
      <CompareBar />
    </>
  );
}
