"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CATEGORIES, heroProjectFor } from "@/lib/showcase/catalog";
import { CategoryIcon } from "./category-icons";
import { DesktopPreview, MobilePreview } from "./mini-site";

const TABS = CATEGORIES.filter((c) => heroProjectFor(c.id));

/**
 * Bản xem trước ở đầu trang chủ. Các lĩnh vực nằm trên một hàng cuộn ngang (trước đây là
 * bốn hàng nút đè lên ảnh xem trước); dùng phím mũi tên trái/phải, Home, End để chuyển tab.
 */
export function HeroShowcase() {
  const [active, setActive] = useState(TABS[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const project = heroProjectFor(active)!;
  const category = TABS.find((c) => c.id === active)!;

  const select = (i: number) => {
    const tab = TABS[(i + TABS.length) % TABS.length];
    setActive(tab.id);
    const el = tabRefs.current[TABS.indexOf(tab)];
    el?.focus();
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    select(to);
  };

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,#000_calc(100%-48px),transparent)] [scrollbar-width:none] lg:mx-0 lg:px-0"
        role="tablist"
        aria-label="Xem mẫu theo lĩnh vực"
      >
        {TABS.map((c, i) => {
          const selected = c.id === active;
          return (
            <button
              key={c.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`hero-tab-${c.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls="hero-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[15px] whitespace-nowrap transition ${
                selected ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground/85 hover:border-foreground/30"
              }`}
            >
              <CategoryIcon id={c.id} className="size-4" />
              {c.name}
            </button>
          );
        })}
      </div>

      <div id="hero-panel" role="tabpanel" aria-labelledby={`hero-tab-${active}`} className="flex flex-col gap-5">
        <Link href={`/mau/${project.slug}`} className="group relative block pr-[14%] pb-[6%]" aria-label={`Xem mẫu ${project.name}`}>
          <div key={project.slug} className="animate-[fadeUp_.45s_ease] overflow-hidden rounded-3xl shadow-2xl shadow-black/10 ring-1 ring-black/5 transition group-hover:shadow-black/20">
            <DesktopPreview project={project} />
          </div>
          <div
            key={`${project.slug}-m`}
            className="absolute right-0 bottom-0 w-[26%] animate-[fadeUp_.6s_ease] overflow-hidden rounded-[22px] border-[5px] border-white bg-white shadow-2xl shadow-black/20 dark:border-zinc-800"
          >
            <MobilePreview project={project} />
          </div>
        </Link>

        <p className="text-[15px] text-muted-foreground">
          <Link href={`/mau/${project.slug}`} className="font-medium text-foreground underline underline-offset-4">
            {project.name}
          </Link>{" "}
          · {category.description}
        </p>
      </div>
    </div>
  );
}
