import type { BuilderConfig, GeneratedFile, GenerationProgress, GenerationResult } from "../types";
import { BATCHES, findSpec, type FileSpec } from "./blueprint";
import { createClient, generateFiles, GeminiError } from "./gemini";
import { batchPrompt, revisePrompt, systemInstruction } from "./prompt";
import { buildStaticFiles, SETUP_STEPS } from "./static-files";

/** Mỗi lần gọi Gemini viết tối đa bấy nhiêu file, để không chạm giới hạn độ dài trả lời. */
const FILES_PER_CALL = 3;
/** Số lần gọi Gemini chạy song song (giữ thấp để không vượt quota gói miễn phí). */
const CONCURRENCY = 2;

interface Job {
  label: string;
  files: FileSpec[];
}

function planJobs(): Job[] {
  return BATCHES.flatMap((batch) => {
    const jobs: Job[] = [];
    for (let i = 0; i < batch.files.length; i += FILES_PER_CALL) {
      const part = batch.files.slice(i, i + FILES_PER_CALL);
      jobs.push({ label: `${batch.label}: ${part.map((f) => f.path.split("/").pop()).join(", ")}`, files: part });
    }
    return jobs;
  });
}

export function validateConfig(config: BuilderConfig): string | null {
  if (!config.store.name.trim()) return "Vui lòng nhập tên cửa hàng.";
  if (config.mode === "ai" && !config.ai.geminiApiKey.trim()) return "Vui lòng nhập Gemini API Key.";
  if (config.mode === "ai" && !config.ai.model.trim()) return "Vui lòng chọn model Gemini.";
  return null;
}

/**
 * Sinh toàn bộ mã nguồn website: Web Master tạo khung dự án cố định, Gemini viết phần
 * giao diện và logic theo bản thiết kế, chia thành nhiều lần gọi nhỏ chạy song song.
 */
export async function generateWebsiteCode(
  config: BuilderConfig,
  { onProgress, signal }: { onProgress?: (p: GenerationProgress) => void; signal?: AbortSignal } = {},
): Promise<GenerationResult> {
  const invalid = validateConfig(config);
  if (invalid) throw new GeminiError(invalid, false);

  const jobs = planJobs();
  const progress: GenerationProgress = {
    phase: "preparing",
    completedBatches: 0,
    totalBatches: jobs.length,
    currentLabel: "Chuẩn bị prompt",
    log: [],
  };
  const emit = (patch: Partial<GenerationProgress>, logLine?: string) => {
    Object.assign(progress, patch);
    if (logLine) progress.log = [...progress.log, logLine];
    onProgress?.({ ...progress });
  };

  const client = createClient(config.ai);
  const system = systemInstruction(config);
  const results = new Map<string, string>();
  emit({ phase: "generating" }, `Bắt đầu gọi ${config.ai.model}: ${jobs.length} lượt, mỗi lượt tối đa ${FILES_PER_CALL} file.`);

  const runJob = async (job: Job) => {
    emit({ currentLabel: job.label }, `Đang viết: ${job.files.map((f) => f.path).join(", ")}`);
    const wanted = new Set(job.files.map((f) => f.path));
    const accept = (files: { path: string; content: string }[]) => {
      for (const f of files) if (wanted.has(f.path) && f.content.trim()) results.set(f.path, f.content);
    };
    const opts = { signal, onRetry: (m: string) => emit({}, m) };

    accept(await generateFiles(client, config.ai.model, system, batchPrompt(job.files), opts));
    const missing = job.files.filter((f) => !results.has(f.path));
    if (missing.length) {
      emit({}, `Thiếu ${missing.map((f) => f.path).join(", ")}, yêu cầu viết bổ sung...`);
      accept(await generateFiles(client, config.ai.model, system, batchPrompt(missing), opts));
    }
    emit({ completedBatches: progress.completedBatches + 1 }, `Xong: ${job.label}`);
  };

  // Hàng đợi đơn giản với số luồng cố định; lỗi không thể thử lại sẽ dừng toàn bộ.
  const queue = [...jobs];
  const failures: string[] = [];
  let fatal: GeminiError | null = null;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length && !fatal) {
        const job = queue.shift()!;
        try {
          await runJob(job);
        } catch (err) {
          const e = err instanceof GeminiError ? err : new GeminiError(String(err), false);
          if (!e.retryable || signal?.aborted) fatal = e;
          else {
            failures.push(job.label);
            emit({ completedBatches: progress.completedBatches + 1 }, `Lỗi ở "${job.label}": ${e.message}`);
          }
        }
      }
    }),
  );
  if (fatal) {
    emit({ phase: "error" }, (fatal as GeminiError).message);
    throw fatal;
  }

  emit({ phase: "finalizing", currentLabel: "Ghép mã nguồn" });
  const aiFiles: GeneratedFile[] = jobs
    .flatMap((j) => j.files)
    .filter((f) => results.has(f.path))
    .map((f) => ({ path: f.path, content: results.get(f.path)!, source: "ai" }));
  const missing = jobs.flatMap((j) => j.files.map((f) => f.path)).filter((p) => !results.has(p));

  const result: GenerationResult = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    mode: "ai",
    model: config.ai.model,
    storeName: config.store.name,
    files: sortFiles([...buildStaticFiles(config), ...aiFiles]),
    missing,
    setupSteps: SETUP_STEPS,
  };
  emit(
    { phase: "done", currentLabel: "Hoàn tất" },
    missing.length
      ? `Hoàn tất, còn ${missing.length} file lỗi (${failures.length} lượt thất bại). Bấm "Viết lại" ở từng file để thử lại.`
      : `Hoàn tất: ${result.files.length} file.`,
  );
  return result;
}

/** Viết lại một file AI (sửa lỗi hoặc theo yêu cầu của người dùng). */
export async function regenerateFile(
  config: BuilderConfig,
  path: string,
  currentContent: string,
  instruction: string,
  signal?: AbortSignal,
): Promise<string> {
  const spec = findSpec(path);
  if (!spec) throw new GeminiError("File này không do AI tạo nên không viết lại được.", false);
  const invalid = validateConfig({ ...config, mode: "ai" });
  if (invalid) throw new GeminiError(invalid, false);
  const client = createClient(config.ai);
  const prompt = currentContent.trim() ? revisePrompt(spec, currentContent, instruction) : batchPrompt([spec]);
  const files = await generateFiles(client, config.ai.model, systemInstruction(config), prompt, { signal });
  const file = files.find((f) => f.path === path) ?? (files.length === 1 ? files[0] : undefined);
  if (!file) throw new GeminiError("Gemini không trả về file được yêu cầu.", true);
  return file.content;
}

export function sortFiles(files: GeneratedFile[]): GeneratedFile[] {
  return [...files].sort((a, b) => {
    const da = a.path.includes("/") ? 0 : 1;
    const db = b.path.includes("/") ? 0 : 1;
    return da - db || a.path.localeCompare(b.path);
  });
}
