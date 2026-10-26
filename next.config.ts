import type { NextConfig } from "next";

// STATIC_EXPORT=1 xuất trang tĩnh vào out/ (GitHub Pages, Firebase Hosting...).
// Web Master chạy hoàn toàn trên trình duyệt nên không cần máy chủ Node.
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(staticExport
    ? { output: "export", trailingSlash: true, images: { unoptimized: true } }
    : { cacheComponents: true, partialPrefetching: true }),
  basePath: basePath || undefined,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
