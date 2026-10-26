import type { FirebaseWebConfig } from "./types";

export const FIREBASE_FIELDS: { key: keyof FirebaseWebConfig; label: string; placeholder: string }[] = [
  { key: "apiKey", label: "apiKey", placeholder: "AIzaSy..." },
  { key: "authDomain", label: "authDomain", placeholder: "my-shop.firebaseapp.com" },
  { key: "projectId", label: "projectId", placeholder: "my-shop" },
  { key: "storageBucket", label: "storageBucket", placeholder: "my-shop.firebasestorage.app" },
  { key: "messagingSenderId", label: "messagingSenderId", placeholder: "1234567890" },
  { key: "appId", label: "appId", placeholder: "1:1234567890:web:abc123" },
];

/**
 * Đọc cấu hình Firebase dán từ Console. Chấp nhận JSON chuẩn hoặc đoạn
 * `const firebaseConfig = { apiKey: "...", ... }` (khóa không có ngoặc kép).
 */
export function parseFirebaseConfig(text: string): Partial<FirebaseWebConfig> | null {
  const result: Partial<FirebaseWebConfig> = {};
  for (const { key } of FIREBASE_FIELDS) {
    const m = text.match(new RegExp(`["']?${key}["']?\\s*:\\s*["'\`]([^"'\`]+)["'\`]`));
    if (m) result[key] = m[1].trim();
  }
  return Object.keys(result).length ? result : null;
}

export function isFirebaseComplete(c: FirebaseWebConfig): boolean {
  return FIREBASE_FIELDS.every(({ key }) => c[key].trim().length > 0);
}
