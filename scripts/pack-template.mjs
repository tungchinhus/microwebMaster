// Đóng gói templates/techzone thành public/templates/techzone.json để Web Master
// xuất template đã kiểm thử ngay trên trình duyệt (chế độ "Template có sẵn").
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "templates/techzone";
// Chỉ lấy file được Git theo dõi để bỏ qua node_modules, .next, .env.local.
const listed = execFileSync("git", ["ls-files", "--", root], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const files = [];
for (const full of listed) {
  const path = full.slice(root.length + 1);
  const buf = readFileSync(full);
  const binary = buf.includes(0);
  files.push(binary ? { path, base64: buf.toString("base64") } : { path, content: buf.toString("utf8") });
}

mkdirSync("public/templates", { recursive: true });
writeFileSync(join("public/templates", "techzone.json"), JSON.stringify({ name: "techzone", files }));
console.log(`Đã đóng gói ${files.length} file template vào public/templates/techzone.json`);
