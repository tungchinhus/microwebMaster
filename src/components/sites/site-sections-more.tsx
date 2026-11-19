"use client";

import { ArrowRight, Check, Clock, CreditCard, Flame, MapPin, Phone, RotateCcw, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { createElement, useEffect, useState } from "react";
import { KIND_ICON } from "@/components/showcase/mini-site";
import { getCategory } from "@/lib/showcase/catalog";
import { formatPrice } from "@/lib/sites/products";
import { Artwork } from "./site-art";
import { useSiteRuntime } from "./site-runtime";

/**
 * Các khối thường gặp trên trang chủ web thật theo từng ngành (tham khảo web đang chạy ở Việt Nam):
 * danh mục, flash sale, dải cam kết, đội ngũ, quy trình, bảng gói, lịch tuần, tiến độ, chi nhánh, tin tức, đối tác.
 * Nội dung nhập theo dòng "a | b | c" để admin sửa dễ trong trình sửa web.
 */

type Props = { props: Record<string, string> };

const rows = (text?: string) =>
  (text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split("|").map((x) => x.trim()));

function Title({ title, sub }: { title?: string; sub?: string }) {
  if (!title) return null;
  return (
    <div className="mb-6 space-y-1.5">
      <h2 className="ws-h text-2xl sm:text-3xl">{title}</h2>
      {sub && <p className="ws-muted max-w-2xl text-[15px] leading-relaxed">{sub}</p>}
    </div>
  );
}

function KindIcon(props: { className?: string; strokeWidth?: number }) {
  const { project } = useSiteRuntime();
  return createElement(KIND_ICON[getCategory(project.category)?.kind ?? "shop"], props);
}

/** Lưới số cột theo số mục để hàng cuối không lẻ. */
const cols = (n: number) => (n % 4 === 0 ? "sm:grid-cols-2 lg:grid-cols-4" : n % 3 === 0 ? "sm:grid-cols-3" : n === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3");

/* --------------------------------------------------------------- Danh mục */

const NOT_CATEGORY = /đặt|liên hệ|cửa hàng|chi nhánh|câu chuyện|ưu đãi|khuyến mãi|flash sale|bảng giá|lịch|tham quan|giới thiệu|dự án|nghệ nhân|thành viên|ghé quán|hỏi đáp/;

export function CategoriesSection({ props }: Props) {
  const { project, products } = useSiteRuntime();
  const items = rows(props.items);
  // Để trống: lấy menu của mẫu, bỏ các mục là hành động (đặt lịch, cửa hàng, ưu đãi...) vì không phải danh mục hàng.
  const fromNav = project.nav.filter((n) => !NOT_CATEGORY.test(n.toLowerCase())).map((n) => [n, ""]);
  const list = items.length ? items : fromNav.length >= 3 ? fromNav : products.slice(0, 6).map((p) => [p.name, ""]);
  return (
    <section>
      <Title title={props.title} sub={props.sub} />
      <div className={`grid gap-2.5 sm:gap-3 ${list.length % 3 === 0 ? "grid-cols-3" : "grid-cols-2"} ${list.length === 6 ? "lg:grid-cols-6" : list.length % 3 === 0 ? "" : "md:grid-cols-4"}`}>
        {list.map(([name, desc], i) => (
          <a key={name + i} href="#san-pham" className="ws-card group flex flex-col items-center gap-2 p-2.5 text-center text-sm transition hover:-translate-y-0.5 sm:p-4 sm:text-base">
            <Artwork seed={`${project.slug}-cat-${i}`} className="ws-soft aspect-square w-full max-w-28" />
            <span className="font-semibold">{name}</span>
            {desc && <span className="ws-muted text-xs leading-snug">{desc}</span>}
          </a>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Flash sale */

function useCountdown(): string {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      const pad = (n: number) => String(n).padStart(2, "0");
      setLeft(`${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

export function DealsSection({ props }: Props) {
  const { products, placed, addToCart } = useSiteRuntime();
  const left = useCountdown();
  const off = Math.min(Math.max(Number(props.percent) || 20, 5), 70);
  const list = products.slice(0, 4);
  if (!list.length) return null;
  return (
    <section className="p-5 sm:p-8" style={{ background: "color-mix(in srgb, var(--accent) 10%, var(--bg))", borderRadius: "calc(var(--r) * 1.5rem)" }}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 className="ws-h flex items-center gap-2 text-xl sm:text-3xl">
          <Flame className="ws-accent size-7" /> {props.title || "Flash sale"}
        </h2>
        <span className="ml-auto inline-flex items-center gap-2 text-sm font-semibold">
          <span className="ws-muted">Kết thúc sau</span>
          <span className="rounded-lg bg-[var(--fg)] px-2.5 py-1 font-mono text-[var(--bg)] tabular-nums">{left || "--:--:--"}</span>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {list.map((p, i) => {
          const sold = 35 + ((i * 17) % 50);
          return (
            <div key={p.id} className="ws-card relative flex flex-col gap-2 p-3">
              <span className="absolute top-3 left-3 z-10 rounded-full bg-[var(--accent-solid)] px-2 py-0.5 text-xs font-bold text-white">-{off}%</span>
              <Artwork seed={`deal-${p.id}`} className="ws-soft aspect-square" />
              <div className="line-clamp-2 text-sm leading-snug font-medium">{p.name}</div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="ws-accent ws-price font-bold">{formatPrice(Math.round((p.price * (100 - off)) / 100 / 1000) * 1000)}</span>
                <span className="ws-muted ws-price text-xs line-through">{formatPrice(p.price)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--fg)_10%,transparent)]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${sold}%` }} />
              </div>
              <span className="ws-muted text-xs">Đã bán {sold}%</span>
              {placed.has("cart") && (
                <button onClick={() => addToCart(p)} className="ws-btn !py-2 text-xs sm:text-sm">
                  Mua ngay
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Cam kết */

const POLICY_ICONS = [Truck, RotateCcw, ShieldCheck, CreditCard];

export function PoliciesSection({ props }: Props) {
  const items = rows(props.items);
  if (!items.length) return null;
  return (
    <section className={`ws-card grid gap-4 p-5 sm:p-6 ${cols(items.length)}`}>
      {items.map(([t, d], i) => (
        <div key={t + i} className="flex items-start gap-3">
          <span className="ws-soft grid size-11 shrink-0 place-items-center">
            {createElement(POLICY_ICONS[i % POLICY_ICONS.length], { className: "ws-accent size-5", strokeWidth: 1.7 })}
          </span>
          <div>
            <div className="font-semibold">{t}</div>
            {d && <div className="ws-muted text-sm leading-snug">{d}</div>}
          </div>
        </div>
      ))}
    </section>
  );
}

/* --------------------------------------------------------------- Đội ngũ */

export function TeamSection({ props }: Props) {
  const items = rows(props.items);
  if (!items.length) return null;
  const initials = (name: string) =>
    name
      .replace(/^(BS|ThS|TS|PGS|GS|ĐD|CKI+|\.|\s)+/g, "")
      .split(/\s+/)
      .filter((w) => w && !/\./.test(w))
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  return (
    <section>
      <Title title={props.title} sub={props.sub} />
      <div className={`grid grid-cols-2 gap-4 ${items.length % 3 === 0 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
        {items.map(([name, role, note], i) => (
          <div key={name + i} className="ws-card flex flex-col items-center gap-3 p-5 text-center">
            <span
              className="ws-h grid size-20 place-items-center rounded-full text-2xl text-white sm:size-24"
              style={{ background: `linear-gradient(${135 + i * 40}deg, var(--accent-solid), color-mix(in srgb, var(--accent-solid) 70%, #000))` }}
            >
              {initials(name)}
            </span>
            <div className="space-y-0.5">
              <div className="leading-snug font-semibold">{name}</div>
              {role && <div className="ws-accent text-sm font-medium">{role}</div>}
              {note && <div className="ws-muted text-xs leading-snug">{note}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Quy trình */

export function StepsSection({ props }: Props) {
  const items = rows(props.items);
  if (!items.length) return null;
  return (
    <section>
      <Title title={props.title} sub={props.sub} />
      <ol className={`grid gap-4 ${cols(items.length)}`}>
        {items.map(([t, d], i) => (
          <li key={t + i} className="ws-card relative p-5">
            <span className="ws-h ws-accent text-4xl opacity-90">{String(i + 1).padStart(2, "0")}</span>
            <div className="mt-2 font-semibold">{t}</div>
            {d && <p className="ws-muted mt-1 text-sm leading-relaxed">{d}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* --------------------------------------------------------------- Bảng gói */

export function PlansSection({ props }: Props) {
  const { placed } = useSiteRuntime();
  const items = rows(props.items);
  if (!items.length) return null;
  const hot = items.length >= 3 ? 1 : -1;
  const target = placed.has("booking") ? "#dat-lich" : placed.has("contact") ? "#lien-he" : "#noi-dung";
  return (
    <section>
      <Title title={props.title} sub={props.sub} />
      <div className={`grid gap-4 ${items.length === 2 ? "md:grid-cols-2" : items.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
        {items.map(([name, price, feats, unit], i) => (
          <div
            key={name + i}
            className={`ws-card relative flex flex-col gap-4 p-6 ${i === hot ? "md:-translate-y-2" : ""}`}
            style={i === hot ? { borderColor: "var(--accent)", boxShadow: "0 12px 40px color-mix(in srgb, var(--accent) 22%, transparent)" } : undefined}
          >
            {i === hot && (
              <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-[var(--accent-solid)] px-3 py-1 text-xs font-bold text-white">
                <Sparkles className="size-3.5" /> Chọn nhiều nhất
              </span>
            )}
            <div className="font-semibold">{name}</div>
            <div className="flex items-baseline gap-1">
              <span className="ws-h ws-price text-3xl">{/^\d+$/.test(price ?? "") ? formatPrice(Number(price)) : price}</span>
              {unit && <span className="ws-muted text-sm">/{unit}</span>}
            </div>
            <ul className="flex-1 space-y-2 text-sm">
              {(feats ?? "")
                .split(";")
                .map((f) => f.trim())
                .filter(Boolean)
                .map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="ws-accent mt-0.5 size-4 shrink-0" /> {f}
                  </li>
                ))}
            </ul>
            <a href={target} className={i === hot ? "ws-btn" : "ws-btn-ghost"}>
              Đăng ký <ArrowRight className="size-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Lịch tuần */

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];

export function ScheduleSection({ props }: Props) {
  const { project } = useSiteRuntime();
  const own = rows(props.items);
  const classes = project.classes?.length ? project.classes : ["Lớp sáng", "Lớp chiều", "Lớp tối"];
  const times = (props.times || "6:00, 18:00, 19:30").split(",").map((t) => t.trim()).filter(Boolean);
  const table = own.length
    ? own.map(([day, list]) => [day, (list ?? "").split(",").map((x) => x.trim()).filter(Boolean)] as const)
    : DAYS.map((d, di) => [d, times.map((_, k) => classes[(di * 2 + k) % classes.length])] as const);
  const today = (new Date().getDay() + 6) % 7;
  return (
    <section>
      <Title title={props.title} sub={props.sub} />
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="grid min-w-[640px] grid-cols-7 gap-2">
          {table.map(([day, list], di) => (
            <div key={day} className="space-y-2">
              <div className={`rounded-lg py-2 text-center text-sm font-bold ${di === today && !own.length ? "bg-[var(--accent-solid)] text-white" : "ws-soft"}`}>{day}</div>
              {list.map((c, k) => (
                <div key={c + k} className="ws-card p-2.5 text-sm">
                  {times[k] && (
                    <div className="ws-muted flex items-center gap-1 text-xs">
                      <Clock className="size-3" /> {times[k]}
                    </div>
                  )}
                  <div className="font-semibold">{c}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Tiến độ */

export function TimelineSection({ props }: Props) {
  const items = rows(props.items);
  if (!items.length) return null;
  const doneUntil = Math.min(Number(props.done) || Math.ceil(items.length / 2), items.length);
  return (
    <section>
      <Title title={props.title} sub={props.sub} />
      <ol className="relative space-y-6 border-l-2 border-[color-mix(in_srgb,var(--fg)_14%,transparent)] pl-6 md:grid md:grid-cols-[repeat(auto-fit,minmax(0,1fr))] md:gap-4 md:space-y-0 md:border-t-2 md:border-l-0 md:pt-6 md:pl-0">
        {items.map(([when, what], i) => (
          <li key={when + i} className="relative">
            <span
              className="absolute -left-[33px] top-1 size-4 rounded-full border-2 md:-top-[33px] md:left-0"
              style={{ background: i < doneUntil ? "var(--accent)" : "var(--bg)", borderColor: "var(--accent)" }}
            />
            <div className="ws-accent text-sm font-bold">{when}</div>
            <div className="mt-1 text-[15px] leading-snug">{what}</div>
            {i < doneUntil && <div className="ws-muted mt-1 text-xs">Đã hoàn thành</div>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* --------------------------------------------------------------- Chi nhánh */

export function LocationsSection({ props }: Props) {
  const { project } = useSiteRuntime();
  const items = rows(props.items);
  if (!items.length) return null;
  return (
    <section>
      <Title title={props.title} sub={props.sub} />
      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div className="ws-soft relative min-h-64 overflow-hidden" aria-hidden>
          {/* Bản đồ minh hoạ: lưới đường phố và ghim theo số chi nhánh */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(color-mix(in srgb, var(--fg) 9%, transparent) 2px, transparent 2px), linear-gradient(90deg, color-mix(in srgb, var(--fg) 9%, transparent) 2px, transparent 2px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div className="absolute inset-x-0 top-1/2 h-6 -rotate-6 bg-[color-mix(in_srgb,var(--card)_80%,transparent)]" />
          {items.slice(0, 5).map((_, i) => (
            <span key={i} className="absolute" style={{ left: `${18 + ((i * 29) % 64)}%`, top: `${20 + ((i * 37) % 55)}%` }}>
              <MapPin className="size-8 drop-shadow" style={{ color: "var(--accent)", fill: "color-mix(in srgb, var(--accent) 25%, transparent)" }} />
            </span>
          ))}
          <span className="absolute bottom-3 left-3 rounded-full bg-[var(--card)] px-3 py-1 text-xs font-semibold shadow">{project.name}</span>
        </div>
        <ul className="space-y-3">
          {items.map(([name, addr, hours, phone], i) => (
            <li key={name + i} className="ws-card p-4">
              <div className="font-semibold">{name}</div>
              {addr && (
                <div className="ws-muted mt-1 flex items-start gap-1.5 text-sm">
                  <MapPin className="mt-0.5 size-4 shrink-0" /> {addr}
                </div>
              )}
              <div className="ws-muted mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {hours && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-4" /> {hours}
                  </span>
                )}
                {phone && (
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="ws-accent inline-flex items-center gap-1.5 font-medium">
                    <Phone className="size-4" /> {phone}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Tin tức */

export function BlogSection({ props }: Props) {
  const items = rows(props.items);
  if (!items.length) return null;
  const today = new Date();
  return (
    <section>
      <Title title={props.title} sub={props.sub} />
      <div className={`grid gap-4 ${items.length % 3 === 0 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}>
        {items.map(([t, d, tag], i) => {
          const day = new Date(today.getTime() - (i * 5 + 2) * 86400000);
          return (
            <article key={t + i} className="ws-card overflow-hidden">
              <Artwork seed={`blog-${t}`} className="aspect-[2/1]" style={{ borderRadius: 0 }} />
              <div className="space-y-2 p-4">
                <div className="ws-muted flex items-center gap-2 text-xs">
                  {tag && <span className="ws-soft px-2 py-0.5 font-semibold">{tag}</span>}
                  {day.toLocaleDateString("vi-VN")}
                </div>
                <h3 className="leading-snug font-semibold">{t}</h3>
                {d && <p className="ws-muted line-clamp-2 text-sm leading-relaxed">{d}</p>}
                <span className="ws-accent inline-flex items-center gap-1 text-sm font-semibold">
                  Đọc tiếp <ArrowRight className="size-4" />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Đối tác */

export function PartnersSection({ props }: Props) {
  const names = rows(props.items).map(([n]) => n);
  if (!names.length) return null;
  return (
    <section className="text-center">
      {props.title && <div className="ws-muted mb-4 text-sm font-semibold tracking-[0.14em] uppercase">{props.title}</div>}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {names.map((n) => (
          <span key={n} className="ws-h inline-flex items-center gap-2 text-lg opacity-60 grayscale transition hover:opacity-100">
            <KindIcon className="size-5" strokeWidth={1.6} /> {n}
          </span>
        ))}
      </div>
    </section>
  );
}
