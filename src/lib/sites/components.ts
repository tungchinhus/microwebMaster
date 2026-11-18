/**
 * Thư viện component có sẵn mà admin gắn thêm vào web của khách hàng.
 * Mỗi component có giá mua thêm (để báo giá ngay khi chào hàng), các vùng được phép đặt
 * và các trường admin sửa được (tiêu đề, số Zalo...).
 */

/** Các vùng của trang khách hàng mà admin chọn để thêm component. */
export const REGIONS = [
  { id: "header", name: "Đầu trang", hint: "Nút nhỏ cạnh menu: tìm kiếm, đăng nhập, giỏ hàng. Tự xếp theo thứ tự quen thuộc, giỏ hàng luôn ở ngoài cùng bên phải", max: 3 },
  { id: "top", name: "Trên banner", hint: "Một dải thông báo, khuyến mãi mỏng trên cùng", max: 1 },
  { id: "main", name: "Nội dung", hint: "Banner luôn đứng đầu, bên dưới là các khối: sản phẩm, đặt lịch, đánh giá...", max: 20 },
  { id: "footer", name: "Chân trang", hint: "Đăng ký nhận tin, form liên hệ", max: 3 },
  { id: "floating", name: "Nút nổi", hint: "Nút Zalo, gọi điện ở góc màn hình", max: 2 },
] as const;

/** Thứ tự cố định của các nút ở đầu trang (trái sang phải), giống thói quen mua sắm online. */
export const HEADER_ORDER: ComponentType[] = ["search", "login", "cart"];

export type RegionId = (typeof REGIONS)[number]["id"];

export interface ComponentField {
  key: string;
  label: string;
  multiline?: boolean;
  /** Gợi ý khi để trống (thường là nội dung lấy từ mẫu) */
  placeholder?: string;
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
  /** Khối dựng sẵn của mẫu (banner, giới thiệu...): miễn phí, không tính vào phần mua thêm */
  section?: boolean;
  /** Vì sao component chỉ được đặt ở các vùng trên (hiện khi admin đặt sai chỗ) */
  why?: string;
  /** Khoá vị trí: "first" luôn đứng đầu vùng (banner) */
  pin?: "first";
}

export type ComponentType =
  | "hero"
  | "features"
  | "about"
  | "stats"
  | "gallery"
  | "cta"
  | "faq"
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

const ONE_PER_LINE = "Mỗi dòng một mục, để trống thì dùng nội dung của mẫu";

/** Các khối dựng nên trang mẫu. Admin sắp xếp, ẩn, xoá hoặc chèn lại; không tính phí. */
export const SECTIONS: ComponentDef[] = [
  {
    type: "hero",
    name: "Banner đầu trang",
    description: "Tiêu đề lớn, mô tả và nút chính. Sửa chữ bằng nút Chữ banner.",
    price: 0,
    regions: ["main"],
    why: "Banner là phần khách nhìn thấy đầu tiên nên luôn đứng đầu vùng nội dung.",
    pin: "first",
    unique: true,
    section: true,
  },
  {
    type: "features",
    name: "Điểm nổi bật",
    description: "Các thẻ nêu điểm mạnh của cửa hàng, dịch vụ.",
    price: 0,
    regions: ["main"],
    why: "Khối nội dung rộng, cần nằm trong phần thân trang.",
    unique: true,
    section: true,
    fields: [
      { key: "title", label: "Tiêu đề khối" },
      { key: "items", label: "Các điểm nổi bật", multiline: true, placeholder: ONE_PER_LINE },
    ],
    defaults: { title: "Vì sao chọn chúng tôi", items: "" },
  },
  {
    type: "about",
    name: "Giới thiệu",
    description: "Đoạn giới thiệu kèm ảnh.",
    price: 0,
    regions: ["main"],
    why: "Khối nội dung rộng, cần nằm trong phần thân trang.",
    unique: true,
    section: true,
    fields: [
      { key: "title", label: "Tiêu đề khối" },
      { key: "text", label: "Nội dung", multiline: true, placeholder: "Để trống thì dùng mô tả của mẫu" },
      { key: "image", label: "Link ảnh (https://...)", placeholder: "Để trống thì hiện hình minh hoạ" },
    ],
    defaults: { title: "Về chúng tôi", text: "", image: "" },
  },
  {
    type: "stats",
    name: "Con số ấn tượng",
    description: "Dải 3–4 con số: năm kinh nghiệm, khách hàng, đánh giá...",
    price: 0,
    regions: ["main"],
    why: "Khối nội dung rộng, cần nằm trong phần thân trang.",
    unique: true,
    section: true,
    fields: [{ key: "items", label: "Các con số", multiline: true, placeholder: "Mỗi dòng: con số | ý nghĩa, ví dụ 2.000+ | Khách hàng" }],
    defaults: { items: "5 năm | Kinh nghiệm\n2.000+ | Khách hàng\n4,9/5 | Đánh giá trung bình\n24/7 | Hỗ trợ" },
  },
  {
    type: "gallery",
    name: "Thư viện ảnh",
    description: "Lưới ảnh không gian, sản phẩm, công trình.",
    price: 0,
    regions: ["main"],
    why: "Lưới ảnh cần chiều rộng của phần thân trang.",
    unique: true,
    section: true,
    fields: [
      { key: "title", label: "Tiêu đề khối" },
      { key: "images", label: "Link ảnh", multiline: true, placeholder: "Mỗi dòng một link https://..., để trống thì dùng ảnh sản phẩm hoặc hình minh hoạ" },
    ],
    defaults: { title: "Hình ảnh", images: "" },
  },
  {
    type: "cta",
    name: "Kêu gọi hành động",
    description: "Dải màu nổi bật với một câu mời và nút bấm.",
    price: 0,
    regions: ["main"],
    why: "Dải kêu gọi nằm giữa các khối nội dung để dẫn khách tới bước tiếp theo.",
    section: true,
    fields: [
      { key: "title", label: "Tiêu đề" },
      { key: "text", label: "Mô tả", multiline: true },
      { key: "button", label: "Chữ trên nút" },
      { key: "link", label: "Link của nút", placeholder: "Để trống thì tới khối đặt lịch, liên hệ hoặc sản phẩm" },
    ],
    defaults: { title: "Sẵn sàng bắt đầu?", text: "Để lại thông tin, chúng tôi gọi lại trong 15 phút.", button: "Liên hệ ngay", link: "" },
  },
  {
    type: "faq",
    name: "Hỏi đáp",
    description: "Các câu hỏi thường gặp, bấm để mở câu trả lời.",
    price: 0,
    regions: ["main"],
    why: "Khối nội dung rộng, cần nằm trong phần thân trang.",
    unique: true,
    section: true,
    fields: [
      { key: "title", label: "Tiêu đề khối" },
      { key: "items", label: "Câu hỏi và trả lời", multiline: true, placeholder: "Mỗi dòng: câu hỏi | trả lời" },
    ],
    defaults: {
      title: "Câu hỏi thường gặp",
      items: "Bao lâu thì nhận được hàng? | Nội thành 2 giờ, tỉnh khác 2–3 ngày.\nCó được đổi trả không? | Đổi trả trong 7 ngày nếu sản phẩm lỗi.\nThanh toán thế nào? | Tiền mặt khi nhận hàng hoặc chuyển khoản.",
    },
  },
];

