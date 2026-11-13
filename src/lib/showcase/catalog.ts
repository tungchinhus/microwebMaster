import { SITE } from "@/config/site";

/** Kiểu bố cục của bản xem trước thu nhỏ (mỗi lĩnh vực một kiểu). */
export type PreviewKind = "shop" | "edu" | "service" | "landing" | "space3d" | "jobs" | "game" | "ai" | "auto";

export interface Category {
  id: string;
  name: string;
  description: string;
  kind: PreviewKind;
  comingSoon?: boolean;
}

export interface Palette {
  /** Nền trang */
  bg: string;
  /** Chữ chính */
  fg: string;
  /** Màu nhấn: nút, giá, thanh trên cùng */
  accent: string;
  /** Nền phụ: khối ảnh, thẻ */
  soft: string;
  /** Nền khối hero */
  hero: string;
  /** Chữ trên khối hero */
  heroFg: string;
  /** Nền thẻ (mặc định trắng) */
  card?: string;
}

/** Phong cách hình khối và chữ của một giao diện. */
export interface Look {
  /** Hệ số bo góc: 0 vuông, 1 mặc định, 1.5 rất tròn */
  radius: number;
  /** Nút dạng viên thuốc hay bo nhẹ */
  pillButtons: boolean;
  /** Font tiêu đề */
  headingFont: "sans" | "serif" | "mono";
  headingWeight: number;
  /** Logo ở giữa, menu bên dưới */
  centeredHeader: boolean;
}

/** Một giao diện (biến thể) của mẫu mà khách có thể chọn. */
export interface Variant {
  id: string;
  name: string;
  description: string;
  palette: Palette;
  look: Look;
}

export interface Project {
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  features: string[];
  price: number;
  palette: Palette;
  /** Dòng tiêu đề lớn trong bản xem trước */
  headline: string;
  /** Dòng chữ nhỏ trên thanh thông báo của bản xem trước */
  announcement: string;
  nav: string[];
  /** Mẫu có thể tự tạo ngay trong Web Master bằng AI */
  aiReady?: boolean;
  featured?: boolean;
  /** Giao diện riêng thêm vào sau 3 giao diện có sẵn */
  extraVariants?: Variant[];
  /** Giao diện đang áp dụng (do applyVariant gán) */
  look?: Look;
}

export const CATEGORIES: Category[] = [
  { id: "thuong-mai-dien-tu", name: "Thương mại điện tử", kind: "shop", description: "Cửa hàng online: danh mục, sản phẩm, giỏ hàng, đơn hàng và trang quản trị." },
  { id: "giao-duc", name: "Giáo dục", kind: "edu", description: "Khoá học, bài luyện tập, theo dõi tiến độ học viên." },
  { id: "dich-vu", name: "Dịch vụ", kind: "service", description: "Giới thiệu dịch vụ, bảng giá, đặt lịch và nhận tư vấn." },
  { id: "landing-page", name: "Landing page", kind: "landing", description: "Một trang giới thiệu sản phẩm, thu thập khách hàng tiềm năng." },
  { id: "khong-gian-3d", name: "Không gian 3D", kind: "space3d", description: "Nhà mẫu, showroom, triển lãm 3D xem ngay trên trình duyệt." },
  { id: "tuyen-dung", name: "Tuyển dụng", kind: "jobs", description: "Danh sách việc làm, bộ lọc chi tiết, nộp hồ sơ nhanh." },
  { id: "game", name: "Game", kind: "game", description: "Mini game chơi ngay trên trình duyệt, có bảng xếp hạng." },
  { id: "cong-cu-ai", name: "Công cụ & AI", kind: "ai", description: "Công cụ AI, dashboard số liệu, biểu đồ thời gian thực." },
  { id: "o-to", name: "Ô tô", kind: "auto", description: "Đại lý, showroom: dòng xe, dự toán chi phí, đăng ký lái thử." },
];

export const COMING_SOON: Category = {
  id: "sap-co",
  name: "Lĩnh vực mới",
  kind: "landing",
  description: "Bạn cần lĩnh vực khác? Gửi yêu cầu, chúng tôi làm riêng.",
  comingSoon: true,
};

const P = SITE.startingPrice;

