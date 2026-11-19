import {
  BadgePercent, CalendarClock, CalendarDays, CircleHelp, Gauge, Grid2x2, Handshake, Image as ImageIcon, Info, LayoutPanelTop,
  ListOrdered, Mail, MapPin, Megaphone, MessageSquareQuote, Milestone, Newspaper, PanelsTopLeft, ShieldCheck, ShoppingBag, Sparkles, Tags, Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { getComponentDef, type ComponentType } from "@/lib/sites/components";
import { templateBlocks } from "@/lib/sites/layouts";
import type { Project } from "@/lib/showcase/catalog";

const ICONS: Partial<Record<ComponentType, LucideIcon>> = {
  hero: LayoutPanelTop, features: Sparkles, about: Info, stats: Gauge, gallery: ImageIcon, cta: Megaphone, faq: CircleHelp,
  products: ShoppingBag, booking: CalendarDays, contact: Mail, reviews: MessageSquareQuote, newsletter: Mail,
  categories: Grid2x2, deals: BadgePercent, policies: ShieldCheck, team: Users, steps: ListOrdered, plans: Tags,
  schedule: CalendarClock, timeline: Milestone, locations: MapPin, blog: Newspaper, partners: Handshake,
};

/** Câu mô tả cho khách xem mẫu: phần này giúp gì cho web của họ. */
const WHAT: Partial<Record<ComponentType, string>> = {
  hero: "Ấn tượng đầu tiên: tiêu đề, lời mời và nút hành động chính.",
  features: "Nêu điểm mạnh để khách thấy vì sao nên chọn bạn.",
  about: "Kể câu chuyện thương hiệu, tạo cảm giác gần gũi.",
  stats: "Con số nổi bật giúp khách tin ngay từ cái nhìn đầu.",
  gallery: "Ảnh thật về sản phẩm, không gian, công trình.",
  cta: "Lời mời hành động rõ ràng ở giữa trang.",
  faq: "Trả lời trước các câu khách hay hỏi, bớt tin nhắn hỏi lại.",
  products: "Sản phẩm, dịch vụ kèm giá và nút đặt mua.",
  booking: "Khách tự chọn dịch vụ, ngày giờ và gửi lịch hẹn.",
  contact: "Form để khách để lại số điện thoại nhận tư vấn.",
  reviews: "Đánh giá của khách cũ, tăng niềm tin.",
  newsletter: "Thu email khách để gửi ưu đãi sau này.",
  categories: "Ô danh mục có hình, khách tìm đúng nhóm hàng nhanh.",
  deals: "Flash sale có đồng hồ đếm ngược, thúc khách mua ngay.",
  policies: "Cam kết giao hàng, đổi trả, chính hãng, thanh toán.",
  team: "Giới thiệu người làm: bác sĩ, giảng viên, thợ, huấn luyện viên.",
  steps: "Các bước rõ ràng để khách biết sẽ diễn ra thế nào.",
  plans: "Bảng gói so sánh, gói nổi bật được làm nổi.",
  schedule: "Lịch 7 ngày trong tuần, hôm nay được tô màu.",
  timeline: "Các mốc tiến độ, lịch trình hoặc hành trình thương hiệu.",
  locations: "Bản đồ, địa chỉ, giờ mở cửa và số gọi của từng chi nhánh.",
  blog: "Tin tức, cẩm nang giúp tăng tin cậy và lên Google.",
  partners: "Đối tác, khách hàng tiêu biểu đã đồng hành.",
};

/** Danh sách các phần của trang mẫu, bấm vào là mở đúng phần đó trên bản xem trọn mẫu. */
export function TemplateParts({ project }: { project: Project }) {
  const blocks = templateBlocks(project, new Set(), (i) => `phan-${i}`);
  return (
    <section className="mt-20" aria-labelledby="cac-phan">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="cac-phan" className="text-3xl font-bold tracking-tight">
            Trang chủ gồm {blocks.length} phần
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
            Dựng theo trang chủ của các web cùng ngành đang chạy. Bấm vào một phần để xem nó trên mẫu thật.
          </p>
        </div>
        <Link href={`/demo/${project.slug}`} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <PanelsTopLeft className="size-4" /> Mở bản xem trọn mẫu
        </Link>
      </div>
      <ol className={`grid gap-3 sm:grid-cols-2 ${blocks.length % 3 === 1 && blocks.length % 2 === 0 ? "" : "lg:grid-cols-3"}`}>
        {blocks.map((b, i) => {
          const def = getComponentDef(b.type);
          const Icon = ICONS[b.type] ?? Sparkles;
          const name = b.type === "hero" ? "Banner đầu trang" : b.props.title || def?.name;
          return (
            <li key={b.uid}>
              <Link
                href={`/xem/${project.slug}/#khoi-${b.type}`}
                target="_blank"
                className="group flex h-full items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-semibold group-hover:text-primary">{name}</span>
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">{WHAT[b.type] ?? def?.description}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