/** Component mua thêm, cộng vào báo giá. */
export const ADDONS: ComponentDef[] = [
  {
    type: "login",
    name: "Đăng nhập khách hàng",
    description: "Nút Đăng nhập trên đầu trang, khách đăng ký và đăng nhập bằng email.",
    price: 900_000,
    regions: ["header"],
    why: "Khách quen tìm nút đăng nhập ở góc phải đầu trang; đặt trong nội dung hay chân trang sẽ bị bỏ qua.",
    unique: true,
  },
  {
    type: "cart",
    name: "Giỏ hàng",
    description: "Biểu tượng giỏ có số lượng, ngăn giỏ hàng, sửa số lượng và đặt hàng (COD).",
    price: 1_500_000,
    regions: ["header"],
    why: "Giỏ hàng phải luôn thấy ở mọi trang và mọi vị trí cuộn, nên chỉ nằm ở đầu trang.",
    unique: true,
    worksBestWith: ["products"],
  },
  {
    type: "search",
    name: "Tìm kiếm",
    description: "Ô tìm kiếm sản phẩm, dịch vụ ngay trên đầu trang.",
    price: 500_000,
    regions: ["header"],
    why: "Ô tìm kiếm cần ở đầu trang để khách tìm ngay khi vào web.",
    unique: true,
    worksBestWith: ["products"],
  },
  {
    type: "promo",
    name: "Dải khuyến mãi",
    description: "Dòng thông báo nổi bật kèm mã giảm giá.",
    price: 300_000,
    regions: ["top", "main"],
    why: "Dải khuyến mãi mỏng: đặt trên cùng hoặc chen giữa các khối nội dung, không hợp với đầu trang hay chân trang.",
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
    why: "Lưới sản phẩm cần chiều rộng của phần thân trang.",
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
    why: "Form đặt lịch dài, cần nằm trong phần thân trang.",
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
    why: "Form liên hệ đặt cuối nội dung hoặc ở chân trang.",
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
    why: "Đánh giá đặt gần sản phẩm, dịch vụ trong phần thân trang.",
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
    why: "Ô nhận tin thường ở chân trang hoặc cuối nội dung.",
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
    why: "Nút chat phải nổi ở góc màn hình để khách bấm được ở bất kỳ đâu.",
    unique: true,
    fields: [{ key: "phone", label: "Số Zalo" }],
    defaults: { phone: "0900000000" },
  },
];

export const COMPONENTS: ComponentDef[] = [...SECTIONS, ...ADDONS];

export function getComponentDef(type: string): ComponentDef | undefined {
  return COMPONENTS.find((c) => c.type === type);
}
