import { ArrowRight, Check, Clock, MessagesSquare, Palette, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { CategoryCard, ProjectCard } from "@/components/showcase/cards";
import { CompareBar } from "@/components/showcase/compare-ui";
import { HeroShowcase } from "@/components/showcase/hero-showcase";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { SITE, formatVnd } from "@/config/site";
import { CATEGORIES, COMING_SOON, PROJECTS } from "@/lib/showcase/catalog";

const STEPS = [
  { icon: Palette, title: "Chọn mẫu", text: "Xem kho mẫu theo lĩnh vực, chọn bố cục bạn thích. Màu sắc và chữ đều đổi được." },
  { icon: MessagesSquare, title: "Gửi nội dung", text: "Gửi logo, sản phẩm, hình ảnh. Chúng tôi dựng web và gửi bản xem thử trong vài ngày." },
  { icon: Rocket, title: "Nhận web, chạy luôn", text: "Gắn tên miền, bàn giao tài khoản quản trị và hướng dẫn sử dụng. Dữ liệu là của bạn." },
];

const PLANS = [
  {
    name: "Cơ bản",
    price: formatVnd(SITE.startingPrice),
    note: "Một mẫu có sẵn, đổi nội dung",
    features: ["Chọn 1 mẫu trong kho", "Đổi logo, màu, nội dung", "Tên miền và hosting năm đầu", "Bàn giao trong 3 ngày"],
  },
  {
    name: "Doanh nghiệp",
    price: formatVnd(7_900_000),
    note: "Thêm tính năng theo ngành",
    features: ["Mọi thứ trong gói Cơ bản", "Thêm tối đa 5 trang hoặc tính năng", "Trang quản trị, phân quyền", "Tối ưu SEO và tốc độ", "Hỗ trợ 6 tháng"],
    highlight: true,
  },
  {
    name: "Theo yêu cầu",
    price: "Báo giá riêng",
    note: "Thiết kế và tính năng riêng",
    features: ["Thiết kế giao diện riêng", "Kết nối hệ thống có sẵn", "3D, game, công cụ AI", "Hỗ trợ dài hạn"],
  },
];

const FAQ = [
  ["Giá đã gồm những gì?", `Giá gói gồm dựng web từ mẫu, đổi nội dung theo thương hiệu của bạn, tên miền .vn hoặc .com và hosting năm đầu. Không phát sinh nếu không đổi phạm vi.`],
  ["Bao lâu thì có web?", `Thường ${SITE.deliveryDays} kể từ khi nhận đủ nội dung. Bạn xem bản thử và góp ý trước khi chạy chính thức.`],
  ["Tôi có tự sửa nội dung được không?", "Có. Mỗi web đi kèm trang quản trị để bạn tự thêm sản phẩm, bài viết, đơn hàng mà không cần biết lập trình."],
  ["Không hài lòng thì sao?", `Bạn được hoàn tiền trong ${SITE.refundDays} ngày nếu web không đúng như mẫu đã chọn.`],
  ["Tự tạo bằng AI khác gì?", "Bạn tự nhập thông tin và Gemini API Key, Web Master viết mã nguồn và đưa web lên Firebase của bạn. Miễn phí, phù hợp nếu bạn quen kỹ thuật."],
];

export default function HomePage() {
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-20 lg:grid-cols-[1fr_1.15fr] lg:pt-24">
          <div className="space-y-7">
            <h1 className="text-5xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Website riêng, chọn mẫu là có
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Mẫu sẵn cho bán hàng, giáo dục, dịch vụ, tuyển dụng, 3D và nhiều lĩnh vực khác. Giá cố định, thấy ngay. Bàn giao trong{" "}
              {SITE.deliveryDays}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/kho"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Xem mẫu web
              </Link>
              <Link
                href="/tao-web"
                className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-foreground/80 px-8 text-lg font-semibold transition hover:bg-foreground hover:text-background"
              >
                <Sparkles className="size-5" /> Tự tạo bằng AI
              </Link>
            </div>
            <p className="text-[15px] text-muted-foreground">
              Từ {formatVnd(SITE.startingPrice)} · Hoàn tiền trong {SITE.refundDays} ngày
            </p>
          </div>
          <HeroShowcase />
        </section>

        {/* Lĩnh vực */}
        <section className="mx-auto max-w-7xl px-4 pb-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Chọn theo lĩnh vực</h2>
            <p className="max-w-md text-muted-foreground">Mỗi lĩnh vực có bố cục và tính năng riêng, đã chạy thật trên điện thoại và máy tính.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
            {CATEGORIES.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
            <CategoryCard category={COMING_SOON} />
          </div>
        </section>

        {/* Dự án tiêu biểu */}
        <section className="mx-auto max-w-7xl px-4 pb-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Mẫu tiêu biểu</h2>
            <Link href="/kho" className="inline-flex items-center gap-1.5 font-semibold text-primary">
              Xem tất cả {PROJECTS.length} mẫu <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProjectCard key={p.slug} project={p} showSummary />
            ))}
          </div>
        </section>

        {/* Quy trình */}
        <section className="mx-auto max-w-7xl px-4 pb-24">
          <div className="rounded-[36px] bg-foreground px-6 py-14 text-background sm:px-12">
            <h2 className="mb-12 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Ba bước để có website</h2>
            <div className="grid gap-10 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-background/10">
                      <s.icon className="size-5" />
                    </span>
                    <span className="text-sm font-semibold opacity-60">Bước {i + 1}</span>
                  </div>
                  <h3 className="text-2xl font-semibold">{s.title}</h3>
                  <p className="leading-relaxed opacity-70">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bảng giá */}
        <section id="bang-gia" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-24">
          <div className="mb-10 max-w-2xl space-y-3">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Bảng giá rõ ràng</h2>
            <p className="text-lg text-muted-foreground">Giá cố định theo gói, biết trước khi bắt đầu.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col gap-6 rounded-[28px] p-8 ${
                  plan.highlight ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/25" : "border border-border/60 bg-card"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    {plan.highlight && <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Phổ biến</span>}
                  </div>
                  <div className="text-4xl font-bold tracking-tight">{plan.price}</div>
                  <p className={plan.highlight ? "opacity-80" : "text-muted-foreground"}>{plan.note}</p>
                </div>
                <ul className="space-y-3 text-[15px]">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <Check className="mt-0.5 size-4 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/bao-gia?goi=${encodeURIComponent(plan.name)}`}
                  className={`mt-auto inline-flex h-12 items-center justify-center rounded-full font-semibold transition ${
                    plan.highlight ? "bg-white text-primary hover:bg-white/90" : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  Chọn gói này
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px] text-muted-foreground">
            <span className="flex items-center gap-2"><ShieldCheck className="size-4" /> Hoàn tiền trong {SITE.refundDays} ngày</span>
            <span className="flex items-center gap-2"><Clock className="size-4" /> Bàn giao trong {SITE.deliveryDays}</span>
          </div>
        </section>

        {/* AI */}
        <section className="mx-auto max-w-7xl px-4 pb-24">
          <div className="grid items-center gap-8 rounded-[36px] border border-border/60 bg-card p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <Sparkles className="size-4" /> Miễn phí
              </span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Quen kỹ thuật? Tự tạo bằng AI</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Nhập thông tin cửa hàng và Gemini API Key, Web Master viết toàn bộ mã nguồn React + Firebase, rồi đưa web lên Firebase
                Hosting của chính bạn.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <Link
                href="/tao-web"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-foreground px-8 text-lg font-semibold text-background transition hover:opacity-90"
              >
                Mở trình tạo web <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Hỏi đáp */}
        <section id="hoi-dap" className="mx-auto max-w-3xl scroll-mt-28 px-4">
          <h2 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">Hỏi đáp</h2>
          <div className="divide-y divide-border rounded-[28px] border border-border/60 bg-card">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group px-7 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="text-2xl leading-none text-muted-foreground transition group-open:rotate-45">+</span>
                </summary>
                <p className="pt-3 leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
        <CompareBar />
      </main>
      <SiteFooter />
    </>
  );
}
