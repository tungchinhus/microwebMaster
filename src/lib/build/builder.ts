import type { Plugin } from "esbuild-wasm";
import type { GeneratedFile } from "../types";
import { loadManifest, loadRuntimeText, runtimeUrl } from "./runtime";

/**
 * Build website (Vite + React) ngay trong trình duyệt:
 * - esbuild-wasm bundle code của shop thành assets/app.js; thư viện được giữ ở dạng
 *   import trần và trỏ tới /vendor/* bằng import map (dựng sẵn bởi build-runtime).
 * - Tailwind CSS 4 biên dịch trong trình duyệt từ src/index.css và các class xuất hiện trong code.
 */

export interface BuildIssue {
  file: string | null;
  line: number | null;
  message: string;
}

export interface BuiltSite {
  /** Đường dẫn trên hosting (bắt đầu bằng "/") -> nội dung. */
  files: Map<string, Uint8Array>;
  appBytes: number;
  cssBytes: number;
}

export class BuildError extends Error {
  constructor(readonly issues: BuildIssue[]) {
    super(issues.map((i) => `${i.file ?? "?"}${i.line ? `:${i.line}` : ""}: ${i.message}`).join("\n"));
  }
}

type Esbuild = typeof import("esbuild-wasm");
let esbuildPromise: Promise<Esbuild> | null = null;

function loadEsbuild(): Promise<Esbuild> {
  esbuildPromise ??= (async () => {
    const esbuild = await import("esbuild-wasm");
    await esbuild.initialize({ wasmURL: runtimeUrl("esbuild.wasm"), worker: true });
    return esbuild;
  })();
  return esbuildPromise;
}

/** Đọc biến VITE_* trong .env để thay cho import.meta.env như Vite. */
export function parseEnv(content: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && m[1].startsWith("VITE_")) env[m[1]] = m[2].replace(/^["'](.*)["']$/, "$1");
  }
  return env;
}

const EXTENSIONS = ["", ".jsx", ".js", "/index.jsx", "/index.js"];

function normalize(path: string): string {
  const parts: string[] = [];
  for (const p of path.split("/")) {
    if (p === "..") parts.pop();
    else if (p && p !== ".") parts.push(p);
  }
  return parts.join("/");
}

function dirname(path: string): string {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
}

function sitePlugin(sources: Map<string, string>, vendor: Record<string, string>): Plugin {
  const find = (base: string) => EXTENSIONS.map((e) => base + e).find((p) => sources.has(p));
  return {
    name: "web-master-site",
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        const spec = args.path;
        if (spec.endsWith(".css")) return { path: spec, namespace: "css-ignore" };
        let base: string | null = null;
        if (args.kind === "entry-point") base = spec;
        else if (spec.startsWith("@/")) base = "src/" + spec.slice(2);
        else if (spec.startsWith("./") || spec.startsWith("../")) base = normalize(`${dirname(args.importer)}/${spec}`);
        else if (spec.startsWith("/")) base = normalize(spec);
        if (base !== null) {
          const found = find(normalize(base));
          if (!found) return { errors: [{ text: `Không tìm thấy file "${spec}"` }] };
          return { path: found, namespace: "site" };
        }
        if (vendor[spec]) return { path: spec, external: true };
        return {
          errors: [
            {
              text: `Thư viện "${spec}" không được hỗ trợ khi deploy. Chỉ dùng: ${Object.keys(vendor).join(", ")}`,
            },
          ],
        };
      });
      build.onLoad({ filter: /.*/, namespace: "css-ignore" }, () => ({ contents: "", loader: "js" }));
      build.onLoad({ filter: /.*/, namespace: "site" }, (args) => ({
        contents: sources.get(args.path)!,
        loader: "jsx",
        resolveDir: dirname(args.path),
      }));
    },
  };
}

