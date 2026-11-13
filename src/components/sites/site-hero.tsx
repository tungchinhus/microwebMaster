"use client";

import { KIND_ICON } from "@/components/showcase/mini-site";
import { getCategory, type Project } from "@/lib/showcase/catalog";

/**
 * Banner đầu trang dựng bằng HTML thật, co giãn theo màn hình. Trên điện thoại dùng bản này thay cho
 * bản dựng thu nhỏ của mẫu (TemplateBody), để chữ và nút đủ lớn.
 */
export function SiteHero({ project, subtitle, ctaHref }: { project: Project; subtitle?: string; ctaHref?: string }) {
  const p = project.palette;
  const category = getCategory(project.category);
  const Icon = KIND_ICON[category?.kind ?? "shop"];
  return (
    <section className="px-4 pt-4 pb-8">
      <div className="overflow-hidden p-6 sm:p-10" style={{ background: p.hero, color: p.heroFg, borderRadius: "calc(var(--r) * 1.5rem)" }}>
        <div className="grid items-center gap-8 sm:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <span className="text-xs font-bold tracking-[0.18em] uppercase opacity-70">{category?.name}</span>
            <h1 className="ws-h text-3xl leading-tight sm:text-5xl">{project.headline}</h1>
            <p className="text-[15px] leading-relaxed opacity-80 sm:text-lg">{subtitle || project.summary}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a href={ctaHref ?? "#noi-dung"} className="ws-btn">
                {project.nav[0] ?? "Xem ngay"}
              </a>
            </div>
          </div>
          <div
            className="hidden aspect-square place-items-center sm:grid"
            style={{ background: `color-mix(in srgb, ${p.heroFg} 10%, transparent)`, borderRadius: "calc(var(--r) * 1.25rem)" }}
          >
            <Icon className="size-1/3" strokeWidth={1.3} />
          </div>
        </div>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {project.features.slice(0, 3).map((f) => (
          <li key={f} className="ws-card flex items-center gap-3 p-4 text-[15px]">
            <span className="ws-soft grid size-10 shrink-0 place-items-center">
              <Icon className="ws-accent size-5" strokeWidth={1.6} />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </section>
  );
}
