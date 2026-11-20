"use client";

import { ArrowLeft, Maximize, Minimize, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { variantsOf, type Project } from "@/lib/showcase/catalog";
import { Swatch } from "./template-detail";

type Device = "desktop" | "mobile";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SMALL = "(max-width: 639px)";
const subscribeSmall = (cb: () => void) => {
  const mq = window.matchMedia(SMALL);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function DemoViewer({ project }: { project: Project }) {
  const params = useSearchParams();
  const variants = variantsOf(project);
  const [variantId, setVariantId] = useState(variants.find((v) => v.id === params.get("giao-dien"))?.id ?? variants[0].id);
  // Chưa bấm chọn thì màn hình nhỏ xem bản điện thoại (bản máy tính thu nhỏ quá khó đọc).
  const [picked, setDevice] = useState<Device | null>(null);
  const small = useSyncExternalStore(subscribeSmall, () => window.matchMedia(SMALL).matches, () => false);
  const device: Device = picked ?? (small ? "mobile" : "desktop");
  const [fullscreen, setFullscreen] = useState(false);
  
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const seg = (active: boolean) =>
    `inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition ${active ? "bg-white text-zinc-900" : "text-white/70 hover:text-white"}`;

  return (
    <div className="flex h-dvh flex-col bg-zinc-950 text-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-2.5">
        <Link href={`/mau/${project.slug}`} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white">
          <ArrowLeft className="size-4" /> Quay lại
        </Link>
        <div className="font-semibold">{project.name}</div>
        {!project.demoUrl && <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">Bản xem trước</span>}

        <div className="mx-auto flex flex-wrap items-center gap-1 rounded-full bg-white/10 p-1">
          {variants.map((v) => (
            <button key={v.id} onClick={() => setVariantId(v.id)} className={seg(v.id === variantId)} aria-pressed={v.id === variantId}>
              <Swatch bg={v.palette.bg} accent={v.palette.accent} fg={v.palette.fg} size={10} />
              {v.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
          <button onClick={() => setDevice("desktop")} className={seg(device === "desktop")} aria-label="Máy tính" aria-pressed={device === "desktop"}>
            <Monitor className="size-4" /> <span className="hidden sm:inline">Máy tính</span>
          </button>
          <button onClick={() => setDevice("mobile")} className={seg(device === "mobile")} aria-label="Điện thoại" aria-pressed={device === "mobile"}>
            <Smartphone className="size-4" /> <span className="hidden sm:inline">Điện thoại</span>
          </button>
        </div>
        <button onClick={toggleFullscreen} className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/10" aria-label={fullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
          {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </button>
        <Link
          href={`/bao-gia?mau=${project.slug}&giao-dien=${variantId}`}
          className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:brightness-110"
        >
          Xin báo giá
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 items-stretch justify-center p-3 sm:p-5">
        {project.demoUrl ? (
          <iframe
            key={device}
            src={project.demoUrl}
            title={`Demo ${project.name}`}
            className={`h-full rounded-xl bg-white shadow-2xl ${device === "mobile" ? "w-[390px] max-w-full" : "w-full"}`}
          />
        ) : (
          // Toàn bộ trang mẫu (đủ các khối) trong khung cuộn được; khung điện thoại rộng 390px để thấy đúng bố cục di động.
          <iframe
            key={`${variantId}-${device}`}
            src={`${BASE}/xem/${project.slug}/?giao-dien=${variantId}`}
            title={`Toàn bộ mẫu ${project.name}`}
            className={`h-full animate-[fadeUp_.35s_ease] bg-white shadow-2xl shadow-black/50 ${
              device === "mobile" ? "w-[390px] max-w-full rounded-panel border-[10px] border-zinc-800" : "w-full rounded-xl"
            }`}
          />
        )}
      </div>
    </div>
  );
}
