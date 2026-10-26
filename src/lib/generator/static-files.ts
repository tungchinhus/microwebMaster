import { getTheme } from "../themes";
import type { BuilderConfig, GeneratedFile } from "../types";

/**
 * Các file khung dự án do Web Master tự tạo (không qua AI): phiên bản thư viện,
 * cấu hình build, theme, Security Rules. Nhờ vậy dự án luôn cài đặt và chạy được.
 */

export const GENERATED_STACK = {
  react: "^19.3.1",
  "react-dom": "^19.3.1",
  "react-router-dom": "^7.18.4",
  firebase: "^13.1.0",
  "lucide-react": "^1.61.0",
  vite: "^8.3.5",
  "@vitejs/plugin-react": "^6.1.2",
  tailwindcss: "^4.3.3",
  "@tailwindcss/vite": "^4.3.3",
};

export function packageName(storeName: string): string {
  const slug = storeName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "my-store";
}

const js = (value: unknown) => JSON.stringify(value, null, 2);

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "").match(/^([0-9a-f]{6})$/i);
  const n = m ? parseInt(m[1], 16) : 0x6366f1;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Chữ trắng hay đen trên nền màu chủ đạo, theo độ sáng tương đối. */
function readableOn(hex: string): string {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? "#0f172a" : "#ffffff";
}

function indexCss(config: BuilderConfig): string {
  const theme = getTheme(config.theme);
  const brand = config.store.primaryColor || theme.suggestedColor;
  const display = config.theme === "elegant" ? '"Playfair Display", Georgia, serif' : "var(--font-sans)";
  const light = theme.darkByDefault
    ? { background: "#f8fafc", surface: "#ffffff", text: "#0f172a" }
    : theme.preview;
  const dark = theme.darkByDefault
    ? theme.preview
    : { background: "#0b1120", surface: "#111827", text: "#e2e8f0" };

  return `@import "tailwindcss";

/* Chế độ tối bật bằng class "dark" trên <html> (xem ThemeToggle và script trong index.html). */
@custom-variant dark (&:where(.dark, .dark *));

/* Theme: ${theme.name}. Đổi màu chủ đạo ở --brand hoặc trong src/config/store.js. */
:root {
  --brand: ${brand};
  --brand-foreground: ${readableOn(brand)};
  --background: ${light.background};
  --foreground: ${light.text};
  --card: ${light.surface};
  --muted: color-mix(in oklab, ${light.text} 6%, ${light.background});
  --muted-foreground: color-mix(in oklab, ${light.text} 60%, ${light.background});
  --border: color-mix(in oklab, ${light.text} 12%, ${light.background});
  color-scheme: light;
}

.dark {
  --background: ${dark.background};
  --foreground: ${dark.text};
  --card: ${dark.surface};
  --muted: color-mix(in oklab, ${dark.text} 8%, ${dark.background});
  --muted-foreground: color-mix(in oklab, ${dark.text} 60%, ${dark.background});
  --border: color-mix(in oklab, ${dark.text} 14%, ${dark.background});
  color-scheme: dark;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-primary: var(--brand);
  --color-primary-foreground: var(--brand-foreground);
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: ${display};
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}

* {
  border-color: var(--border);
}
`;
}

