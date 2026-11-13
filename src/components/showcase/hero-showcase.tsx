"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, heroProjectFor } from "@/lib/showcase/catalog";
import { DesktopPreview, MobilePreview } from "./mini-site";

const TABS = CATEGORIES.filter((c) => heroProjectFor(c.id));

export function HeroShowcase() {
  const [active, setActive] = useState(TABS[0].id);
  const project = heroProjectFor(active)!;
  const category = TABS.find((c) => c.id === active)!;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lĩnh vực">
        {TABS.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === active}
            onClick={() => setActive(c.id)}
            className={`rounded-full border px-4 py-2 text-[15px] transition ${
              c.id === active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-foreground/85 hover:border-foreground/30"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="relative pr-[14%] pb-[6%]">
        <div key={project.slug} className="animate-[fadeUp_.45s_ease] overflow-hidden rounded-3xl shadow-2xl shadow-black/10 ring-1 ring-black/5">
          <DesktopPreview project={project} />
        </div>
        <div
          key={`${project.slug}-m`}
          className="absolute right-0 bottom-0 w-[26%] animate-[fadeUp_.6s_ease] overflow-hidden rounded-[22px] border-[5px] border-white bg-white shadow-2xl shadow-black/20 dark:border-zinc-800"
        >
          <MobilePreview project={project} />
        </div>
      </div>

      <p className="text-[15px] text-muted-foreground">
        <Link href={`/mau/${project.slug}`} className="font-medium text-foreground underline underline-offset-4">
          {project.name}
        </Link>{" "}
        · {category.description}
      </p>
    </div>
  );
}
