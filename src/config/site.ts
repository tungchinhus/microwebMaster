/**
 * Thông tin thương hiệu và liên hệ của trang giới thiệu mẫu web.
 * Sửa các giá trị dưới đây trước khi đưa lên mạng.
 */
export const SITE = {
  name: "Web Master",
  tagline: "Website riêng cho cửa hàng, lớp học, dịch vụ của bạn",
  /** Email nhận yêu cầu báo giá (form mở ứng dụng email với nội dung điền sẵn). */
  contactEmail: "lienhe@tenmiencuaban.vn",
  /** Số Zalo / điện thoại hiển thị ở form báo giá và chân trang. Để trống để ẩn. */
  zaloPhone: "0900000000",
  /** Giá khởi điểm hiển thị trên thẻ mẫu, đơn vị đồng. */
  startingPrice: 3_900_000,
  deliveryDays: "3 đến 7 ngày",
  refundDays: 30,
};

export function formatVnd(value: number): string {
  return `${value.toLocaleString("vi-VN")}đ`;
}
