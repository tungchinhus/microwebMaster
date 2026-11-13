"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, PROJECTS, getCategory } from "@/lib/showcase/catalog";
import { ProjectCard } from "./cards";

const pill = (active: boolean) =>
  `rounded-full border px-5 py-2.5 text-[15px] transition ${
    active ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/30"
  }`;

export function CatalogBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("loai") ?? "";
  const active = getCategory(raw) ? raw : "";
  const list = active ? PROJECTS.filter((p) => p.category === active) : PROJECTS;

  const select = (id: string) => {
    router.replace(id ? `${pathname}?loai=${id}` : pathname, { scroll: false });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        <button className={pill(!active)} onClick={() => select("")}>
          Tất cả
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={pill(active === c.id)} onClick={() => select(c.id)}>
            {c.name}
          </button>
        ))}
        <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-5 py-2.5 text-[15px] text-muted-foreground">
          Lĩnh vực khác <span className="rounded-full border border-border px-2 text-xs">Sắp có</span>
        </span>
      </div>
      <p className="mt-8 mb-6 text-muted-foreground">{list.length} mẫu</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </>
  );
}
