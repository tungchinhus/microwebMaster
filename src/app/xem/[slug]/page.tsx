import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TemplatePage } from "@/components/showcase/template-page";
import { PROJECTS, getProject } from "@/lib/showcase/catalog";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/xem/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: `Xem mẫu ${project.name}`, robots: { index: false } } : {};
}

/** Trang mẫu đầy đủ, mở trong khung của trang Demo (máy tính hoặc điện thoại). */
export default async function TemplateFullPage({ params }: PageProps<"/xem/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <TemplatePage project={project} />
    </Suspense>
  );
}