export const PROJECTS: Project[] = [
  {
    slug: "techzone",
    name: "TechZone",
    category: "thuong-mai-dien-tu",
    summary: "Cửa hàng đồ công nghệ, có trang quản trị sản phẩm và đơn hàng.",
    description:
      "Mẫu bán hàng đầy đủ nhất: trang chủ, danh mục, tìm kiếm, giỏ hàng, thanh toán COD, đăng nhập, lịch sử đơn và trang quản trị có thống kê doanh thu. Dữ liệu lưu trên Firebase của chính bạn.",
    features: ["Danh mục, tìm kiếm, lọc theo giá", "Giỏ hàng, thanh toán COD", "Đăng nhập khách hàng", "Admin: sản phẩm, đơn hàng, thống kê", "Giao diện sáng và tối"],
    price: P,
    palette: { bg: "#f8fafc", fg: "#0f172a", accent: "#6366f1", soft: "#e0e7ff", hero: "#111827", heroFg: "#ffffff" },
    headline: "Công nghệ chính hãng, giao trong 2 giờ",
    announcement: "Miễn phí giao hàng cho đơn từ 500.000đ",
    nav: ["Điện thoại", "Laptop", "Phụ kiện", "Khuyến mãi"],
    aiReady: true,
    featured: true,
    extraVariants: [
      {
        id: "tuoi-sang",
        name: "Tươi sáng",
        description: "Nền trắng, màu cam năng động, hợp chuỗi bán lẻ.",
        palette: { bg: "#ffffff", fg: "#1c1917", accent: "#f97316", soft: "#ffedd5", hero: "#fff7ed", heroFg: "#1c1917", card: "#ffffff" },
        look: { radius: 0.8, pillButtons: false, headingFont: "sans", headingWeight: 800, centeredHeader: false },
      },
    ],
  },
  {
    slug: "la-tra",
    name: "Lá Trà",
    category: "thuong-mai-dien-tu",
    summary: "Cửa hàng trà và quà tặng, giỏ quà theo mùa.",
    description: "Cửa hàng trà thủ công với bộ sưu tập theo mùa, giỏ quà tặng có thiệp viết tay và chương trình tích điểm.",
    features: ["Bộ sưu tập theo mùa", "Giỏ quà, thiệp viết tay", "Mã giảm giá, tích điểm", "Blog công thức pha trà"],
    price: P,
    palette: { bg: "#fbf8f3", fg: "#2b2118", accent: "#4d7c0f", soft: "#ecfccb", hero: "#3f3a24", heroFg: "#fefce8" },
    headline: "Trà ngon cho những buổi chiều chậm",
    announcement: "Tặng thiệp viết tay cho mọi giỏ quà",
    nav: ["Trà xanh", "Trà ô long", "Giỏ quà", "Câu chuyện"],
    aiReady: true,
  },
  {
    slug: "moc-decor",
    name: "Mộc Decor",
    category: "thuong-mai-dien-tu",
    summary: "Nội thất gỗ, xem theo phòng và đặt làm theo kích thước.",
    description: "Cửa hàng nội thất gỗ với danh mục theo phòng, tuỳ chọn kích thước và màu gỗ, đặt cọc trực tuyến.",
    features: ["Danh mục theo phòng", "Tuỳ chọn kích thước, màu gỗ", "Đặt cọc trực tuyến", "Bộ sưu tập ảnh thực tế"],
    price: P,
    palette: { bg: "#faf7f2", fg: "#292524", accent: "#b45309", soft: "#fde7c7", hero: "#78350f", heroFg: "#fff7ed" },
    headline: "Gỗ thật, làm theo không gian nhà bạn",
    announcement: "Đo đạc tận nhà miễn phí trong nội thành",
    nav: ["Phòng khách", "Phòng ngủ", "Bàn làm việc", "Dự án"],
    featured: true,
  },
  {
    slug: "fitgear",
    name: "FitGear",
    category: "thuong-mai-dien-tu",
    summary: "Đồ thể thao, flash sale và so sánh sản phẩm.",
    description: "Cửa hàng dụng cụ thể thao với flash sale đếm ngược, so sánh sản phẩm và đánh giá của khách hàng.",
    features: ["Flash sale đếm ngược", "So sánh sản phẩm", "Đánh giá có ảnh", "Trả góp 0%"],
    price: P,
    palette: { bg: "#ffffff", fg: "#111111", accent: "#dc2626", soft: "#fee2e2", hero: "#b91c1c", heroFg: "#ffffff" },
    headline: "Tập mạnh hơn mỗi ngày, giảm đến 50%",
    announcement: "Flash sale 12h: máy chạy bộ giảm 30%",
    nav: ["Máy tập", "Giày", "Quần áo", "Flash sale"],
  },
  {
    slug: "english-hub",
    name: "English Hub",
    category: "giao-duc",
    summary: "Luyện nói tiếng Anh theo tình huống, chấm phát âm từng câu.",
    description: "Thư viện bài luyện nói theo tình huống thực tế, theo dõi chuỗi ngày học và tiến độ từng kỹ năng.",
    features: ["Bài học theo trình độ", "Chuỗi ngày học, huy hiệu", "Theo dõi tiến độ", "Thanh toán khoá học"],
    price: P,
    palette: { bg: "#fffdf7", fg: "#1c1917", accent: "#0d9488", soft: "#ccfbf1", hero: "#fde68a", heroFg: "#1c1917" },
    headline: "Nói tiếng Anh tự tin sau 30 ngày",
    announcement: "Học thử 7 ngày miễn phí",
    nav: ["Khoá học", "Luyện nói", "Từ vựng", "Giáo viên"],
    featured: true,
  },
  {
    slug: "code-kid",
    name: "CodeKid",
    category: "giao-duc",
    summary: "Lớp lập trình cho trẻ em, lịch học và báo cáo cho phụ huynh.",
    description: "Trang tuyển sinh lớp lập trình cho trẻ 7 đến 15 tuổi, lịch khai giảng, đăng ký học thử và báo cáo tiến độ cho phụ huynh.",
    features: ["Lịch khai giảng", "Đăng ký học thử", "Báo cáo cho phụ huynh", "Thư viện dự án của học viên"],
    price: P,
    palette: { bg: "#f5f3ff", fg: "#1e1b4b", accent: "#7c3aed", soft: "#ede9fe", hero: "#4c1d95", heroFg: "#ffffff" },
    headline: "Con tự làm game đầu tiên sau 8 buổi",
    announcement: "Khai giảng khoá mới mỗi thứ Bảy",
    nav: ["Khoá học", "Lịch học", "Dự án", "Phụ huynh"],
  },
  {
    slug: "an-nhien-spa",
    name: "An Nhiên Spa",
    category: "dich-vu",
    summary: "Spa và chăm sóc da, đặt lịch theo khung giờ trống.",
    description: "Giới thiệu liệu trình, bảng giá, đặt lịch theo khung giờ trống của kỹ thuật viên và nhắc lịch qua Zalo.",
    features: ["Bảng giá liệu trình", "Đặt lịch theo giờ trống", "Thẻ thành viên", "Đánh giá khách hàng"],
    price: P,
    palette: { bg: "#fdf8f6", fg: "#3b2a26", accent: "#be7c6d", soft: "#f6e3dc", hero: "#e9d3c8", heroFg: "#3b2a26" },
    headline: "Một giờ thư thái giữa tuần bận rộn",
    announcement: "Giảm 20% cho lần đặt lịch đầu tiên",
    nav: ["Liệu trình", "Bảng giá", "Đặt lịch", "Ưu đãi"],
    featured: true,
    extraVariants: [
      {
        id: "thao-moc",
        name: "Thảo mộc",
        description: "Xanh lá dịu, cảm giác tự nhiên, hợp spa thảo dược.",
        palette: { bg: "#f6f8f3", fg: "#22301f", accent: "#5b7c4a", soft: "#e4ecdc", hero: "#dfe8d5", heroFg: "#22301f", card: "#ffffff" },
        look: { radius: 1.6, pillButtons: true, headingFont: "serif", headingWeight: 600, centeredHeader: true },
      },
    ],
  },
  {
    slug: "sach-nha",
    name: "Sạch Nhà",
    category: "dich-vu",
    summary: "Dịch vụ vệ sinh, form báo giá ngay đầu trang.",
    description: "Dịch vụ vệ sinh nhà ở và văn phòng với form báo giá nhanh đầu trang, bảng giá theo diện tích và cam kết chất lượng.",
    features: ["Form báo giá đầu trang", "Giá theo diện tích", "Gọi điện một chạm", "Hình ảnh trước và sau"],
    price: P,
    palette: { bg: "#f0f9ff", fg: "#0c4a6e", accent: "#0284c7", soft: "#e0f2fe", hero: "#0369a1", heroFg: "#ffffff" },
    headline: "Nhà sạch bong trong 3 giờ, có bảo hành",
    announcement: "Hotline 24/7, có mặt sau 60 phút",
    nav: ["Dịch vụ", "Bảng giá", "Quy trình", "Liên hệ"],
  },
  {
    slug: "cafe-som",
    name: "Cà Phê Sớm",
    category: "landing-page",
    summary: "Ra mắt ứng dụng đặt cà phê, đăng ký nhận ưu đãi.",
    description: "Landing page ra mắt sản phẩm: giới thiệu tính năng, đếm ngược ngày ra mắt, thu thập email và số điện thoại.",
    features: ["Đếm ngược ra mắt", "Form thu thập khách hàng", "Gắn mã đo lường quảng cáo", "Tối ưu tốc độ tải"],
    price: P,
    palette: { bg: "#fff7ed", fg: "#431407", accent: "#ea580c", soft: "#ffedd5", hero: "#fff7ed", heroFg: "#431407" },
    headline: "Cà phê nóng đợi sẵn, không cần xếp hàng",
    announcement: "Ra mắt ngày 01/12, đăng ký nhận ly đầu miễn phí",
    nav: ["Tính năng", "Cửa hàng", "Hỏi đáp"],
    featured: true,
  },
  {
    slug: "nha-mau-3d",
    name: "Nhà Mẫu 3D",
    category: "khong-gian-3d",
    summary: "Tham quan căn hộ mẫu 3D, đổi vật liệu trực tiếp.",
    description: "Không gian 3D cho dự án bất động sản: đi lại trong căn hộ mẫu, đổi vật liệu sàn và tường, xem thông tin từng phòng.",
    features: ["Tham quan 3D trên trình duyệt", "Đổi vật liệu trực tiếp", "Điểm thông tin từng phòng", "Đặt lịch xem nhà"],
    price: P,
    palette: { bg: "#0b1020", fg: "#e2e8f0", accent: "#38bdf8", soft: "#1e293b", hero: "#0f172a", heroFg: "#f8fafc" },
    headline: "Bước vào căn hộ trước khi xây xong",
    announcement: "Mở bán đợt 2, chiết khấu 5%",
    nav: ["Căn hộ", "Tiện ích", "Vị trí", "Đặt lịch"],
  },
  {
    slug: "viec-nhanh",
    name: "Việc Nhanh",
    category: "tuyen-dung",
    summary: "Trang việc làm có bộ lọc chi tiết, nộp hồ sơ một chạm.",
    description: "Trang tuyển dụng với tìm kiếm theo vị trí, mức lương, khu vực; hồ sơ ứng viên và trang quản lý cho nhà tuyển dụng.",
    features: ["Lọc theo lương, khu vực", "Nộp hồ sơ một chạm", "Trang cho nhà tuyển dụng", "Thông báo việc mới"],
    price: P,
    palette: { bg: "#f8fafc", fg: "#0f172a", accent: "#16a34a", soft: "#dcfce7", hero: "#14532d", heroFg: "#f0fdf4" },
    headline: "Hơn 2.000 việc làm mới mỗi tuần",
    announcement: "Ứng tuyển không cần đăng nhập",
    nav: ["Việc làm", "Công ty", "Lương", "Nhà tuyển dụng"],
  },
  {
    slug: "o-chu-vui",
    name: "Ô Chữ Vui",
    category: "game",
    summary: "Game ô chữ hằng ngày, bảng xếp hạng bạn bè.",
    description: "Game ô chữ tiếng Việt mỗi ngày một câu đố mới, chia sẻ kết quả và bảng xếp hạng bạn bè.",
    features: ["Câu đố mới mỗi ngày", "Bảng xếp hạng", "Chia sẻ kết quả", "Không cần cài đặt"],
    price: P,
    palette: { bg: "#18181b", fg: "#fafafa", accent: "#facc15", soft: "#27272a", hero: "#18181b", heroFg: "#fafafa" },
    headline: "Một câu đố mỗi ngày",
    announcement: "Thử thách tuần: giải 7 ngày liên tiếp",
    nav: ["Chơi", "Xếp hạng", "Luật chơi"],
  },
  {
    slug: "data-pulse",
    name: "Data Pulse",
    category: "cong-cu-ai",
    summary: "Dashboard doanh thu, AI tóm tắt số liệu mỗi sáng.",
    description: "Bảng điều khiển số liệu kinh doanh với biểu đồ thời gian thực và trợ lý AI tóm tắt điểm đáng chú ý mỗi ngày.",
    features: ["Biểu đồ thời gian thực", "AI tóm tắt số liệu", "Phân quyền nhóm", "Xuất báo cáo"],
    price: P,
    palette: { bg: "#f8fafc", fg: "#0f172a", accent: "#2563eb", soft: "#dbeafe", hero: "#0f172a", heroFg: "#f8fafc" },
    headline: "Doanh thu hôm nay",
    announcement: "AI: doanh thu tăng 12% so với tuần trước",
    nav: ["Tổng quan", "Đơn hàng", "Khách hàng", "Báo cáo"],
    featured: true,
  },
  {
    slug: "auto-viet",
    name: "AutoViệt",
    category: "o-to",
    summary: "Showroom ô tô, dự toán lăn bánh, đăng ký lái thử.",
    description: "Website đại lý ô tô: dòng xe, thông số, bảng tính chi phí lăn bánh theo tỉnh và đặt lịch lái thử.",
    features: ["Danh sách dòng xe", "Dự toán lăn bánh", "Đăng ký lái thử", "So sánh phiên bản"],
    price: P,
    palette: { bg: "#f4f4f5", fg: "#18181b", accent: "#e11d48", soft: "#e4e4e7", hero: "#27272a", heroFg: "#fafafa" },
    headline: "Lái thử tận nhà, nhận xe trong tuần",
    announcement: "Ưu đãi 50% lệ phí trước bạ tháng này",
    nav: ["Dòng xe", "Bảng giá", "Lái thử", "Dịch vụ"],
  },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function projectsIn(categoryId: string): Project[] {
  return PROJECTS.filter((p) => p.category === categoryId);
}

/** Dự án đầu tiên của mỗi lĩnh vực, dùng cho khung xem trước ở đầu trang chủ. */
export function heroProjectFor(categoryId: string): Project | undefined {
  return projectsIn(categoryId)[0];
}

/* ---------------------------------------------------------------- Giao diện */

export const DEFAULT_LOOK: Look = { radius: 1, pillButtons: true, headingFont: "sans", headingWeight: 800, centeredHeader: false };

/** Trộn hai màu hex theo tỉ lệ t (0 = a, 1 = b). */
function mix(a: string, b: string, t: number): string {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

function isDark(hex: string): boolean {
  const [r, g, b] = hex.match(/\w\w/g)!.map((h) => parseInt(h, 16));
  return r * 0.299 + g * 0.587 + b * 0.114 < 128;
}

/**
 * Mỗi mẫu có sẵn 3 giao diện sinh từ bảng màu gốc, cộng thêm extraVariants nếu có:
 * Nguyên bản (bo tròn, chữ đậm), Thanh lịch (nền kem, tiêu đề có chân, góc vuông, logo giữa),
 * Đêm (nền tối, màu nhấn giữ nguyên, bo tròn nhiều).
 */
export function variantsOf(project: Project): Variant[] {
  const base = project.palette;
  const darkBase = isDark(base.bg);
  const elegantBg = darkBase ? "#f7f3ec" : mix(base.bg, "#f3ede2", 0.7);
  const variants: Variant[] = [
    {
      id: "nguyen-ban",
      name: "Nguyên bản",
      description: "Bố cục gốc, chữ đậm, bo góc mềm.",
      palette: { ...base, card: base.card ?? (darkBase ? mix(base.bg, "#ffffff", 0.08) : "#ffffff") },
      look: DEFAULT_LOOK,
    },
    {
      id: "thanh-lich",
      name: "Thanh lịch",
      description: "Nền kem, tiêu đề có chân, góc vuông, logo ở giữa.",
      palette: {
        bg: elegantBg,
        fg: "#1f1b16",
        accent: darkBase ? mix(base.accent, "#1f1b16", 0.35) : base.accent,
        soft: mix(elegantBg, "#1f1b16", 0.07),
        hero: mix(elegantBg, "#1f1b16", 0.1),
        heroFg: "#1f1b16",
        card: "#fffdf9",
      },
      look: { radius: 0.15, pillButtons: false, headingFont: "serif", headingWeight: 600, centeredHeader: true },
    },
    {
      id: "dem",
      name: "Đêm",
      description: "Nền tối, màu nhấn nổi bật, hợp sản phẩm công nghệ và giải trí.",
      palette: {
        bg: "#0c0c11",
        fg: "#f4f4f5",
        accent: isDark(base.accent) ? mix(base.accent, "#ffffff", 0.35) : base.accent,
        soft: "#1b1b23",
        hero: mix("#14141b", base.accent, 0.18),
        heroFg: "#ffffff",
        card: "#16161d",
      },
      look: { radius: 1.4, pillButtons: true, headingFont: "sans", headingWeight: 800, centeredHeader: false },
    },
  ];
  return [...variants, ...(project.extraVariants ?? [])];
}

/** Trả về bản sao của mẫu với bảng màu và phong cách của giao diện đã chọn. */
export function applyVariant(project: Project, variantId?: string | null): Project {
  const all = variantsOf(project);
  const v = all.find((x) => x.id === variantId) ?? all[0];
  return { ...project, palette: v.palette, look: v.look };
}
