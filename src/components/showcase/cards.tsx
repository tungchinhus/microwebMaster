import { ArrowRight, Eye, LayoutList, Sparkles } from "lucide-react";
import { layoutTypes } from "@/lib/sites/layouts";
import Link from "next/link";
import { formatVnd } from "@/config/site";
import { getCategory, projectsIn, variantsOf, type Category, type Project } from "@/lib/showcase/catalog";
import { DesktopPreview } from "./mini-site";
import { CompareToggle } from "./compare-ui";
import { Swatch } from "./template-detail";

export function ProjectCard({ project, showSummary = false }: { project: Project; showSummary?: boolean }) {
  const variants = variantsOf(project);
  const parts = layoutTypes(project).length;
  return (
    // Cả thẻ bấm được (link phủ toàn thẻ), riêng nút So sánh và Xem trọn mẫu nằm trên lớp link.
    <div className="group relative flex flex-col rounded-[28px] border border-border/60 bg-card p-3 transition duration-300 focus-within:ring-2 focus-within:ring-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.06]">
      <div className="relative overflow-hidden rounded-[20px] ring-1 ring-black/5">
        <DesktopPreview project={project} className="transition duration-500 group-hover:scale-[1.03]" />
        {project.aiReady && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <Sparkles className="size-3" /> Tạo bằng AI
          </span>
        )}
        <CompareToggle slug={project.slug} className="absolute top-3 right-3 z-10 shadow-sm" />
        <Link
          href={`/demo/${project.slug}`}
          className="absolute right-3 bottom-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition sm:translate-y-2 sm:opacity-0 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          <Eye className="size-3.5" /> Xem trọn mẫu
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight">
            <Link href={`/mau/${project.slug}`} className="outline-none after:absolute after:inset-0 after:rounded-[28px]">
              {project.name}
            </Link>
          </h3>
          <span className="flex items-center gap-1" title={`${variants.length} giao diện`} aria-label={`${variants.length} giao diện`}>
            {variants.map((v) => (
              <Swatch key={v.id} bg={v.palette.bg} accent={v.palette.accent} fg={v.palette.fg} size={10} />
            ))}
          </span>
        </div>
        {showSummary && <p className="text-[15px] leading-relaxed text-muted-foreground">{project.summary}</p>}
        <div className="text-[15px] text-foreground/75">{getCategory(project.category)?.name}</div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-2 text-sm">
          <span className="inline-flex items-center gap-1.5 text-foreground/75">
            <LayoutList className="size-4" /> {parts} phần · {variants.length} giao diện
          </span>
          <span className="font-medium">
            từ <span className="wm-price">{formatVnd(project.price)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  if (category.comingSoon) {
    return (
      <Link
        href="/bao-gia"
        className="flex min-h-44 flex-col gap-2 rounded-3xl border-2 border-dashed border-border p-5 sm:min-h-56 sm:gap-3 sm:rounded-[28px] sm:p-7 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
      >
        <span className="w-fit rounded-full border border-border px-3 py-1 text-xs font-medium">Sắp có</span>
        <h3 className="text-lg font-semibold tracking-tight sm:text-2xl">{category.name}</h3>
        <p className="text-sm leading-relaxed sm:text-[15px]">{category.description}</p>
      </Link>
    );
  }
  const count = projectsIn(category.id).length;
  return (
    <Link
      href={`/kho?loai=${category.id}`}
      className="group flex min-h-44 flex-col gap-2 rounded-3xl border border-border/60 bg-card p-5 sm:min-h-56 sm:gap-3 sm:rounded-[28px] sm:p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.06]"
    >
      <h3 className="text-lg font-semibold tracking-tight sm:text-2xl">{category.name}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{category.description}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-3 font-semibold text-primary">
        Xem {count} mẫu <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
