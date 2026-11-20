import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/showcase/cards";
import { CompareBar } from "@/components/showcase/compare-ui";
import { TemplateDetail } from "@/components/showcase/template-detail";
import { TemplateParts } from "@/components/showcase/template-parts";
import { SiteFooter, SiteHeader } from "@/components/site-header";
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
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-10 pb-20 lg:pb-0">
        <nav aria-label="Đường dẫn" className="text-[15px] text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/kho" className="hover:text-foreground">Kho mẫu</Link>
            </li>
            <li aria-hidden><ChevronRight className="size-4 opacity-60" /></li>
            <li>
              <Link href={`/kho?loai=${project.category}`} className="hover:text-foreground">{category?.name}</Link>
            </li>
            <li aria-hidden><ChevronRight className="size-4 opacity-60" /></li>
            <li aria-current="page" className="font-medium text-foreground">{project.name}</li>
          </ol>
        </nav>

        <TemplateDetail project={project} categoryName={category?.name} />
        <TemplateParts project={project} />

        <section className="mt-20">
          <h2 className="mb-8 text-3xl font-bold tracking-tight">{related.length ? `Mẫu ${category?.name.toLowerCase()} khác` : "Mẫu tiêu biểu khác"}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {more.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
        <CompareBar />
      </main>
      <SiteFooter />
    </>
  );
}
