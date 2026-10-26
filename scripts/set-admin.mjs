// Cấp quyền admin cho một tài khoản đã đăng ký:  npm run set-admin -- email@example.com
// Thu hồi quyền admin:                          npm run set-admin -- email@example.com --revoke
import { auth, db } from "./admin-app.mjs";

const email = process.argv[2];
const revoke = process.argv.includes("--revoke");
if (!email || email.startsWith("--")) {
  console.error("Cách dùng: npm run set-admin -- email@example.com [--revoke]");
  process.exit(1);
}

const user = await auth.getUserByEmail(email).catch(() => null);
if (!user) {
  console.error(`Không tìm thấy tài khoản ${email}. Hãy đăng ký trên web trước.`);
  process.exit(1);
}

// Firestore Rules đọc role trong users/{uid}; Storage Rules đọc custom claim "admin".
await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: !revoke });
await db.collection("users").doc(user.uid).set(
  { email, displayName: user.displayName ?? "", role: revoke ? "customer" : "admin" },
  { merge: true },
);
console.log(
  revoke
    ? `Đã thu hồi quyền admin của ${email}.`
    : `Đã cấp quyền admin cho ${email}. Tải lại trang web để thấy Trang quản trị.`,
);
