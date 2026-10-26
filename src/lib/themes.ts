import type { ThemeId } from "./types";

export interface ThemePreset {
  id: ThemeId;
  name: string;
  description: string;
  /** Màu gợi ý khi chọn theme (người dùng vẫn có thể đổi). */
  suggestedColor: string;
  preview: { background: string; surface: string; text: string; accent: string };
  darkByDefault: boolean;
  /** Mô tả phong cách gửi cho AI. */
  promptGuide: string;
}

export const THEMES: ThemePreset[] = [
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    description: "Trắng sáng, nhiều khoảng thở, bo góc vừa phải. Hợp mọi ngành hàng.",
    suggestedColor: "#6366F1",
    preview: { background: "#ffffff", surface: "#f8fafc", text: "#0f172a", accent: "#6366F1" },
    darkByDefault: false,
    promptGuide:
      "Phong cách tối giản hiện đại: nền trắng (#ffffff), bề mặt slate-50, chữ slate-900, khoảng trắng rộng, bo góc rounded-xl, bóng đổ rất nhẹ, font sans. Có nút chuyển Sáng/Tối, mặc định Sáng.",
  },
  {
    id: "tech-dark",
    name: "Tech Dark",
    description: "Nền tối, điểm nhấn neon, cảm giác công nghệ. Hợp shop điện tử, gaming.",
    suggestedColor: "#10B981",
    preview: { background: "#0b1120", surface: "#111827", text: "#e2e8f0", accent: "#10B981" },
    darkByDefault: true,
    promptGuide:
      "Phong cách Tech Dark: nền #0b1120, bề mặt #111827 có viền slate-800, chữ slate-200, màu chủ đạo dùng cho glow nhẹ (shadow màu chủ đạo/30) ở nút và thẻ khi hover, chữ tiêu đề đậm, gradient tinh tế ở hero. Mặc định chế độ Tối, vẫn có nút chuyển Sáng.",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sang trọng, chữ có chân cho tiêu đề, tông kem và vàng đồng. Hợp thời trang, mỹ phẩm.",
    suggestedColor: "#B08D57",
    preview: { background: "#faf7f2", surface: "#ffffff", text: "#1c1917", accent: "#B08D57" },
    darkByDefault: false,
    promptGuide:
      "Phong cách Elegant: nền kem #faf7f2, chữ stone-900, tiêu đề dùng font serif (Playfair Display qua Google Fonts), chữ thường dùng sans, nút bo góc nhỏ (rounded-md) viền mảnh, chữ in hoa giãn cách (tracking-widest) cho nhãn nhỏ, ảnh sản phẩm tỉ lệ 3:4. Mặc định Sáng.",
  },
  {
    id: "vibrant",
    name: "Vibrant Pop",
    description: "Màu sắc tươi, khối đậm, vui nhộn. Hợp đồ chơi, quà tặng, giới trẻ.",
    suggestedColor: "#F43F5E",
    preview: { background: "#fff7ed", surface: "#ffffff", text: "#1e1b4b", accent: "#F43F5E" },
    darkByDefault: false,
    promptGuide:
      "Phong cách Vibrant Pop: nền cam rất nhạt #fff7ed, khối màu đậm, bo góc lớn rounded-2xl/3xl, viền đậm 2px màu tối, bóng đổ lệch kiểu 'neo-brutalism' (shadow-[4px_4px_0_0_#1e1b4b]), badge nhiều màu, chữ tiêu đề rất đậm. Mặc định Sáng.",
  },
  {
    id: "organic",
    name: "Organic Nature",
    description: "Tông xanh lá, be, cảm giác tự nhiên. Hợp thực phẩm sạch, nông sản, handmade.",
    suggestedColor: "#16A34A",
    preview: { background: "#f7f5ef", surface: "#ffffff", text: "#1f2a1f", accent: "#16A34A" },
    darkByDefault: false,
    promptGuide:
      "Phong cách Organic Nature: nền be #f7f5ef, chữ xanh rêu đậm #1f2a1f, màu chủ đạo xanh lá, bo góc mềm rounded-2xl, hình khối hữu cơ (blob) trang trí ở hero, icon lá cây, ảnh bo tròn. Mặc định Sáng.",
  },
];

export function getTheme(id: ThemeId): ThemePreset {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
