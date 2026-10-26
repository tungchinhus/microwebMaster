import JSZip from "jszip";
import type { GenerationResult } from "./types";
import { packageName } from "./generator/static-files";

export async function downloadZip(result: GenerationResult): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(packageName(result.storeName))!;
  for (const f of result.files) {
    folder.file(f.path, f.content, f.encoding === "base64" ? { base64: true } : undefined);
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  downloadBlob(blob, `${packageName(result.storeName)}.zip`);
}

export function downloadText(path: string, content: string): void {
  downloadBlob(new Blob([content], { type: "text/plain;charset=utf-8" }), path.split("/").pop() || "file.txt");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
