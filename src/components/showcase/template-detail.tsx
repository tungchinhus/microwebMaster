"use client";

import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SITE, formatVnd } from "@/config/site";
import { applyVariant, variantsOf, type Project } from "@/lib/showcase/catalog";
import { DesktopPreview, MobilePreview } from "./mini-site";

/** Ba chấm màu tóm tắt bảng màu của một giao diện. */
export function Swatch({ bg, accent, fg, size = 18 }: { bg: string; accent: string; fg: string; size?: number }) {
  return (
    <span className="inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-black/10" style={{ width: size * 1.6, height: size }}>
      <span style={{ background: bg, flex: 1 }} />
      <span style={{ background: accent, flex: 1 }} />
      <span style={{ background: fg, flex: 1 }} />
    </span>
  );
}

export function TemplateDetail({ project, categoryName }: { project: Project; categoryName?: string }) {
  const variants = variantsOf(project);
  const [variantId, setVariantId] = useState(variants[0].id);
  const shown = applyVariant(project, variantId);
  const variant = variants.find((v) => v.id === variantId)!;

  return (
    <div className="mt-6 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-8">
        <div className="relative pr-[12%] pb-[8%]">
          <div key={variantId} className="animate-[fadeUp_.4s_ease] overflow-hidden rounded-3xl shadow-2xl shadow-black/10 ring-1 ring-black/5">
            <DesktopPreview project={shown} />
          </div>
          <div
            key={`${variantId}-m`}
            className="absolute right-0 bottom-0 w-[24%] animate-[fadeUp_.55s_ease] overflow-hidden rounded-[22px] border-[5px] border-white bg-white shadow-2xl shadow-black/20 dark:border-zinc-800"
          >
            <MobilePreview project={shown} />
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold">Chọn giao diện</h2>
            <span className="text-sm text-muted-foreground">{variants.length} giao diện, cùng tính năng</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Giao diện">
            {variants.map((v) => {
              const active = v.id === variantId;
              return (
                <button
                  key={v.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setVariantId(v.id)}
                  className={`group flex flex-col gap-2 rounded-2xl border p-2 text-left transition ${
                    active ? "border-foreground ring-2 ring-foreground/10" : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  <div className="overflow-hidden rounded-xl ring-1 ring-black/5">
                    <DesktopPreview project={applyVariant(project, v.id)} />
                  </div>
                  <div className="flex items-center gap-2 px-1 pb-1">
                    <Swatch bg={v.palette.bg} accent={v.palette.accent} fg={v.palette.fg} size={12} />
                    <span className="text-sm font-medium">{v.name}</span>
                    {active && <Check className="ml-auto size-4" />}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[15px] text-muted-foreground">
            <span className="font-medium text-foreground">{variant.name}:</span> {variant.description}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <span className="text-[15px] font-medium text-primary">{categoryName}</span>
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
        <div className="rounded-[24px] border border-border/60 bg-card p-6 lg:sticky lg:top-28">
          <div className="text-sm text-muted-foreground">Giá trọn gói · giao diện {variant.name}</div>
          <div className="mt-1 text-3xl font-bold tracking-tight">từ {formatVnd(project.price)}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Bàn giao trong {SITE.deliveryDays} · Hoàn tiền trong {SITE.refundDays} ngày
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href={`/bao-gia?mau=${project.slug}&giao-dien=${variantId}`}
              className="inline-flex items-center justify-center rounded-full bg-primary py-3.5 text-lg font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Xin báo giá giao diện này
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
  );
}
