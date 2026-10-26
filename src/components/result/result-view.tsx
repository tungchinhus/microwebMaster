"use client";

import { AlertTriangle, Check, Copy, Download, FileDown, Loader2, Rocket, Sparkles, Terminal, Wand2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useHydrated } from "@/components/store-hydrator";
import { Button, ButtonLink, Card, Input } from "@/components/ui";
import { regenerateFile } from "@/lib/generator";
import { findSpec } from "@/lib/generator/blueprint";
import { downloadText, downloadZip } from "@/lib/zip";
import { useBuilderStore } from "@/store/builder-store";
import { CodeViewer } from "./code-viewer";
import { FileTree } from "./file-tree";

const SOURCE_LABEL = { ai: "AI viết", static: "Khung dự án", template: "Template" } as const;

function DeployGuide({ steps }: { steps: string[] }) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 flex items-center gap-2 font-semibold">
        <Rocket className="size-4 text-primary" /> Hướng dẫn chạy nhanh
      </h2>
      <ol className="space-y-2 text-sm">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{i + 1}</span>
            <span className="text-muted-foreground">{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 rounded-lg bg-muted/70 p-3 font-mono text-xs">
        <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
          <Terminal className="size-3.5" /> Terminal
        </div>
        <div>npm install</div>
        <div>npm run dev</div>
      </div>
    </Card>
  );
}

export function ResultView() {
  const hydrated = useHydrated();
  const result = useBuilderStore((s) => s.result);
  const config = useBuilderStore((s) => s.config);
  const updateResultFile = useBuilderStore((s) => s.updateResultFile);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [revising, setRevising] = useState(false);
  const [reviseError, setReviseError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const defaultPath = useMemo(
    () => result?.files.find((f) => f.path === "src/App.jsx")?.path ?? result?.files.find((f) => f.path.startsWith("src/"))?.path ?? result?.files[0]?.path ?? "",
    [result],
  );
  const path = selectedPath || defaultPath;
  const file = result?.files.find((f) => f.path === path);
  const isMissing = result?.missing.includes(path) ?? false;
  const canRevise = result?.mode === "ai" && !!findSpec(path);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Đang tải...
      </div>
    );
  }
  if (!result) {
    return (
      <Card className="mx-auto max-w-lg space-y-4 p-8 text-center">
        <Sparkles className="mx-auto size-10 text-primary" />
        <h1 className="text-xl font-semibold">Chưa có website nào được tạo</h1>
        <p className="text-sm text-muted-foreground">Điền cấu hình cửa hàng và bấm tạo website để xem mã nguồn tại đây.</p>
        <ButtonLink href="/">Bắt đầu tạo</ButtonLink>
      </Card>
    );
  }

  const aiCount = result.files.filter((f) => f.source === "ai").length;
  const totalLines = result.files.reduce((n, f) => n + (f.encoding ? 0 : f.content.split("\n").length), 0);

  const copy = async () => {
    if (!file) return;
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const revise = async () => {
    setReviseError("");
    setRevising(true);
    abortRef.current = new AbortController();
    try {
      const content = await regenerateFile(config, path, file?.content ?? "", instruction, abortRef.current.signal);
      updateResultFile(path, content);
      setInstruction("");
    } catch (err) {
      setReviseError((err as Error).message);
    } finally {
      setRevising(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{result.storeName}</h1>
          <p className="text-sm text-muted-foreground">
            {result.files.length} file · {totalLines.toLocaleString("vi-VN")} dòng
            {result.mode === "ai" ? ` · ${aiCount} file do ${result.model} viết` : " · từ template TechZone"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/" variant="outline">Chỉnh cấu hình</ButtonLink>
          <Button
            loading={zipping}
            onClick={async () => {
              setZipping(true);
              try {
                await downloadZip(result);
              } finally {
                setZipping(false);
              }
            }}
          >
            <Download className="size-4" /> Download Code (.zip)
          </Button>
        </div>
      </div>

      {result.missing.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <div className="font-semibold">Còn {result.missing.length} file Gemini chưa viết được</div>
            <div>Chọn file có dấu cảnh báo trong cây thư mục và bấm &quot;Tạo file này bằng AI&quot;.</div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="max-h-[70vh] overflow-y-auto p-2">
          <FileTree files={result.files} missing={result.missing} selected={path} onSelect={setSelectedPath} />
        </Card>

        <Card className="flex min-w-0 flex-col overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
            <span className="truncate font-mono text-xs font-medium">{path}</span>
            {file && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{SOURCE_LABEL[file.source]}</span>
            )}
            <div className="ml-auto flex gap-1">
              <Button size="sm" variant="ghost" onClick={copy} disabled={!file || !!file.encoding}>
                {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                {copied ? "Đã copy" : "Copy Code"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => file && downloadText(path, file.content)} disabled={!file || !!file.encoding}>
                <FileDown className="size-3.5" /> Tải file
              </Button>
            </div>
          </div>

          <div className="max-h-[60vh] min-h-64 flex-1 overflow-auto">
            {isMissing ? (
              <div className="p-8 text-center text-sm text-muted-foreground">File này chưa được tạo.</div>
            ) : file?.encoding ? (
              <div className="p-8 text-center text-sm text-muted-foreground">File nhị phân, có trong file .zip.</div>
            ) : file ? (
              <CodeViewer path={path} code={file.content} />
            ) : null}
          </div>

          {canRevise && (
            <div className="space-y-2 border-t border-border p-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  aria-label="Yêu cầu chỉnh sửa file"
                  placeholder={isMissing ? "Yêu cầu thêm (không bắt buộc)" : "Mô tả chỉnh sửa, ví dụ: thêm bộ lọc theo khoảng giá"}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  disabled={revising}
                />
                {revising ? (
                  <Button variant="outline" onClick={() => abortRef.current?.abort()}>Hủy</Button>
                ) : null}
                <Button onClick={revise} loading={revising} disabled={!config.ai.geminiApiKey.trim()}>
                  <Wand2 className="size-4" /> {isMissing ? "Tạo file này bằng AI" : "Viết lại bằng AI"}
                </Button>
              </div>
              {!config.ai.geminiApiKey.trim() && <p className="text-xs text-muted-foreground">Nhập lại Gemini API Key ở trang cấu hình để dùng tính năng này.</p>}
              {reviseError && <p className="text-xs text-red-500">{reviseError}</p>}
            </div>
          )}
        </Card>
      </div>

      <DeployGuide steps={result.setupSteps} />
    </div>
  );
}
