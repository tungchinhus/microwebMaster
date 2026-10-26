/** Đường dẫn tới các file runtime do scripts/build-runtime.mjs tạo trong public/runtime. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const runtimeUrl = (file: string) => `${BASE_PATH}/runtime/${file}`;

export interface RuntimeManifest {
  imports: Record<string, string>;
  files: string[];
  versions: Record<string, string>;
}

let manifestPromise: Promise<RuntimeManifest> | null = null;
export function loadManifest(): Promise<RuntimeManifest> {
  manifestPromise ??= fetch(runtimeUrl("manifest.json")).then((r) => {
    if (!r.ok) throw new Error("Thiếu runtime build. Hãy chạy npm run build-runtime.");
    return r.json();
  });
  return manifestPromise;
}

const textCache = new Map<string, Promise<string>>();
export function loadRuntimeText(file: string): Promise<string> {
  if (!textCache.has(file)) {
    textCache.set(
      file,
      fetch(runtimeUrl(file)).then((r) => {
        if (!r.ok) throw new Error(`Không tải được ${file}`);
        return r.text();
      }),
    );
  }
  return textCache.get(file)!;
}
