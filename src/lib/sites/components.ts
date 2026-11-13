/**
 * Thư viện component có sẵn mà admin gắn thêm vào web của khách hàng.
 * Mỗi component có giá mua thêm (để báo giá ngay khi chào hàng), các vùng được phép đặt
 * và các trường admin sửa được (tiêu đề, số Zalo...).
 */

/** Các vùng của trang khách hàng mà admin chọn để thêm component. */
export const REGIONS = [
  { id: "header", name: "Đầu trang", hint: "Nút nhỏ cạnh menu: đăng nhập, giỏ hàng, tìm kiếm" },
  { id: "top", name: "Trên banner", hint: "Dải thông báo, khuyến mãi" },
  { id: "main", name: "Nội dung", hint: "Các khối dưới banner: sản phẩm, đặt lịch, đánh giá..." },
  { id: "footer", name: "Chân trang", hint: "Đăng ký nhận tin, liên hệ" },
  { id: "floating", name: "Nút nổi", hint: "Nút Zalo, gọi điện ở góc màn hình" },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];

export interface ComponentField {
  key: string;
  label: string;
  multiline?: boolean;
}

export interface ComponentDef {
  type: ComponentType;
  name: string;
  description: string;
  /** Giá mua thêm, đơn vị đồng */
  price: number;
  regions: RegionId[];
  /** Chỉ đặt được một lần trên toàn trang (giỏ hàng, đăng nhập...) */
  unique?: boolean;
  fields?: ComponentField[];
  defaults?: Record<string, string>;
  /** Component cần có component khác mới chạy đủ (ví dụ nút "Thêm vào giỏ" cần giỏ hàng) */
  worksBestWith?: ComponentType[];
}

export type ComponentType =
  | "login"
  | "cart"
  | "search"
  | "promo"
  | "products"
  | "booking"
  | "contact"
  | "reviews"
  | "newsletter"
  | "zalo";

export const COMPONENTS: ComponentDef[] = [
  {
    type: "login",
    name: "Đăng nhập khách hàng",
    description: "Nút Đăng nhập trên đầu trang, khách đăng ký và đăng nhập bằng email.",
    price: 900_000,
    regions: ["header"],
    unique: true,
  },
  {
    type: "cart",
    name: "Giỏ hàng",
    description: "Biểu tượng giỏ có số lượng, ngăn giỏ hàng, sửa số lượng và đặt hàng (COD).",
    price: 1_500_000,
    regions: ["header"],
    unique: true,
    worksBestWith: ["products"],
  },
  {
    type: "search",
    name: "Tìm kiếm",
    description: "Ô tìm kiếm sản phẩm, dịch vụ ngay trên đầu trang.",
    price: 500_000,
    regions: ["header"],
    unique: true,
    worksBestWith: ["products"],
  },
  {
    type: "promo",
    name: "Dải khuyến mãi",
    description: "Dòng thông báo nổi bật kèm mã giảm giá.",
    price: 300_000,
    regions: ["top", "main"],
    fields: [
      { key: "text", label: "Nội dung" },
      { key: "code", label: "Mã giảm giá (để trống nếu không có)" },
    ],
    defaults: { text: "Giảm 10% cho đơn đầu tiên", code: "CHAOBAN" },
  },
  {
    type: "products",
    name: "Danh sách sản phẩm",
    description: "Lưới sản phẩm, dịch vụ có giá. Có Giỏ hàng thì hiện nút Thêm vào giỏ.",
    price: 1_200_000,
    regions: ["main"],
    unique: true,
    fields: [{ key: "title", label: "Tiêu đề khối" }],
    defaults: { title: "Sản phẩm nổi bật" },
    worksBestWith: ["cart"],
  },
  {
    type: "booking",
    name: "Đặt lịch",
    description: "Form chọn dịch vụ, ngày, giờ. Yêu cầu đặt lịch lưu về trang quản trị.",
    price: 1_200_000,
    regions: ["main"],
    unique: true,
    fields: [{ key: "title", label: "Tiêu đề khối" }],
    defaults: { title: "Đặt lịch hẹn" },
  },
  {
    type: "contact",
    name: "Form liên hệ",
    description: "Khách để lại tên, số điện thoại, lời nhắn. Lưu về trang quản trị.",
    price: 600_000,
    regions: ["main", "footer"],
    unique: true,
    fields: [{ key: "title", label: "Tiêu đề khối" }],
    defaults: { title: "Liên hệ với chúng tôi" },
  },
  {
    type: "reviews",
    name: "Đánh giá khách hàng",
    description: "Ba thẻ đánh giá có số sao, tăng độ tin cậy.",
    price: 400_000,
    regions: ["main"],
    unique: true,
    fields: [{ key: "title", label: "Tiêu đề khối" }],
    defaults: { title: "Khách hàng nói gì" },
  },
  {
    type: "newsletter",
    name: "Đăng ký nhận tin",
    description: "Ô nhập email nhận ưu đãi, lưu về trang quản trị.",
    price: 400_000,
    regions: ["footer", "main"],
    unique: true,
    fields: [{ key: "title", label: "Tiêu đề" }],
    defaults: { title: "Nhận ưu đãi mới nhất" },
  },
  {
    type: "zalo",
    name: "Nút Zalo",
    description: "Nút tròn ở góc màn hình, bấm là mở chat Zalo.",
    price: 200_000,
    regions: ["floating"],
    unique: true,
    fields: [{ key: "phone", label: "Số Zalo" }],
    defaults: { phone: "0900000000" },
  },
];

export function getComponentDef(type: string): ComponentDef | undefined {
  return COMPONENTS.find((c) => c.type === type);
}
