import sdk from "@stackblitz/sdk";
import type { GenerationResult } from "./types";

/**
 * Mở mã nguồn vừa tạo trên StackBlitz: trình duyệt tự chạy npm install và npm run dev
 * (WebContainers), nên xem được website ngay mà không cần cài gì trên máy.
 */
export function openInStackBlitz(result: GenerationResult): void {
  const files: Record<string, string> = {};
  // StackBlitz chỉ nhận file văn bản; file nhị phân (favicon.ico) vẫn có trong bản .zip.
  for (const f of result.files) if (!f.encoding) files[f.path] = f.content;

  sdk.openProject(
    {
      title: result.storeName,
      description: `Website ${result.storeName} tạo bởi Web Master`,
      template: "node",
      files,
    },
    {
      newWindow: true,
      startScript: "dev",
      openFile: result.mode === "ai" ? "src/App.jsx" : "src/config/store.ts",
    },
  );
}
