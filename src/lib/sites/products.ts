import { getCategory, type PreviewKind, type Project } from "@/lib/showcase/catalog";

export interface SampleProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
}

/** Tên mẫu theo lĩnh vực; admin bàn giao xong thì khách tự thay bằng sản phẩm thật. */
const NAMES: Record<PreviewKind, string[]> = {
  shop: ["Bán chạy nhất", "Hàng mới về", "Combo tiết kiệm", "Quà tặng", "Phiên bản giới hạn", "Phụ kiện đi kèm"],
  edu: ["Khoá cơ bản", "Khoá nâng cao", "Luyện thi cấp tốc", "Kèm 1-1", "Lớp cuối tuần", "Gói cả năm"],
  service: ["Gói cơ bản", "Gói tiêu chuẩn", "Gói cao cấp", "Thẻ thành viên tháng", "Gói gia đình", "Gói doanh nghiệp"],
  landing: ["Gói dùng thử", "Gói tháng", "Gói năm", "Quà ra mắt"],
  space3d: ["Căn 1 phòng ngủ", "Căn 2 phòng ngủ", "Căn góc 3 phòng ngủ", "Penthouse"],
  jobs: ["Tin tuyển dụng thường", "Tin nổi bật", "Gói 10 tin", "Gói tuyển gấp"],
  game: ["Gói gợi ý", "Vé chơi lại", "Gói không quảng cáo", "Huy hiệu đặc biệt"],
  ai: ["Gói cá nhân", "Gói nhóm", "Gói doanh nghiệp", "Báo cáo theo yêu cầu"],
  auto: ["Sedan hạng B", "SUV 7 chỗ", "Xe điện đô thị", "Bán tải", "Phụ kiện chính hãng", "Gói bảo dưỡng"],
};

const PRICES: Record<PreviewKind, number[]> = {
  shop: [459_000, 1_290_000, 789_000, 289_000, 2_890_000, 189_000],
  edu: [990_000, 1_890_000, 2_490_000, 3_900_000, 1_290_000, 6_900_000],
  service: [350_000, 590_000, 990_000, 1_490_000, 1_890_000, 4_900_000],
  landing: [0, 99_000, 990_000, 49_000],
  space3d: [2_100_000_000, 3_200_000_000, 4_600_000_000, 9_800_000_000],
  jobs: [300_000, 800_000, 2_500_000, 1_500_000],
  game: [20_000, 10_000, 49_000, 30_000],
  ai: [199_000, 990_000, 4_900_000, 1_500_000],
  auto: [559_000_000, 899_000_000, 690_000_000, 799_000_000, 2_900_000, 1_500_000],
};

export function sampleProducts(project: Project): SampleProduct[] {
  const kind = getCategory(project.category)?.kind ?? "shop";
  const nav = project.nav.length ? project.nav : [project.name];
  return NAMES[kind].map((label, i) => ({
    id: `${project.slug}-${i}`,
    name: kind === "shop" ? `${nav[i % nav.length]} · ${label}` : label,
    price: PRICES[kind][i % PRICES[kind].length],
  }));
}

export function formatPrice(value: number): string {
  return value === 0 ? "Miễn phí" : `${value.toLocaleString("vi-VN")}đ`;
}
