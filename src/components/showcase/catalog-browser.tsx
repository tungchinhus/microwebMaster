"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { layoutTypes } from "@/lib/sites/layouts";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, FEATURES, PROJECTS, featuresOf, getCategory, matchesQuery, type FeatureId } from "@/lib/showcase/catalog";
import { ProjectCard } from "./cards";
import { CompareBar } from "./compare-ui";

const pill = (active: boolean) =>
  `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition sm:px-5 sm:py-2.5 sm:text-[15px] ${
    active ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/30"
  }`;

const chip = (active: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
    active ? "border-primary bg-primary/10 font-medium text-primary" : "border-border bg-card text-foreground/80 hover:border-foreground/30"
  }`;

const SORTS = [
  { id: "noi-bat", name: "Nổi bật" },
  { id: "day-du", name: "Nhiều phần nhất" },
  { id: "ten", name: "Tên A–Z" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

export function CatalogBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawCategory = params.get("loai") ?? "";
  const category = getCategory(rawCategory) ? rawCategory : "";
  const selected = (params.get("tinh-nang") ?? "").split(",").filter((f): f is FeatureId => FEATURES.some((x) => x.id === f));
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [showFeatures, setShowFeatures] = useState(false);
  const sort = SORTS.some((x) => x.id === params.get("xep")) ? (params.get("xep") as SortId) : "noi-bat";

  const update = (next: { loai?: string; tinhNang?: string[]; q?: string; xep?: SortId }) => {
    const sp = new URLSearchParams();
    const loai = next.loai ?? category;
    const tinhNang = next.tinhNang ?? selected;
    const q = next.q ?? query;
    if (loai) sp.set("loai", loai);
    if (tinhNang.length) sp.set("tinh-nang", tinhNang.join(","));
    if (q.trim()) sp.set("q", q.trim());
    const xep = next.xep ?? sort;
    if (xep !== "noi-bat") sp.set("xep", xep);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggleFeature = (id: FeatureId) =>
    update({ tinhNang: selected.includes(id) ? selected.filter((f) => f !== id) : [...selected, id] });

  const list = (() => {
    const found = PROJECTS.filter(
      (p) => (!category || p.category === category) && selected.every((f) => featuresOf(p).includes(f)) && matchesQuery(p, query),
    );
    if (sort === "day-du") return [...found].sort((a, b) => layoutTypes(b).length - layoutTypes(a).length);
    if (sort === "ten") return [...found].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    return [...found].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  })();
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

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0">
        <button className={pill(!category)} onClick={() => update({ loai: "" })}>
          Tất cả
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={pill(category === c.id)} onClick={() => update({ loai: c.id })}>
            {c.name}
          </button>
        ))}
        <span className="hidden items-center gap-2 rounded-full border border-dashed border-border px-5 py-2.5 text-[15px] text-muted-foreground sm:inline-flex">
          Lĩnh vực khác <span className="rounded-full border border-border px-2 text-xs">Sắp có</span>
        </span>
      </div>

      <button
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium sm:hidden"
        aria-expanded={showFeatures}
        onClick={() => setShowFeatures((v) => !v)}
      >
        <SlidersHorizontal className="size-4" /> Lọc theo tính năng{selected.length ? ` (${selected.length})` : ""}
        <ChevronDown className={`size-4 transition ${showFeatures ? "rotate-180" : ""}`} />
      </button>
      <div className={`mt-4 flex-wrap items-center gap-2 sm:mt-5 sm:flex ${showFeatures ? "flex" : "hidden"}`}>
        <span className="mr-1 hidden items-center gap-1.5 text-sm font-medium text-muted-foreground sm:inline-flex">
          <SlidersHorizontal className="size-4" /> Cần có:
        </span>
        {FEATURES.map((f) => (
          <button key={f.id} className={chip(selected.includes(f.id))} aria-pressed={selected.includes(f.id)} onClick={() => toggleFeature(f.id)}>
            {f.name}
            {selected.includes(f.id) && <X className="size-3.5" />}
          </button>
        ))}
      </div>

      <div className="mt-6 mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground sm:mt-8 sm:mb-6">
        <span aria-live="polite">
          <b className="font-semibold text-foreground">{list.length}</b> mẫu{category ? ` ${getCategory(category)?.name.toLowerCase()}` : ""}
        </span>
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
        <label className="ml-auto inline-flex items-center gap-2 text-sm">
          Xếp theo
          <select
            value={sort}
            onChange={(e) => update({ xep: e.target.value as SortId })}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground outline-none focus:border-primary"
          >
            {SORTS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
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
