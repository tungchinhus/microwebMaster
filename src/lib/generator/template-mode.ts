import { getTheme } from "../themes";
import type { BuilderConfig, GeneratedFile, GenerationResult } from "../types";
import { sortFiles } from "./index";
import { packageName } from "./static-files";

interface PackedTemplate {
  name: string;
  files: { path: string; content?: string; base64?: string }[];
}

export const TEMPLATE_SETUP_STEPS = [
  "Giải nén file .zip, mở thư mục bằng VS Code.",
  "Chạy: npm install",
  "Chạy thử không cần Firebase thật: cp .env.emulator .env.local, rồi npm run emulators (cửa sổ 1), npm run seed và npm run dev (cửa sổ 2).",
  "Chạy với Firebase thật: kiểm tra .env.local (Web Master điền sẵn cấu hình Web App), thêm FIREBASE_ADMIN_CLIENT_EMAIL và FIREBASE_ADMIN_PRIVATE_KEY từ service account.",
  "Đưa Security Rules lên: npx firebase login, npx firebase use --add, npm run deploy:rules",
  "Đăng ký tài khoản trên web rồi chạy: npm run set-admin -- email-cua-ban",
  "Mở http://localhost:3000 (cửa hàng) và /admin (quản trị). Xem README để deploy lên Vercel.",
];

function storeConfigTs(config: BuilderConfig): string {
  const theme = getTheme(config.theme);
  const s = config.store;
  const q = (v: string) => JSON.stringify(v);
  return `/**
 * Cấu hình cửa hàng (tạo bởi Web Master). Đổi các giá trị ở đây để "build" một shop mới
 * mà không cần sửa code giao diện.
 */
export const storeConfig = {
  name: ${q(s.name)},
  tagline: ${q(s.slogan)},
  description: ${q(s.description)},
  /** Màu chủ đạo (mã hex). Mọi nút, link, điểm nhấn đều lấy từ màu này. */
  primaryColor: ${q(s.primaryColor || theme.suggestedColor)},
  /** "light" | "dark" | "system": chế độ hiển thị mặc định khi khách chưa chọn. */
  defaultTheme: ${q(theme.darkByDefault ? "dark" : "light")} as "light" | "dark" | "system",
  currency: "VND",
  locale: "vi-VN",
  /** Phí vận chuyển cố định và ngưỡng miễn phí vận chuyển (VND). */
  shippingFee: 30000,
  freeShippingThreshold: 1000000,
  contact: {
    phone: ${q(s.phone)},
    email: ${q(s.email)},
    address: ${q(s.address)},
  },
} as const;

export type StoreConfig = typeof storeConfig;
`;
}

function envLocal(config: BuilderConfig): string {
  const f = config.firebase;
  return `NEXT_PUBLIC_FIREBASE_API_KEY=${f.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${f.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${f.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${f.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${f.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${f.appId}

# Service account cho API đặt hàng (Firebase Console > Project settings > Service accounts).
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=""

NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;
}

/** Xuất template TechZone (Next.js) đã kiểm thử, thay thông tin shop và Firebase của người dùng. */
export async function buildFromTemplate(config: BuilderConfig, signal?: AbortSignal): Promise<GenerationResult> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/templates/techzone.json`, { signal });
  if (!res.ok) throw new Error("Không tải được template. Hãy chạy lại npm run build.");
  const packed = (await res.json()) as PackedTemplate;

  const files: GeneratedFile[] = packed.files.map((f) =>
    f.base64 !== undefined
      ? { path: f.path, content: f.base64, encoding: "base64", source: "template" }
      : { path: f.path, content: f.content ?? "", source: "template" },
  );

  const patch = (path: string, content: string) => {
    const existing = files.find((f) => f.path === path);
    if (existing) Object.assign(existing, { content, source: "static" });
    else files.push({ path, content, source: "static" });
  };

  patch("src/config/store.ts", storeConfigTs(config));
  if (config.firebase.projectId.trim()) patch(".env.local", envLocal(config));

  const pkg = files.find((f) => f.path === "package.json");
  if (pkg) {
    const json = JSON.parse(pkg.content);
    json.name = packageName(config.store.name);
    patch("package.json", JSON.stringify(json, null, 2) + "\n");
  }

  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    mode: "template",
    model: null,
    storeName: config.store.name,
    files: sortFiles(files),
    missing: [],
    setupSteps: TEMPLATE_SETUP_STEPS,
  };
}
