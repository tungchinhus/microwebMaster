"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { generateWebsiteCode, validateConfig } from "@/lib/generator";
import { buildFromTemplate } from "@/lib/generator/template-mode";
import { useBuilderStore } from "@/store/builder-store";

// Một lượt tạo tại một thời điểm, giữ ngoài React để vẫn hủy được khi đổi trang.
let controller: AbortController | null = null;

export function useGeneration() {
  const router = useRouter();

  const start = useCallback(async () => {
    const { config, setProgress, setGenerating, setResult } = useBuilderStore.getState();
    const invalid = validateConfig(config);
    if (invalid) {
      setProgress({ phase: "error", completedBatches: 0, totalBatches: 0, currentLabel: "", log: [invalid] });
      return;
    }
    controller?.abort();
    controller = new AbortController();
    setGenerating(true);
    setProgress({ phase: "preparing", completedBatches: 0, totalBatches: 1, currentLabel: "Chuẩn bị", log: [] });
    try {
      const result =
        config.mode === "template"
          ? await buildFromTemplate(config, controller.signal)
          : await generateWebsiteCode(config, { signal: controller.signal, onProgress: setProgress });
      if (config.mode === "template") {
        setProgress({ phase: "done", completedBatches: 1, totalBatches: 1, currentLabel: "Hoàn tất", log: [`Đã xuất ${result.files.length} file từ template.`] });
      }
      setResult(result);
      router.push("/result");
    } catch (err) {
      const message = (err as Error).message || "Có lỗi xảy ra.";
      const prev = useBuilderStore.getState().progress;
      setProgress({
        phase: "error",
        completedBatches: prev?.completedBatches ?? 0,
        totalBatches: prev?.totalBatches ?? 0,
        currentLabel: "",
        log: [...(prev?.log ?? []), message],
      });
    } finally {
      setGenerating(false);
      controller = null;
    }
  }, [router]);

  const cancel = useCallback(() => controller?.abort(), []);

  return { start, cancel };
}