/** Tách các "ứng viên" class Tailwind từ mã nguồn (giống cách Tailwind quét file). */
export function extractCandidates(sources: Iterable<string>): string[] {
  const set = new Set<string>();
  for (const src of sources) {
    for (const token of src.split(/[\s"'`{}<>;,=]+/)) {
      if (token.length > 0 && token.length < 200) set.add(token);
    }
  }
  return [...set];
}

async function compileCss(indexCss: string, candidates: string[]): Promise<string> {
  const { compile } = await import("tailwindcss");
  const tailwind = await loadRuntimeText("tailwind.css");
  const compiler = await compile(indexCss, {
    base: "/",
    loadStylesheet: async (id: string, base: string) => {
      if (id === "tailwindcss") return { path: "tailwindcss/index.css", base, content: tailwind };
      throw new Error(`Không hỗ trợ @import "${id}" trong index.css`);
    },
  });
  return compiler.build(candidates);
}

function transformHtml(html: string, imports: Record<string, string>): string {
  const importMap = `<script type="importmap">${JSON.stringify({ imports })}</script>`;
  const preload = ["react", "react-dom/client", "react-router-dom", "firebase/app"]
    .filter((s) => imports[s])
    .map((s) => `<link rel="modulepreload" href="${imports[s]}" />`)
    .join("\n    ");
  let out = html.replace(/<script[^>]*type="module"[^>]*src="[^"]*main\.jsx"[^>]*><\/script>/, "");
  out = out.replace(
    "</head>",
    `    ${importMap}\n    ${preload}\n    <link rel="stylesheet" href="/assets/app.css" />\n    <script type="module" src="/assets/app.js"></script>\n  </head>`,
  );
  return out;
}

const encoder = new TextEncoder();

export async function buildSite(
  files: GeneratedFile[],
  onLog?: (line: string) => void,
): Promise<BuiltSite> {
  const sources = new Map(files.filter((f) => !f.encoding).map((f) => [f.path, f.content]));
  const html = sources.get("index.html");
  const indexCss = sources.get("src/index.css");
  if (!html || !indexCss || !sources.has("src/main.jsx")) {
    throw new BuildError([{ file: null, line: null, message: "Thiếu index.html, src/index.css hoặc src/main.jsx." }]);
  }

  onLog?.("Tải trình biên dịch và thư viện dựng sẵn...");
  const [esbuild, manifest] = await Promise.all([loadEsbuild(), loadManifest()]);
  const env = parseEnv(sources.get(".env") ?? "");

  onLog?.("Bundle JavaScript (esbuild)...");
  let result;
  try {
    result = await esbuild.build({
      entryPoints: ["src/main.jsx"],
      bundle: true,
      write: false,
      format: "esm",
      target: "es2022",
      minify: true,
      jsx: "automatic",
      outfile: "assets/app.js",
      logLevel: "silent",
      define: {
        "import.meta.env": JSON.stringify({ ...env, MODE: "production", PROD: true, DEV: false, BASE_URL: "/" }),
        "process.env.NODE_ENV": '"production"',
      },
      plugins: [sitePlugin(sources, manifest.imports)],
    });
  } catch (err) {
    const errors = (err as { errors?: { text: string; location?: { file: string; line: number } | null }[] }).errors;
    if (errors?.length) {
      throw new BuildError(
        errors.map((e) => ({ file: e.location?.file?.replace(/^[\w-]+:/, "") ?? null, line: e.location?.line ?? null, message: e.text })),
      );
    }
    throw err;
  }
  const js = result.outputFiles.find((f) => f.path.endsWith(".js"))!.contents;

  onLog?.("Biên dịch Tailwind CSS...");
  const jsSources = [...sources].filter(([p]) => /\.(jsx?|html)$/.test(p)).map(([, c]) => c);
  const css = encoder.encode(await compileCss(indexCss, extractCandidates(jsSources)));

  const out = new Map<string, Uint8Array>();
  out.set("/index.html", encoder.encode(transformHtml(html, manifest.imports)));
  out.set("/assets/app.js", js);
  out.set("/assets/app.css", css);
  for (const f of files) {
    if (f.path.startsWith("public/")) {
      const bytes = f.encoding === "base64" ? Uint8Array.from(atob(f.content), (c) => c.charCodeAt(0)) : encoder.encode(f.content);
      out.set("/" + f.path.slice("public/".length), bytes);
    }
  }
  onLog?.("Tải thư viện dựng sẵn để đưa lên hosting...");
  await Promise.all(
    manifest.files.map(async (file) => {
      const res = await fetch(runtimeUrl(file));
      if (!res.ok) throw new Error(`Không tải được ${file}`);
      out.set("/" + file, new Uint8Array(await res.arrayBuffer()));
    }),
  );
  onLog?.(`Build xong: app.js ${(js.byteLength / 1024).toFixed(0)} KB, app.css ${(css.byteLength / 1024).toFixed(0)} KB.`);
  return { files: out, appBytes: js.byteLength, cssBytes: css.byteLength };
}
