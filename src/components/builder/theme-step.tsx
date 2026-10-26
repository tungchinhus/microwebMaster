"use client";

import { Check } from "lucide-react";
import { StepCard } from "@/components/ui";
import { THEMES, type ThemePreset } from "@/lib/themes";
import { useBuilderStore } from "@/store/builder-store";

/** Ảnh minh họa thu nhỏ của theme, vẽ bằng CSS theo bảng màu. */
function ThemePreview({ theme }: { theme: ThemePreset }) {
  const { background, surface, text, accent } = theme.preview;
  const radius = theme.id === "elegant" ? 2 : theme.id === "vibrant" || theme.id === "organic" ? 10 : 6;
  const border = theme.id === "vibrant" ? `2px solid ${text}` : `1px solid ${text}1a`;
  return (
    <div className="overflow-hidden rounded-lg border border-border" style={{ background }} aria-hidden>
      <div className="flex items-center gap-1.5 px-2.5 py-2" style={{ borderBottom: `1px solid ${text}14` }}>
        <span className="size-2.5 rounded-sm" style={{ background: accent }} />
        <span className="h-1.5 w-10 rounded" style={{ background: text, opacity: 0.7 }} />
        <span className="ml-auto h-1.5 w-6 rounded" style={{ background: text, opacity: 0.25 }} />
      </div>
      <div className="space-y-2 p-2.5">
        <div className="rounded p-2" style={{ background: accent, borderRadius: radius }}>
          <div className="h-1.5 w-14 rounded bg-white/90" />
          <div className="mt-1 h-1 w-10 rounded bg-white/60" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-1" style={{ background: surface, borderRadius: radius, border }}>
              <div className="aspect-square rounded-sm" style={{ background: `${accent}${i === 1 ? "55" : "30"}` }} />
              <div className="mt-1 h-1 rounded" style={{ background: text, opacity: 0.5 }} />
              <div className="mt-0.5 h-1 w-1/2 rounded" style={{ background: accent }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ThemeStep() {
  const current = useBuilderStore((s) => s.config.theme);
  const setTheme = useBuilderStore((s) => s.setTheme);
  return (
    <StepCard step={2} title="Chọn theme giao diện" description="AI sẽ thiết kế website theo phong cách này. Màu chủ đạo đổi được ở bước 3.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {THEMES.map((t) => {
          const active = t.id === current;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              aria-pressed={active}
              className={`relative space-y-3 rounded-xl border p-3 text-left transition hover:border-primary/60 ${
                active ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
            >
              {active && (
                <span className="absolute right-2 top-2 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
              <ThemePreview theme={t} />
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </StepCard>
  );
}
