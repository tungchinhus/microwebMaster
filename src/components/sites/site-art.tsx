"use client";

import {
  BookOpen,
  Bot,
  Box,
  BrainCircuit,
  Briefcase,
  Car,
  Cpu,
  Dices,
  FileText,
  Flower2,
  Fuel,
  Gamepad2,
  Gauge,
  Gift,
  GraduationCap,
  Heart,
  House,
  Lamp,
  Leaf,
  Lightbulb,
  Package,
  PenTool,
  Puzzle,
  Rocket,
  ShoppingBag,
  Sofa,
  Sparkles,
  Star,
  Tag,
  Target,
  Trophy,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { PreviewKind } from "@/lib/showcase/catalog";
import { getCategory } from "@/lib/showcase/catalog";
import { useSiteRuntime } from "./site-runtime";

/**
 * Hình minh hoạ thay cho ảnh khi admin chưa dán link ảnh thật.
 * Vẽ bằng CSS theo bảng màu của mẫu, mỗi ô một bố cục khác nhau (theo seed),
 * để web của khách trông đã hoàn thiện thay vì một loạt ô trống giống nhau.
 */

const ICONS: Record<PreviewKind, LucideIcon[]> = {
  shop: [ShoppingBag, Gift, Package, Tag, Star, Heart],
  edu: [GraduationCap, BookOpen, PenTool, Lightbulb, Trophy, Users],
  service: [Sparkles, Flower2, Leaf, Heart, Star, Gift],
  landing: [Rocket, Zap, Target, Star, Lightbulb, Gift],
  space3d: [House, Sofa, Lamp, Box, Leaf, Star],
  jobs: [Briefcase, Users, FileText, Target, Trophy, Lightbulb],
  game: [Gamepad2, Trophy, Puzzle, Dices, Star, Zap],
  ai: [Bot, BrainCircuit, Cpu, Sparkles, Zap, Lightbulb],
  auto: [Car, Gauge, Fuel, Wrench, Star, Trophy],
};

function hash(seed: string | number): number {
  const s = String(seed);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function useKindIcons(): LucideIcon[] {
  const { project } = useSiteRuntime();
  return ICONS[getCategory(project.category)?.kind ?? "shop"];
}

export function Artwork({ seed, size = "tile", className = "", style }: { seed: string | number; size?: "hero" | "tile"; className?: string; style?: React.CSSProperties }) {
  const { palette } = useSiteRuntime();
  const icons = useKindIcons();
  const h = hash(seed);
  const pick = (n: number) => (h >>> n) % 100;
  const Main = icons[h % icons.length];
  const Second = icons[(h >>> 3) % icons.length === h % icons.length ? (h + 1) % icons.length : (h >>> 3) % icons.length];
  const angle = 100 + (pick(5) % 140);
  const a = palette.accent;
  const mix = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
  const background = [
    `radial-gradient(circle at ${15 + (pick(7) % 70)}% ${10 + (pick(9) % 40)}%, ${mix(a, 30)}, transparent 55%)`,
    `radial-gradient(circle at ${20 + (pick(11) % 60)}% ${70 + (pick(13) % 30)}%, ${mix("#ffffff", 55)}, transparent 50%)`,
    `linear-gradient(${angle}deg, ${mix(a, 12)}, ${palette.soft})`,
  ].join(", ");
  const hero = size === "hero";
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background, ...style }} aria-hidden>
      {/* Hình khối trang trí */}
      <span
        className="absolute rounded-full"
        style={{ width: "55%", aspectRatio: "1", left: `${-15 + (pick(15) % 30)}%`, bottom: `${-30 + (pick(17) % 20)}%`, background: mix(a, 16) }}
      />
      <span
        className="absolute"
        style={{
          width: "28%",
          aspectRatio: "1",
          right: `${4 + (pick(19) % 14)}%`,
          top: `${6 + (pick(21) % 14)}%`,
          borderRadius: "30%",
          rotate: `${pick(23) % 45}deg`,
          border: `2px solid ${mix(a, 35)}`,
        }}
      />
      {/* Thẻ sản phẩm ở giữa */}
      <div className="absolute inset-0 grid place-items-center">
        <div
          className="grid place-items-center shadow-xl"
          style={{
            width: hero ? "42%" : "48%",
            aspectRatio: "1",
            borderRadius: "calc(var(--r) * 1.4rem + 10%)",
            background: palette.card ?? "#ffffff",
            boxShadow: `0 18px 40px -12px ${mix(a, 45)}`,
            rotate: `${(pick(25) % 9) - 4}deg`,
          }}
        >
          <Main className="ws-accent size-1/2" strokeWidth={1.3} />
        </div>
      </div>
      {hero && (
        <>
          <div
            className="absolute grid place-items-center shadow-lg"
            style={{ width: "17%", aspectRatio: "1", left: "12%", top: "16%", borderRadius: "28%", background: a, rotate: "-8deg" }}
          >
            <Second className="size-1/2 text-white" strokeWidth={1.6} />
          </div>
          <div
            className="absolute flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg"
            style={{ right: "10%", bottom: "14%", background: palette.card ?? "#ffffff", color: a }}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="size-3.5" fill="currentColor" strokeWidth={0} />
            ))}
            <span className="ml-1" style={{ color: palette.fg }}>
              4,9
            </span>
          </div>
        </>
      )}
    </div>
  );
}
