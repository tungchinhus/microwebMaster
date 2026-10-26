"use client";

import { Check, ShoppingBag } from "lucide-react";
import { StepCard } from "@/components/ui";
import { SITE_TYPES } from "@/lib/site-types";
import { useBuilderStore } from "@/store/builder-store";

export function SiteTypeStep() {
  const siteType = useBuilderStore((s) => s.config.siteType);
  return (
    <StepCard step={1} title="Chọn loại website" description="Giai đoạn 1 hỗ trợ web bán hàng kèm quản lý sản phẩm.">
      <div className="grid gap-3 sm:grid-cols-3">
        {SITE_TYPES.map((t) => {
          const active = t.available && t.id === siteType;
          return (
            <div
              key={t.id}
              aria-disabled={!t.available}
              className={`relative rounded-xl border p-4 text-sm transition ${
                active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border"
              } ${t.available ? "" : "opacity-50"}`}
            >
              {active && (
                <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
              <ShoppingBag className="mb-2 size-5 text-primary" />
              <div className="font-semibold">{t.name}</div>
              <p className="mt-1 text-xs text-muted-foreground">{t.available ? t.description : "Sắp ra mắt"}</p>
              {t.available && (
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {t.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </StepCard>
  );
}
