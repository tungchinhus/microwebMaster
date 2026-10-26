// Chuẩn bị "runtime" để build website ngay trong trình duyệt:
// - public/runtime/vendor/: React, React Router, Firebase, lucide-react dựng sẵn dạng ES module
//   (website được deploy dùng import map trỏ vào đây, nên trình duyệt chỉ phải bundle code của shop)
// - public/runtime/esbuild.wasm: trình biên dịch JSX chạy trong trình duyệt
// - public/runtime/tailwind.css: mã nguồn Tailwind để biên dịch CSS trong trình duyệt
import { build } from "esbuild";
import { createRequire } from "node:module";
import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const OUT = "public/runtime";
const TMP = "node_modules/.cache/wm-vendor";

// Gói CommonJS cần liệt kê export có tên để `import { useState } from "react"` hoạt động.
const CJS = {
  react: "react",
  "react/jsx-runtime": "react/jsx-runtime",
  "react-dom": "react-dom",
  "react-dom/client": "react-dom/client",
};
const ESM = [
  "react-router",
  "react-router-dom",
  "firebase/app",
  "firebase/auth",
  "firebase/firestore",
  "firebase/storage",
  "lucide-react",
];

rmSync(OUT, { recursive: true, force: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const fileName = (spec) => spec.replace(/\//g, "__");
const entryPoints = {};
for (const [spec, mod] of Object.entries(CJS)) {
  const names = Object.keys(require(mod)).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k) && k !== "default");
  const src = `import M from ${JSON.stringify(mod)};\nexport default M;\nexport const { ${names.join(", ")} } = M;\n`;
  const file = join(TMP, `${fileName(spec)}.js`);
  writeFileSync(file, src);
  entryPoints[fileName(spec)] = file;
}
for (const spec of ESM) {
  const file = join(TMP, `${fileName(spec)}.js`);
  writeFileSync(file, `export * from ${JSON.stringify(spec)};\n`);
  entryPoints[fileName(spec)] = file;
}

await build({
  entryPoints,
  outdir: join(OUT, "vendor"),
  bundle: true,
  splitting: true,
  format: "esm",
  minify: true,
  target: "es2022",
  chunkNames: "chunk-[hash]",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

const imports = {};
for (const spec of [...Object.keys(CJS), ...ESM]) imports[spec] = `/vendor/${fileName(spec)}.js`;
const files = readdirSync(join(OUT, "vendor")).map((f) => `vendor/${f}`);
const pkgVersion = (name) => require(`${name}/package.json`).version;

writeFileSync(
  join(OUT, "manifest.json"),
  JSON.stringify(
    {
      imports,
      files,
      versions: Object.fromEntries(["react", "react-dom", "react-router-dom", "firebase", "lucide-react"].map((n) => [n, pkgVersion(n)])),
    },
    null,
    2,
  ),
);
copyFileSync(require.resolve("esbuild-wasm/esbuild.wasm"), join(OUT, "esbuild.wasm"));
copyFileSync(require.resolve("tailwindcss/index.css"), join(OUT, "tailwind.css"));
console.log(`Runtime: ${files.length} file vendor, esbuild.wasm, tailwind.css -> ${OUT}`);
