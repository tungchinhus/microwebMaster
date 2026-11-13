import { ArrowLeft, Check, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/showcase/cards";
import { DesktopPreview, MobilePreview } from "@/components/showcase/mini-site";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { SITE, formatVnd } from "@/config/site";
import { PROJECTS, getCategory, getProject } from "@/lib/showcase/catalog";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/mau/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.name, description: project.summary } : {};
}

export default async function TemplatePage({ params }: PageProps<"/mau/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const category = getCategory(project.category);
  const related = PROJECTS.filter((p) => p.slug !== project.slug && p.category === project.category).slice(0, 4);
  const more = related.length ? related : PROJECTS.filter((p) => p.slug !== project.slug && p.featured).slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-10">
        <Link href={`/kho?loai=${project.category}`} className="inline-flex items-center gap-1.5 text-[15px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {category?.name}
        </Link>

        <div className="mt-6 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="relative pr-[12%] pb-[8%]">
            <div className="overflow-hidden rounded-3xl shadow-2xl shadow-black/10 ring-1 ring-black/5">
              <DesktopPreview project={project} />
            </div>
            <div className="absolute right-0 bottom-0 w-[24%] overflow-hidden rounded-[22px] border-[5px] border-white bg-white shadow-2xl shadow-black/20 dark:border-zinc-800">
              <MobilePreview project={project} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[15px] font-medium text-primary">{category?.name}</span>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{project.name}</h1>
              <p className="text-lg leading-relaxed text-muted-foreground">{project.description}</p>
            </div>
            <ul className="space-y-3">
              {project.features.map((f) => (
                <li key={f} className="flex gap-3 text-[15px]">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3.5" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="rounded-[24px] border border-border/60 bg-card p-6">
              <div className="text-sm text-muted-foreground">Giá trọn gói</div>
              <div className="mt-1 text-3xl font-bold tracking-tight">từ {formatVnd(project.price)}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Bàn giao trong {SITE.deliveryDays} · Hoàn tiền trong {SITE.refundDays} ngày
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href={`/bao-gia?mau=${project.slug}`}
                  className="inline-flex h-13 items-center justify-center rounded-full bg-primary py-3.5 text-lg font-semibold text-primary-foreground transition hover:brightness-110"
                >
                  Xin báo giá mẫu này
                </Link>
                {project.aiReady && (
                  <Link
                    href="/tao-web"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground/80 py-3 font-semibold transition hover:bg-foreground hover:text-background"
                  >
                    <Sparkles className="size-4" /> Tự tạo miễn phí bằng AI
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="mb-8 text-3xl font-bold tracking-tight">{related.length ? `Mẫu ${category?.name.toLowerCase()} khác` : "Mẫu tiêu biểu khác"}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
