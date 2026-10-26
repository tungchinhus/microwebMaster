import { GoogleGenAI } from "@google/genai";
import type { AiSettings } from "../types";

export interface RawFile {
  path: string;
  content: string;
}

const FILES_SCHEMA = {
  type: "object",
  properties: {
    files: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
        },
        required: ["path", "content"],
      },
    },
  },
  required: ["files"],
};

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

function friendlyError(err: unknown): GeminiError {
  const raw = err instanceof Error ? err.message : String(err);
  const status = Number((err as { status?: number })?.status ?? raw.match(/"code":\s*(\d{3})/)?.[1] ?? 0);
  if (status === 400 && /api key/i.test(raw)) return new GeminiError("Gemini API Key không hợp lệ.", false);
  if (status === 401 || status === 403) return new GeminiError("Gemini từ chối API Key (sai key hoặc chưa bật Gemini API).", false);
  if (status === 404) return new GeminiError("Không tìm thấy model. Hãy chọn model khác.", false);
  if (status === 429) return new GeminiError("Vượt giới hạn gọi Gemini (quota). Đợi một lát rồi thử lại.", true);
  if (status >= 500) return new GeminiError("Máy chủ Gemini đang bận, đang thử lại...", true);
  if ((err as Error)?.name === "AbortError") return new GeminiError("Đã hủy.", false);
  return new GeminiError(`Lỗi gọi Gemini: ${raw.slice(0, 300)}`, true);
}

/** Bỏ ``` bao quanh nếu model vẫn thêm vào nội dung file. */
export function stripFences(content: string): string {
  const m = content.match(/^\s*```[a-zA-Z]*\n([\s\S]*?)\n```\s*$/);
  return (m ? m[1] : content).replace(/\r\n/g, "\n").trimEnd() + "\n";
}

export function parseFiles(text: string): RawFile[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    // Một số model bọc JSON trong ```json ... ```.
    const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!m) throw new GeminiError("Gemini trả về dữ liệu không phải JSON.", true);
    data = JSON.parse(m[1]);
  }
  const files = (data as { files?: unknown })?.files;
  if (!Array.isArray(files)) throw new GeminiError("Gemini trả về JSON thiếu trường files.", true);
  return files
    .filter((f): f is RawFile => typeof f?.path === "string" && typeof f?.content === "string")
    .map((f) => ({ path: f.path.replace(/^\.?\//, "").trim(), content: stripFences(f.content) }));
}

export function createClient(ai: AiSettings): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: ai.geminiApiKey.trim(),
    ...(ai.baseUrl.trim() ? { httpOptions: { baseUrl: ai.baseUrl.trim() } } : {}),
  });
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new GeminiError("Đã hủy.", false));
    });
  });

/** Gọi Gemini, yêu cầu trả JSON danh sách file; tự thử lại với lỗi tạm thời. */
export async function generateFiles(
  client: GoogleGenAI,
  model: string,
  system: string,
  prompt: string,
  { signal, attempts = 3, onRetry }: { signal?: AbortSignal; attempts?: number; onRetry?: (msg: string) => void } = {},
): Promise<RawFile[]> {
  let lastError: GeminiError | null = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (signal?.aborted) throw new GeminiError("Đã hủy.", false);
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
          responseJsonSchema: FILES_SCHEMA,
          temperature: 0.4,
          maxOutputTokens: 65536,
          abortSignal: signal,
        },
      });
      const text = response.text ?? "";
      if (!text.trim()) {
        const reason = response.candidates?.[0]?.finishReason;
        throw new GeminiError(`Gemini không trả nội dung${reason ? ` (${reason})` : ""}.`, true);
      }
      return parseFiles(text);
    } catch (err) {
      lastError = err instanceof GeminiError ? err : friendlyError(err);
      if (!lastError.retryable || attempt === attempts || signal?.aborted) throw lastError;
      onRetry?.(`${lastError.message} Thử lại lần ${attempt + 1}/${attempts}...`);
      await sleep(2000 * 2 ** (attempt - 1), signal);
    }
  }
  throw lastError ?? new GeminiError("Không rõ lỗi.", false);
}
