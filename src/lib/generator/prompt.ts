import { getTheme } from "../themes";
import type { BuilderConfig } from "../types";
import { BATCHES, type FileSpec } from "./blueprint";
import { GENERATED_STACK } from "./static-files";

/** Hợp đồng chung gửi kèm mọi lần gọi, để các file do các lần gọi khác nhau viết khớp nhau. */
function projectContract(): string {
  const tree = BATCHES.flatMap((b) => b.files)
    .map((f) => `- ${f.path}: ${f.exports}`)
    .join("\n");
  return `## Công nghệ (đã cài sẵn, KHÔNG thêm thư viện khác)
React ${GENERATED_STACK.react}, react-router-dom ${GENERATED_STACK["react-router-dom"]}, Firebase JS SDK ${GENERATED_STACK.firebase} (modular API: import { ... } from "firebase/firestore"...), lucide-react ${GENERATED_STACK["lucide-react"]}, Tailwind CSS 4 (qua @tailwindcss/vite), Vite. Ngôn ngữ: JavaScript + JSX (không TypeScript).

## Quy ước
- Import nội bộ dùng alias "@/..." trỏ tới src (ví dụ: import { useCart } from "@/context/CartContext.jsx"). Luôn ghi rõ đuôi file .js/.jsx.
- Component trang/thành phần chính export default đúng như hợp đồng; hàm tiện ích export có tên.
- Tất cả chữ hiển thị bằng tiếng Việt có dấu. Tiền tệ VND qua formatPrice.
- Thông tin cửa hàng lấy từ: import { storeConfig } from "@/config/store.js" (các trường: name, slogan, description, primaryColor, theme, darkByDefault, currency, locale, shippingFee, freeShippingThreshold, contact { phone, email, address }).
- Màu dùng class Tailwind theo token đã định nghĩa trong src/index.css: bg-background, text-foreground, bg-card, bg-muted, text-muted-foreground, border-border, bg-primary, text-primary, text-primary-foreground, ring-primary, font-display (tiêu đề). Có thể dùng biến thể dark: và độ mờ như bg-primary/10. KHÔNG hard-code màu chủ đạo.
- Responsive mobile-first, có trạng thái đang tải, rỗng và lỗi; nút có aria-label khi chỉ có icon.
- Không dùng dangerouslySetInnerHTML, không console.log thừa, không để TODO hay "// code here". Mỗi file phải hoàn chỉnh, chạy được.

## Mô hình dữ liệu Firestore
- users/{uid}: { email, displayName, phone, role: "customer" | "admin", createdAt }
- categories/{id}: { name, slug, description, sortOrder, createdAt }
- products/{id}: { name, slug, sku, description, price, salePrice (number|null), images: string[], categoryId, stock (int), featured (bool), active (bool), createdAt, updatedAt }
- orders/{id}: { userId, userEmail, items: [{ productId, name, image, price, quantity }], subtotal, shippingFee, total, status: "pending"|"confirmed"|"shipping"|"completed"|"cancelled", paymentMethod: "cod", shipping: { fullName, phone, address, note }, createdAt, updatedAt }
Trong code React mọi thời gian là số millis (đã đổi từ Timestamp trong services).

## File có sẵn (không viết lại)
- src/main.jsx: bọc <BrowserRouter><AuthProvider><CartProvider><App/></CartProvider></AuthProvider></BrowserRouter>
- src/index.css: Tailwind + token màu theme; src/config/store.js; index.html; vite.config.js; firestore.rules; storage.rules

## Toàn bộ file và export của dự án
${tree}`;
}

export function systemInstruction(config: BuilderConfig): string {
  const theme = getTheme(config.theme);
  const s = config.store;
  return `Bạn là kỹ sư frontend cao cấp. Bạn viết mã nguồn hoàn chỉnh, chạy được ngay, cho một website bán hàng online kèm trang quản trị, dùng React + Tailwind CSS + Firebase.

# Cửa hàng
- Tên: ${s.name}
- Slogan: ${s.slogan || "(không có)"}
- Mô tả: ${s.description || "(không có)"}
- Màu chủ đạo: ${s.primaryColor || theme.suggestedColor}

# Phong cách giao diện: ${theme.name}
${theme.promptGuide}
${s.extraRequirements.trim() ? `\n# Yêu cầu thêm của chủ shop\n${s.extraRequirements.trim()}\n` : ""}
${projectContract()}

# Định dạng trả lời
Chỉ trả về JSON đúng schema: { "files": [ { "path": string, "content": string } ] }. "content" là toàn bộ nội dung file (không bọc trong \`\`\`). Chỉ viết những file được yêu cầu trong tin nhắn.`;
}

function fileList(files: FileSpec[]): string {
  return files
    .map((f) => `### ${f.path}\nExport: ${f.exports}\nYêu cầu: ${f.description}`)
    .join("\n\n");
}

export function batchPrompt(files: FileSpec[]): string {
  return `Hãy viết đầy đủ ${files.length} file sau. Tuân thủ đúng đường dẫn và export trong hợp đồng.\n\n${fileList(files)}`;
}

export function revisePrompt(file: FileSpec, currentContent: string, instruction: string): string {
  return `Viết lại file ${file.path}.
Export: ${file.exports}
Yêu cầu gốc: ${file.description}
${instruction.trim() ? `Yêu cầu chỉnh sửa của người dùng: ${instruction.trim()}` : "Hãy rà soát và sửa mọi lỗi, giữ nguyên hợp đồng export."}

Nội dung hiện tại:
${currentContent}`;
}
