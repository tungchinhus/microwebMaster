import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DemoViewer } from "@/components/showcase/demo-viewer";
import { PROJECTS, getProject } from "@/lib/showcase/catalog";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/demo/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: `Demo ${project.name}` } : {};
}

export default async function DemoPage({ params }: PageProps<"/demo/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  return (
    <Suspense fallback={<div className="h-dvh bg-zinc-950" />}>
      <DemoViewer project={project} />
    </Suspense>
  );
}
