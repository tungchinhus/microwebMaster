/**
 * Cấu hình cửa hàng. Đổi các giá trị ở đây để "build" một shop mới
 * mà không cần sửa code giao diện.
 */
export const storeConfig = {
  name: "TechZone",
  tagline: "Cửa Hàng Công Nghệ",
  description:
    "TechZone - điện thoại, laptop, phụ kiện công nghệ chính hãng, giao hàng toàn quốc.",
  /** Màu chủ đạo (mã hex). Mọi nút, link, điểm nhấn đều lấy từ màu này. */
  primaryColor: "#6366F1",
  /** "light" | "dark" | "system": chế độ hiển thị mặc định khi khách chưa chọn. */
  defaultTheme: "system" as "light" | "dark" | "system",
  currency: "VND",
  locale: "vi-VN",
  /** Phí vận chuyển cố định và ngưỡng miễn phí vận chuyển (VND). */
  shippingFee: 30000,
  freeShippingThreshold: 1000000,
  contact: {
    phone: "0900 000 000",
    email: "support@techzone.vn",
    address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  },
} as const;

export type StoreConfig = typeof storeConfig;