function indexHtml(config: BuilderConfig): string {
  const theme = getTheme(config.theme);
  const fonts =
    config.theme === "elegant"
      ? "family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700"
      : "family=Inter:wght@400;500;600;700;800";
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escape(config.store.description)}" />
    <title>${escape(config.store.name)}${config.store.slogan ? ` - ${escape(config.store.slogan)}` : ""}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?${fonts}&subset=vietnamese&display=swap" rel="stylesheet" />
    <script>
      // Áp theme trước khi trang hiển thị để không bị nháy.
      (function () {
        try {
          var saved = localStorage.getItem("theme");
          var dark = saved ? saved === "dark" : ${theme.darkByDefault};
          document.documentElement.classList.toggle("dark", dark);
        } catch (e) {}
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
}

function storeConfigJs(config: BuilderConfig): string {
  const theme = getTheme(config.theme);
  const s = config.store;
  return `/**
 * Cấu hình cửa hàng do Web Master tạo. Sửa ở đây để đổi thông tin hiển thị.
 */
export const storeConfig = ${js({
    name: s.name,
    slogan: s.slogan,
    description: s.description,
    primaryColor: s.primaryColor || theme.suggestedColor,
    theme: theme.id,
    darkByDefault: theme.darkByDefault,
    currency: "VND",
    locale: "vi-VN",
    shippingFee: 30000,
    freeShippingThreshold: 1000000,
    contact: { phone: s.phone, email: s.email, address: s.address },
  })};
`;
}

const mainJsx = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import { AuthProvider } from "@/context/AuthContext.jsx";
import { CartProvider } from "@/context/CartContext.jsx";
import "@/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
`;

const viteConfig = `import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
`;

const firestoreRules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Hồ sơ người dùng: tự tạo với role "customer"; chỉ admin đổi được role.
    match /users/{uid} {
      allow read: if signedIn() && (request.auth.uid == uid || isAdmin());
      allow create: if signedIn() && request.auth.uid == uid && request.resource.data.role == 'customer';
      allow update: if isAdmin()
        || (signedIn() && request.auth.uid == uid
            && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'email', 'createdAt']));
      allow delete: if isAdmin();
    }

    match /categories/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /products/{id} {
      allow read: if resource.data.active == true || isAdmin();
      allow create, delete: if isAdmin();
      // Admin sửa mọi trường. Khách đã đăng nhập chỉ được GIẢM tồn kho (khi đặt hàng).
      allow update: if isAdmin()
        || (signedIn()
            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['stock'])
            && request.resource.data.stock is int
            && request.resource.data.stock >= 0
            && request.resource.data.stock < resource.data.stock);
    }

    match /orders/{id} {
      allow read: if signedIn() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if signedIn()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.status == 'pending'
        && request.resource.data.total is number
        && request.resource.data.total >= 0
        && request.resource.data.items is list
        && request.resource.data.items.size() > 0;
      allow update: if isAdmin()
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'updatedAt']);
      allow delete: if false;
    }
  }
}
`;

const storageRules = `rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null
        && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /products/{fileName} {
      allow read: if true;
      allow write: if isAdmin()
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
      allow delete: if isAdmin();
    }
  }
}
`;

const firestoreIndexes = js({
  indexes: [
    {
      collectionGroup: "products",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "active", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" },
      ],
    },
    {
      collectionGroup: "orders",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "userId", order: "ASCENDING" },
        { fieldPath: "createdAt", order: "DESCENDING" },
      ],
    },
  ],
  fieldOverrides: [],
});

function envFile(config: BuilderConfig, withValues: boolean): string {
  const f = config.firebase;
  const v = (value: string) => (withValues ? value : "");
  return `# Cấu hình Firebase Web App (Firebase Console > Project settings > Your apps)
VITE_FIREBASE_API_KEY=${v(f.apiKey)}
VITE_FIREBASE_AUTH_DOMAIN=${v(f.authDomain)}
VITE_FIREBASE_PROJECT_ID=${v(f.projectId)}
VITE_FIREBASE_STORAGE_BUCKET=${v(f.storageBucket)}
VITE_FIREBASE_MESSAGING_SENDER_ID=${v(f.messagingSenderId)}
VITE_FIREBASE_APP_ID=${v(f.appId)}
`;
}

