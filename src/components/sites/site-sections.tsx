"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { createElement } from "react";
import { KIND_ICON } from "@/components/showcase/mini-site";
import { getCategory } from "@/lib/showcase/catalog";
import { safeImageUrl } from "@/lib/sites/types";
import { useSiteRuntime } from "./site-runtime";

/** Các khối dựng nên trang mẫu, vẽ bằng HTML thật nên co giãn theo mọi màn hình. */

type Props = { props: Record<string, string> };

const lines = (text?: string) =>
  (text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const pairs = (text?: string) =>
  lines(text).map((l) => {
    const [a, ...rest] = l.split("|");
    return [a.trim(), rest.join("|").trim()] as const;
  });

/** Biểu tượng theo lĩnh vực của mẫu, dùng khi chưa có ảnh. */
function KindIcon(props: { className?: string; strokeWidth?: number }) {
  const { project } = useSiteRuntime();
  return createElement(KIND_ICON[getCategory(project.category)?.kind ?? "shop"], props);
}

/** Nút chính trỏ tới khối hành động có trên trang. */
function useMainTarget(): string {
  const { placed } = useSiteRuntime();
  if (placed.has("booking")) return "#dat-lich";
  if (placed.has("products")) return "#san-pham";
  if (placed.has("contact")) return "#lien-he";
  return "#noi-dung";
}

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="ws-h mb-6 text-2xl sm:text-3xl">{children}</h2>;
}

export function HeroSection() {
  const { project } = useSiteRuntime();
  const target = useMainTarget();
  const p = project.palette;
  const category = getCategory(project.category);
  return (
    <section className="overflow-hidden p-6 sm:p-10 lg:p-14" style={{ background: p.hero, color: p.heroFg, borderRadius: "calc(var(--r) * 1.5rem)" }}>
      <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 sm:space-y-5">
          <span className="text-xs font-bold tracking-[0.18em] uppercase opacity-70">{category?.name}</span>
          <h1 className="ws-h text-3xl leading-tight text-balance sm:text-5xl lg:text-6xl">{project.headline}</h1>
          <p className="max-w-xl text-[15px] leading-relaxed opacity-80 sm:text-lg">{project.summary}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a href={target} className="ws-btn">
              {project.nav[0] ?? "Xem ngay"} <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
        <div
          className="hidden aspect-[4/3] place-items-center md:grid"
          style={{ background: `color-mix(in srgb, ${p.heroFg} 10%, transparent)`, borderRadius: "calc(var(--r) * 1.25rem)" }}
        >
          <KindIcon className="size-1/3" strokeWidth={1.2} />
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection({ props }: Props) {
  const { project } = useSiteRuntime();
  const items = lines(props.items);
  const list = items.length ? items : project.features;
  return (
    <section>
      {props.title && <Title>{props.title}</Title>}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((f) => (
          <li key={f} className="ws-card flex items-center gap-3 p-4 text-[15px]">
            <span className="ws-soft grid size-10 shrink-0 place-items-center">
              <KindIcon className="ws-accent size-5" strokeWidth={1.6} />
            </span>
            {f}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AboutSection({ props }: Props) {
  const { project } = useSiteRuntime();
  const img = safeImageUrl(props.image);
  return (
    <section className="grid items-center gap-8 md:grid-cols-2">
      <div className="ws-soft grid aspect-[4/3] place-items-center overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh do admin dán link
          <img src={img} alt="" className="size-full object-cover" />
        ) : (
          <KindIcon className="ws-accent size-1/4" strokeWidth={1.2} />
        )}
      </div>
      <div>
        {props.title && <Title>{props.title}</Title>}
        <p className="ws-muted text-[15px] leading-relaxed whitespace-pre-line sm:text-lg">{props.text || project.description}</p>
      </div>
    </section>
  );
}

export function StatsSection({ props }: Props) {
  const items = pairs(props.items);
  if (!items.length) return null;
  return (
    <section className="ws-card grid grid-cols-2 gap-6 p-6 sm:p-8 lg:grid-flow-col lg:grid-cols-none">
      {items.map(([num, label]) => (
        <div key={num + label} className="text-center">
          <div className="ws-h ws-accent text-3xl sm:text-4xl">{num}</div>
          <div className="ws-muted mt-1 text-sm">{label}</div>
        </div>
      ))}
    </section>
  );
}

export function GallerySection({ props }: Props) {
  const { products } = useSiteRuntime();
  const own = lines(props.images).map((u) => safeImageUrl(u)).filter((u): u is string => !!u);
  const fromProducts = products.map((p) => safeImageUrl(p.image)).filter((u): u is string => !!u);
  const images = own.length ? own : fromProducts;
  const tiles = images.length ? images.slice(0, 8) : Array.from({ length: 6 }, () => "");
  return (
    <section>
      {props.title && <Title>{props.title}</Title>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map((src, i) => (
          <div key={src + i} className={`ws-soft grid place-items-center overflow-hidden ${i === 0 ? "row-span-2 aspect-[3/4] md:aspect-auto" : "aspect-square"}`}>
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element -- ảnh do admin dán link
              <img src={src} alt="" className="size-full object-cover" />
            ) : (
              <KindIcon className="ws-accent size-1/4 opacity-60" strokeWidth={1.2} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function CtaSection({ props }: Props) {
  const target = useMainTarget();
  const link = props.link?.trim();
  const href = link && (/^https?:\/\//.test(link) || link.startsWith("#") || link.startsWith("tel:") || link.startsWith("mailto:")) ? link : target;
  return (
    <section
      className="flex flex-col items-start justify-between gap-6 p-6 text-white sm:p-10 md:flex-row md:items-center"
      style={{ background: "var(--accent)", borderRadius: "calc(var(--r) * 1.5rem)" }}
    >
      <div className="max-w-2xl space-y-2">
        <h2 className="ws-h text-2xl sm:text-3xl">{props.title}</h2>
        {props.text && <p className="text-[15px] opacity-90 sm:text-lg">{props.text}</p>}
      </div>
      <a
        href={href}
        className="inline-flex shrink-0 items-center gap-2 bg-white px-6 py-3 font-semibold text-[var(--accent)] transition hover:opacity-90"
        style={{ borderRadius: "var(--pill)" }}
      >
        {props.button || "Liên hệ ngay"} <ArrowRight className="size-4" />
      </a>
    </section>
  );
}

export function FaqSection({ props }: Props) {
  const items = pairs(props.items).filter(([q]) => q);
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-3xl">
      {props.title && <Title>{props.title}</Title>}
      <div className="ws-card divide-y divide-[color-mix(in_srgb,var(--fg)_10%,transparent)]">
        {items.map(([q, a]) => (
          <details key={q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
              {q}
              <ChevronDown className="ws-muted size-5 shrink-0 transition group-open:rotate-180" />
            </summary>
            {a && <p className="ws-muted pt-2 leading-relaxed">{a}</p>}
          </details>
        ))}
      </div>
    </section>
  );
}
