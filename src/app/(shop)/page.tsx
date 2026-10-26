import { ShieldCheck, Truck, Undo2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { storeConfig } from "@/config/store";
import { formatPrice } from "@/lib/format";
import { HomeContent } from "./home-content";

const perks = [
  { icon: Truck, title: "Giao hàng toàn quốc", text: `Miễn phí đơn từ ${formatPrice(storeConfig.freeShippingThreshold)}` },
  { icon: ShieldCheck, title: "Hàng chính hãng", text: "Bảo hành đầy đủ theo nhà sản xuất" },
  { icon: Undo2, title: "Đổi trả 7 ngày", text: "Lỗi là đổi, không cần lý do phức tạp" },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-primary-foreground sm:px-12 sm:py-20">
        <div className="relative z-10 max-w-xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-wider opacity-80">{storeConfig.tagline}</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">Công nghệ chính hãng, giá tốt mỗi ngày</h1>
          <p className="opacity-90">{storeConfig.description}</p>
          <ButtonLink href="/products" size="lg" variant="outline" className="border-transparent bg-white text-slate-900 hover:bg-white/90">
            Mua sắm ngay
          </ButtonLink>
        </div>
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 right-24 size-64 rounded-full bg-white/10" />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {perks.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="text-xs text-muted-foreground">{text}</div>
            </div>
          </div>
        ))}
      </section>

      <HomeContent />
    </div>
  );
}