function favicon(config: BuilderConfig): string {
  const brand = config.store.primaryColor || getTheme(config.theme).suggestedColor;
  const letter = (config.store.name.trim().charAt(0) || "S").toUpperCase().replace(/[<&]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${brand}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="${readableOn(brand)}">${letter}</text></svg>
`;
}

export const SETUP_STEPS = [
  "Giải nén file .zip, mở thư mục bằng VS Code.",
  "Chạy: npm install",
  "Kiểm tra file .env đã có cấu hình Firebase (Web Master điền sẵn nếu bạn đã nhập).",
  "Trên Firebase Console: bật Authentication (Email/Password và Google), tạo Firestore Database và Storage.",
  "Đưa Security Rules và index lên: npx firebase login, npx firebase use --add, rồi npx firebase deploy --only firestore,storage",
  "Chạy: npm run dev rồi mở http://localhost:5173",
  "Đăng ký một tài khoản, sau đó trong Firestore sửa users/{uid} trường role thành \"admin\" để vào /admin.",
];

function readme(config: BuilderConfig): string {
  const theme = getTheme(config.theme);
  return `# ${config.store.name}

${config.store.description}

Website bán hàng được tạo bởi **Web Master** (theme: ${theme.name}) với React, Vite, Tailwind CSS và Firebase.

## Chạy dự án

${SETUP_STEPS.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Lệnh

- \`npm run dev\`: chạy môi trường phát triển
- \`npm run build\`: build production vào thư mục \`dist/\`
- \`npm run preview\`: xem thử bản build

## Deploy

**Firebase Hosting:** \`npm run build\`, \`npx firebase init hosting\` (public directory: \`dist\`, single-page app: Yes), \`npx firebase deploy --only hosting\`.

**Vercel / Netlify:** import repo, build command \`npm run build\`, output \`dist\`, thêm các biến \`VITE_FIREBASE_*\` trong phần Environment Variables, và cấu hình rewrite mọi đường dẫn về \`/index.html\`.

Nhớ thêm tên miền vào Firebase Console > Authentication > Settings > Authorized domains để đăng nhập Google hoạt động.

## Cấu trúc

- \`src/config/store.js\`: thông tin cửa hàng
- \`src/index.css\`: màu sắc theme
- \`src/services/\`: đọc/ghi Firestore
- \`src/context/\`: đăng nhập, giỏ hàng
- \`src/pages/\`: trang cửa hàng, \`src/pages/admin/\`: trang quản trị
- \`firestore.rules\`, \`storage.rules\`: phân quyền

## Lưu ý bảo mật

Bản này đặt hàng trực tiếp từ trình duyệt. Security Rules chỉ cho khách tạo đơn của chính mình và chỉ được giảm tồn kho, nhưng không kiểm chứng được tổng tiền. Admin nên đối chiếu giá khi xác nhận đơn, hoặc chuyển bước đặt hàng sang Cloud Functions khi cửa hàng lớn hơn.
`;
}

export function buildStaticFiles(config: BuilderConfig): GeneratedFile[] {
  const pkg = {
    name: packageName(config.store.name),
    private: true,
    version: "0.1.0",
    type: "module",
    scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
    dependencies: {
      react: GENERATED_STACK.react,
      "react-dom": GENERATED_STACK["react-dom"],
      "react-router-dom": GENERATED_STACK["react-router-dom"],
      firebase: GENERATED_STACK.firebase,
      "lucide-react": GENERATED_STACK["lucide-react"],
    },
    devDependencies: {
      vite: GENERATED_STACK.vite,
      "@vitejs/plugin-react": GENERATED_STACK["@vitejs/plugin-react"],
      tailwindcss: GENERATED_STACK.tailwindcss,
      "@tailwindcss/vite": GENERATED_STACK["@tailwindcss/vite"],
    },
  };

  const files: Record<string, string> = {
    "package.json": js(pkg) + "\n",
    "vite.config.js": viteConfig,
    "jsconfig.json": js({ compilerOptions: { baseUrl: ".", paths: { "@/*": ["src/*"] }, jsx: "react-jsx" } }) + "\n",
    "index.html": indexHtml(config),
    "public/favicon.svg": favicon(config),
    "src/main.jsx": mainJsx,
    "src/index.css": indexCss(config),
    "src/config/store.js": storeConfigJs(config),
    ".env": envFile(config, true),
    ".env.example": envFile(config, false),
    ".gitignore": "node_modules\ndist\n.env\n.env.*\n!.env.example\n*.log\n.firebase/\n",
    "firebase.json": js({ firestore: { rules: "firestore.rules", indexes: "firestore.indexes.json" }, storage: { rules: "storage.rules" } }) + "\n",
    "firestore.rules": firestoreRules,
    "firestore.indexes.json": firestoreIndexes + "\n",
    "storage.rules": storageRules,
    "README.md": readme(config),
  };

  return Object.entries(files).map(([path, content]) => ({ path, content, source: "static" as const }));
}
