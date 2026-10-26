import type { SiteTypeId } from "./types";

export interface SiteType {
  id: SiteTypeId | "landing" | "blog";
  name: string;
  description: string;
  available: boolean;
  features: string[];
}

export const SITE_TYPES: SiteType[] = [
  {
    id: "ecommerce",
    name: "Web Bán hàng & Quản lý Sản phẩm",
    description: "Cửa hàng online kèm trang quản trị: sản phẩm, danh mục, giỏ hàng, đơn hàng.",
    available: true,
    features: ["Trang chủ, danh mục, tìm kiếm", "Giỏ hàng, thanh toán COD", "Đăng nhập Firebase", "Admin: sản phẩm, đơn hàng, thống kê"],
  },
  {
    id: "landing",
    name: "Landing Page giới thiệu",
    description: "Trang giới thiệu dịch vụ, thu thập liên hệ.",
    available: false,
    features: [],
  },
  {
    id: "blog",
    name: "Blog / Tin tức",
    description: "Trang tin tức có trang quản trị bài viết.",
    available: false,
    features: [],
  },
];

export const GEMINI_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (nhanh, tiết kiệm)" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (chất lượng cao hơn, chậm hơn)" },
];
