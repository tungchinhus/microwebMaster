"use client";

import { AlertCircle, CheckCircle2, FileCode2, Sparkles, X } from "lucide-react";
import { Button, ButtonLink, Card } from "@/components/ui";
import { AI_FILE_PATHS } from "@/lib/generator/blueprint";
import { validateConfig } from "@/lib/generator";
import { isFirebaseComplete } from "@/lib/firebase-config";
import { getTheme } from "@/lib/themes";
import { useGeneration } from "@/lib/use-generation";
import { useBuilderStore } from "@/store/builder-store";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  );
}

export function GeneratePanel() {
  const config = useBuilderStore((s) => s.config);
  const progress = useBuilderStore((s) => s.progress);
  const generating = useBuilderStore((s) => s.generating);
  const hasResult = useBuilderStore((s) => s.result !== null);
  const { start, cancel } = useGeneration();

  const theme = getTheme(config.theme);
  const invalid = validateConfig(config);
  const percent = progress && progress.totalBatches ? Math.round((progress.completedBatches / progress.totalBatches) * 100) : 0;
  const isAi = config.mode === "ai";

  return (
    <Card className="space-y-5 p-5">
      <div>
        <h2 className="font-semibold">Tóm tắt</h2>
        <p className="text-xs text-muted-foreground">Kiểm tra lại trước khi tạo website.</p>
      </div>
      <div className="space-y-2">
        <Row label="Cửa hàng" value={config.store.name || "(chưa nhập)"} />
        <Row
          label="Theme"
          value={
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-full" style={{ background: config.store.primaryColor }} />
              {theme.name}
            </span>
          }
        />
        <Row label="Cách tạo" value={isAi ? `Gemini · ${config.ai.model}` : "Template TechZone"} />
        <Row label="Firebase" value={isFirebaseComplete(config.firebase) ? "Đã điền đủ" : "Điền sau trong .env"} />
        {isAi && <Row label="Số file AI viết" value={`${AI_FILE_PATHS.length} file + khung dự án`} />}
      </div>

      {generating && progress ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{progress.currentLabel || "Đang chạy..."}</span>
            <span className="text-muted-foreground">{percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.max(percent, 4)}%` }} />
          </div>
          {isAi && <p className="text-xs text-muted-foreground">Gemini thường mất 2 đến 5 phút. Giữ tab này mở.</p>}
          <Button variant="outline" className="w-full" onClick={cancel}>
            <X className="size-4" /> Hủy
          </Button>
        </div>
      ) : (
        <Button size="lg" className="w-full" disabled={!!invalid} onClick={start}>
          <Sparkles className="size-5" />
          {isAi ? "Tự động tạo Website bằng AI" : "Xuất mã nguồn từ template"}
        </Button>
      )}
      {invalid && !generating && <p className="text-xs text-muted-foreground">{invalid}</p>}

      {progress && progress.log.length > 0 && (
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg bg-muted/60 p-3 font-mono text-[11px] leading-relaxed" aria-live="polite">
          {progress.log.map((line, i) => (
            <div key={i} className={progress.phase === "error" && i === progress.log.length - 1 ? "text-red-500" : "text-muted-foreground"}>
              {line}
            </div>
          ))}
        </div>
      )}
      {progress?.phase === "error" && !generating && (
        <p className="flex items-start gap-2 text-sm text-red-500">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> Chưa tạo xong. Sửa lỗi ở trên rồi bấm tạo lại.
        </p>
      )}
      {hasResult && !generating && (
        <ButtonLink href="/result" variant="outline" className="w-full">
          {progress?.phase === "done" ? <CheckCircle2 className="size-4 text-emerald-500" /> : <FileCode2 className="size-4" />}
          Xem kết quả gần nhất
        </ButtonLink>
      )}
    </Card>
  );
}
