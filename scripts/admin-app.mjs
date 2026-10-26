// Khởi tạo Firebase Admin SDK cho các script dòng lệnh.
// Đọc biến môi trường từ .env.local (hoặc file truyền qua ENV_FILE).
import { readFileSync, existsSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const envFile = process.env.ENV_FILE ?? ".env.local";
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

const app =
  clientEmail && privateKey
    ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId })
    : initializeApp({ projectId });

export const auth = getAuth(app);
export const db = getFirestore(app);
