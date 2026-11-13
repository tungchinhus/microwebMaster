import { getCategory, getProject, type PreviewKind, type Project } from "@/lib/showcase/catalog";
import { getComponentDef, type ComponentType } from "./components";
import { newUid, type CustomerSite, type PlacedComponent } from "./types";

type Block = [ComponentType, Record<string, string>?];

/**
 * Bố cục trang của từng lĩnh vực: mẫu trong kho được ráp từ các khối này.
 * Khối mua thêm có trong bố cục (sản phẩm, đặt lịch...) được tính vào giá mẫu.
 */
const LAYOUTS: Record<PreviewKind, Block[]> = {
  shop: [["hero"], ["features"], ["products"], ["reviews"], ["cta", { title: "Ưu đãi cho đơn đầu tiên", button: "Mua ngay" }]],
  edu: [["hero"], ["stats", { items: "12.000+ | Học viên\n96% | Hoàn thành khoá\n4,9/5 | Đánh giá\n150+ | Bài học" }], ["features"], ["products", { title: "Khoá học nổi bật" }], ["reviews", { title: "Học viên nói gì" }], ["faq", { items: "Học online hay tại lớp? | Cả hai, bạn chọn khi đăng ký.\nCó học thử không? | Có buổi học thử miễn phí.\nHọc phí trả thế nào? | Chuyển khoản hoặc trả góp 0%." }]],
  service: [["hero"], ["features"], ["products", { title: "Bảng giá dịch vụ" }], ["booking"], ["reviews"], ["faq", { items: "Có cần đặt lịch trước không? | Nên đặt trước 1 ngày để có giờ đẹp.\nĐổi lịch được không? | Báo trước 2 giờ là đổi được.\nThanh toán thế nào? | Tiền mặt, chuyển khoản hoặc thẻ." }]],
  landing: [["hero"], ["features"], ["stats"], ["reviews"], ["cta", { title: "Đăng ký nhận ưu đãi ra mắt", button: "Đăng ký ngay" }], ["contact", { title: "Để lại thông tin" }]],
  space3d: [["hero"], ["gallery", { title: "Không gian thực tế" }], ["features"], ["products", { title: "Các loại căn" }], ["contact", { title: "Đặt lịch xem nhà" }]],
  jobs: [["hero"], ["stats", { items: "1.200+ | Việc làm\n350+ | Doanh nghiệp\n48 giờ | Phản hồi hồ sơ" }], ["features"], ["cta", { title: "Doanh nghiệp cần tuyển gấp?", text: "Đăng tin trong 5 phút, nhận hồ sơ ngay hôm nay.", button: "Đăng tin tuyển dụng" }], ["contact", { title: "Gửi hồ sơ, đăng tin" }]],
  game: [["hero"], ["features"], ["stats", { items: "50.000+ | Lượt chơi\nTop 100 | Bảng xếp hạng\nMỗi ngày | Thử thách mới" }], ["cta", { title: "Chơi ngay, không cần cài đặt", button: "Bắt đầu chơi" }]],
  ai: [["hero"], ["features"], ["stats", { items: "10x | Nhanh hơn\n99,9% | Thời gian hoạt động\n5.000+ | Người dùng" }], ["faq", { items: "Dữ liệu có an toàn không? | Dữ liệu được mã hoá và không dùng để huấn luyện.\nCó dùng thử không? | Có 14 ngày dùng thử miễn phí.\nHuỷ gói thế nào? | Huỷ bất cứ lúc nào trong phần cài đặt." }], ["cta", { title: "Dùng thử 14 ngày miễn phí", button: "Dùng thử" }]],
  auto: [["hero"], ["gallery", { title: "Showroom" }], ["products", { title: "Dòng xe" }], ["booking", { title: "Đăng ký lái thử" }], ["contact", { title: "Nhận báo giá lăn bánh" }]],
};

export function layoutTypes(project: Project): ComponentType[] {
  const kind = getCategory(project.category)?.kind ?? "shop";
  return LAYOUTS[kind].map(([t]) => t);
}

/** Các khối của mẫu, sẵn sàng gắn vào vùng Nội dung (bỏ những loại chỉ đặt một lần đã có). */
export function templateBlocks(project: Project, existing: Set<ComponentType> = new Set(), uid: (i: number) => string = () => newUid()): PlacedComponent[] {
  const kind = getCategory(project.category)?.kind ?? "shop";
  return LAYOUTS[kind]
    .filter(([t]) => !(getComponentDef(t)?.unique && existing.has(t)))
    .map(([type, props], i) => ({ uid: uid(i), type, props: { ...(getComponentDef(type)?.defaults ?? {}), ...(props ?? {}) }, included: true }));
}

/** Web tạo trước khi có bố cục khối: chèn các khối của mẫu lên đầu vùng Nội dung. */
export function withTemplateLayout(site: CustomerSite): CustomerSite {
  if (site.layout === 2) return site;
  const project = getProject(site.template);
  if (!project) return { ...site, layout: 2 };
  const existing = new Set(site.regions.main.map((c) => c.type));
  // uid cố định để đọc lại nhiều lần vẫn ra cùng kết quả (không bị coi là đã sửa).
  const blocks = templateBlocks(project, existing, (i) => `mau-${i}`);
  // Khối mua thêm đã có (sản phẩm, đặt lịch...) đứng sau banner và điểm nổi bật.
  const head = blocks.filter((b) => b.type === "hero" || b.type === "features");
  const tail = blocks.filter((b) => !head.includes(b));
  return { ...site, layout: 2, regions: { ...site.regions, main: [...head, ...site.regions.main, ...tail] } };
}
