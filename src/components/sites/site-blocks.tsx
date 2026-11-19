"use client";

import { CalendarDays, Check, Copy, LogOut, Minus, Plus, Search, ShoppingCart, Star, Trash2, User, X } from "lucide-react";
import { useState } from "react";
import { getBackend } from "@/lib/sites/backend";
import type { ComponentType } from "@/lib/sites/components";
import { formatPrice } from "@/lib/sites/products";
import { safeImageUrl, type PlacedComponent, type Submission } from "@/lib/sites/types";
import { Artwork } from "./site-art";
import { useSiteRuntime } from "./site-runtime";
import { AboutSection, CtaSection, FaqSection, FeaturesSection, GallerySection, HeroSection, StatsSection } from "./site-sections";

/* ------------------------------------------------------------------ Gửi form */

type SendState = "idle" | "sending" | "done" | "error";

function useSubmit() {
  const { siteId, editing } = useSiteRuntime();
  const [state, setState] = useState<SendState>("idle");
  const [error, setError] = useState("");
  const send = async (s: Omit<Submission, "id" | "createdAt">) => {
    if (editing) {
      setError("Đang ở chế độ chỉnh sửa nên form không gửi thật.");
      setState("error");
      return false;
    }
    setState("sending");
    setError("");
    try {
      await getBackend().addSubmission(siteId, s);
      setState("done");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi không được, vui lòng thử lại.");
      setState("error");
      return false;
    }
  };
  return { state, error, send, reset: () => setState("idle") };
}

function formData(e: React.FormEvent<HTMLFormElement>): Record<string, string> {
  return Object.fromEntries([...new FormData(e.currentTarget).entries()].map(([k, v]) => [k, String(v).trim()]));
}

function Done({ text, onAgain, againLabel = "Gửi thêm" }: { text: string; onAgain?: () => void; againLabel?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-[var(--accent)] text-white">
        <Check className="size-6" />
      </span>
      <p className="font-semibold">{text}</p>
      {onAgain && (
        <button type="button" onClick={onAgain} className="ws-muted text-sm underline">
          {againLabel}
        </button>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="ws-h mb-6 text-2xl sm:text-3xl">{children}</h2>;
}

/* ----------------------------------------------------------------- Đầu trang */

export function HeaderLogin() {
  const { user, setLoginOpen } = useSiteRuntime();
  const [menu, setMenu] = useState(false);
  if (!user) {
    return (
      <button onClick={() => setLoginOpen(true)} className="ws-btn-ghost text-sm">
        <User className="size-4" /> <span className="hidden sm:inline">Đăng nhập</span>
      </button>
    );
  }
  return (
    <div className="relative">
      <button onClick={() => setMenu((m) => !m)} className="ws-btn-ghost max-w-44 text-sm">
        <User className="size-4 shrink-0" /> <span className="truncate">{user.name}</span>
      </button>
      {menu && (
        <div className="ws-card absolute top-12 right-0 z-30 w-52 p-2 shadow-xl">
          <div className="ws-muted truncate px-3 py-2 text-xs">{user.email}</div>
          <button
            onClick={() => {
              setMenu(false);
              void getBackend().signOut();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--soft)]"
          >
            <LogOut className="size-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export function HeaderCart() {
  const { cart, setCartOpen } = useSiteRuntime();
  const count = cart.reduce((n, l) => n + l.qty, 0);
  return (
    <button onClick={() => setCartOpen(true)} className="ws-btn relative !px-3.5 text-sm" aria-label={`Giỏ hàng, ${count} sản phẩm`}>
      <ShoppingCart className="size-4" />
      <span className="hidden sm:inline">Giỏ hàng</span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center rounded-full bg-[var(--fg)] px-1 text-[11px] font-bold text-[var(--bg)]">{count}</span>
      )}
    </button>
  );
}

export function HeaderSearch() {
  const { products, placed, addToCart } = useSiteRuntime();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();
  const results = q.trim() ? products.filter((p) => norm(p.name).includes(norm(q.trim()))) : [];
  return (
    <div className="relative">
      <label className="ws-input flex !w-40 items-center gap-2 !py-2 text-sm sm:!w-56">
        <Search className="ws-muted size-4 shrink-0" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Tìm kiếm..."
          className="w-full bg-transparent outline-none"
          aria-label="Tìm kiếm"
        />
      </label>
      {open && q.trim() && (
        <div className="ws-card absolute top-12 right-0 z-30 w-72 p-2 shadow-xl">
          {results.length === 0 && <div className="ws-muted px-3 py-3 text-sm">Không tìm thấy “{q}”.</div>}
          {results.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--soft)]">
              <span className="flex-1">{p.name}</span>
              <span className="ws-accent font-semibold">{formatPrice(p.price)}</span>
              {placed.has("cart") && (
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => addToCart(p)} className="ws-btn !p-1.5" aria-label={`Thêm ${p.name} vào giỏ`}>
                  <Plus className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Khuyến mãi */

export function PromoBar({ props }: { props: Record<string, string> }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(props.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt không cho copy: khách vẫn đọc được mã.
    }
  };
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-[var(--fg)] px-4 py-2.5 text-center text-sm text-[var(--bg)]">
      <span className="font-medium">{props.text}</span>
      {props.code && (
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-current px-3 py-0.5 font-mono text-xs font-bold tracking-wider">
          {props.code} {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- Khối nội dung */

export function ProductsSection({ props }: { props: Record<string, string> }) {
  const { products, placed, addToCart } = useSiteRuntime();
  const hasCart = placed.has("cart");
  // Số cột trên máy tính theo số sản phẩm để hàng cuối không bị trống nhiều.
  const n = products.length;
  const lgCols = n <= 4 || (n % 4 === 0 && n % 6 !== 0) ? "lg:grid-cols-4" : n % 5 === 0 ? "lg:grid-cols-5" : "lg:grid-cols-6";
  return (
    <section id="san-pham">
      <SectionTitle>{props.title}</SectionTitle>
      <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${lgCols}`}>
        {products.map((p, i) => (
          <div key={p.id} className="ws-card flex flex-col gap-2 p-3">
            {safeImageUrl(p.image) ? (
              // eslint-disable-next-line @next/next/no-img-element -- ảnh do admin dán link, không qua next/image
              <img src={safeImageUrl(p.image)} alt={p.name} loading="lazy" className="ws-soft aspect-square w-full object-cover" />
            ) : (
              <Artwork seed={`${p.id}-${i}`} className="ws-soft aspect-square" />
            )}
            <div className="text-sm leading-snug font-medium">{p.name}</div>
            {p.description && <div className="ws-muted line-clamp-2 text-xs leading-relaxed">{p.description}</div>}
            <div className="ws-accent mt-auto font-bold">{formatPrice(p.price)}</div>
            {hasCart ? (
              <button onClick={() => addToCart(p)} className="ws-btn !px-3 !py-2 text-xs whitespace-nowrap sm:text-sm">
                <Plus className="size-4" /> Thêm vào giỏ
              </button>
            ) : (
              <a href={placed.has("contact") ? "#lien-he" : placed.has("booking") ? "#dat-lich" : undefined} className="ws-btn-ghost !py-2 text-center text-sm">
                Liên hệ
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function BookingSection({ props }: { props: Record<string, string> }) {
  const { products, project } = useSiteRuntime();
  const { state, error, send, reset } = useSubmit();
  const services = [...project.nav, ...products.map((p) => p.name)];
  const today = new Date().toISOString().slice(0, 10);
  return (
    <section id="dat-lich" className="ws-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-[var(--soft)]">
          <CalendarDays className="ws-accent size-6" />
        </span>
        <h2 className="ws-h text-2xl sm:text-3xl">{props.title}</h2>
        <p className="ws-muted">Chọn dịch vụ và thời gian phù hợp, chúng tôi gọi lại xác nhận trong 15 phút.</p>
      </div>
      {state === "done" ? (
        <Done text="Đã nhận lịch hẹn. Chúng tôi sẽ gọi xác nhận sớm." onAgain={reset} />
      ) : (
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            if (await send({ kind: "booking", data: formData(e) })) form.reset();
          }}
        >
          <input name="name" required placeholder="Họ tên" className="ws-input" />
          <input name="phone" required type="tel" pattern="[0-9 +.]{8,}" placeholder="Số điện thoại" className="ws-input" />
          <select name="service" className="ws-input sm:col-span-2" defaultValue={services[0]}>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input name="date" required type="date" min={today} className="ws-input" />
          <input name="time" required type="time" className="ws-input" />
          {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
          <button disabled={state === "sending"} className="ws-btn sm:col-span-2">
            {state === "sending" ? "Đang gửi..." : "Đặt lịch"}
          </button>
        </form>
      )}
    </section>
  );
}

export function ContactSection({ props }: { props: Record<string, string> }) {
  const { state, error, send, reset } = useSubmit();
  return (
    <section id="lien-he" className="ws-card p-6 sm:p-8">
      <SectionTitle>{props.title}</SectionTitle>
      {state === "done" ? (
        <Done text="Cảm ơn bạn, chúng tôi sẽ liên hệ lại sớm." onAgain={reset} />
      ) : (
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            if (await send({ kind: "contact", data: formData(e) })) form.reset();
          }}
        >
          <input name="name" required placeholder="Họ tên" className="ws-input" />
          <input name="phone" required type="tel" pattern="[0-9 +.]{8,}" placeholder="Số điện thoại" className="ws-input" />
          <textarea name="message" rows={3} placeholder="Bạn cần tư vấn gì?" className="ws-input sm:col-span-2" />
          {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
          <button disabled={state === "sending"} className="ws-btn sm:col-span-2 sm:justify-self-start">
            {state === "sending" ? "Đang gửi..." : "Gửi liên hệ"}
          </button>
        </form>
      )}
    </section>
  );
}

const REVIEWS = [
  { name: "Chị Lan", text: "Đặt lần đầu mà rất hài lòng, tư vấn nhiệt tình và giao đúng hẹn.", stars: 5 },
  { name: "Anh Minh", text: "Giá rõ ràng, thao tác trên web nhanh, sẽ quay lại lần sau.", stars: 5 },
  { name: "Bạn Thảo", text: "Chất lượng ổn, hỗ trợ đổi trả nhanh gọn. Cho 4 sao vì hơi đông khách.", stars: 4 },
];

export function ReviewsSection({ props }: { props: Record<string, string> }) {
  return (
    <section>
      <SectionTitle>{props.title}</SectionTitle>
      <div className="grid gap-4 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <figure key={r.name} className="ws-card flex flex-col gap-3 p-5">
            <div className="ws-accent flex gap-0.5" aria-label={`${r.stars} sao`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-4" fill={i < r.stars ? "currentColor" : "none"} />
              ))}
            </div>
            <blockquote className="leading-relaxed">“{r.text}”</blockquote>
            <figcaption className="ws-muted mt-auto text-sm font-medium">{r.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function NewsletterSection({ props }: { props: Record<string, string> }) {
  const { state, error, send } = useSubmit();
  return (
    <section className="ws-soft flex flex-col items-center gap-4 p-6 text-center sm:p-8">
      <h2 className="ws-h text-xl sm:text-2xl">{props.title}</h2>
      {state === "done" ? (
        <p className="ws-accent font-semibold">Đã đăng ký, cảm ơn bạn!</p>
      ) : (
        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await send({ kind: "newsletter", data: formData(e) });
          }}
        >
          <input name="email" type="email" required placeholder="Email của bạn" className="ws-input" />
          <button disabled={state === "sending"} className="ws-btn shrink-0">
            Đăng ký
          </button>
        </form>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </section>
  );
}

/* ------------------------------------------------------------------ Nút nổi */

export function ZaloButton({ props }: { props: Record<string, string> }) {
  const phone = (props.phone ?? "").replace(/\D/g, "");
  return (
    <a
      href={phone ? `https://zalo.me/${phone}` : undefined}
      target="_blank"
      rel="noreferrer"
      className="flex size-14 items-center justify-center rounded-full bg-[#0068ff] text-sm font-bold text-white shadow-xl shadow-black/20 transition hover:scale-105"
      aria-label="Chat Zalo"
    >
      Zalo
    </a>
  );
}

/* ------------------------------------------------------- Ngăn giỏ, đăng nhập */

export function CartDrawer() {
  const { cart, setQty, clearCart, cartOpen, setCartOpen, user } = useSiteRuntime();
  const { state, error, send, reset } = useSubmit();
  const total = cart.reduce((s, l) => s + l.price * l.qty, 0);
  if (!cartOpen) return null;
  return (
    <div className="fixed inset-0 z-[65] flex justify-end bg-black/40" onClick={() => setCartOpen(false)}>
      <aside className="flex h-full w-full max-w-md flex-col bg-[var(--bg)] text-[var(--fg)] shadow-2xl" onClick={(e) => e.stopPropagation()} aria-label="Giỏ hàng">
        <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--fg)_10%,transparent)] px-5 py-4">
          <h2 className="ws-h text-xl">Giỏ hàng</h2>
          <button onClick={() => setCartOpen(false)} className="rounded-full p-2 hover:bg-[var(--soft)]" aria-label="Đóng">
            <X className="size-5" />
          </button>
        </div>
        {state === "done" ? (
          <div className="flex-1 p-6">
            <Done text="Đặt hàng thành công! Chúng tôi sẽ gọi xác nhận đơn." againLabel="Tiếp tục mua" onAgain={() => { reset(); setCartOpen(false); }} />
          </div>
        ) : cart.length === 0 ? (
          <div className="ws-muted flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingCart className="size-10" />
            Giỏ hàng đang trống.
          </div>
        ) : (
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <ul className="space-y-3">
              {cart.map((l) => (
                <li key={l.id} className="ws-card flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{l.name}</div>
                    <div className="ws-accent text-sm font-semibold">{formatPrice(l.price)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setQty(l.id, l.qty - 1)} className="rounded-full p-1.5 hover:bg-[var(--soft)]" aria-label="Bớt">
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                    <button onClick={() => setQty(l.id, l.qty + 1)} className="rounded-full p-1.5 hover:bg-[var(--soft)]" aria-label="Thêm">
                      <Plus className="size-3.5" />
                    </button>
                    <button onClick={() => setQty(l.id, 0)} className="ws-muted rounded-full p-1.5 hover:bg-[var(--soft)]" aria-label="Xoá">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between text-lg">
              <span>Tạm tính</span>
              <span className="ws-accent font-bold">{formatPrice(total)}</span>
            </div>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await send({ kind: "order", data: { ...formData(e), payment: "COD", account: user?.email ?? "" }, items: cart.map(({ name, price, qty }) => ({ name, price, qty })), total });
                if (ok) clearCart();
              }}
            >
              <h3 className="font-semibold">Thông tin giao hàng (thanh toán khi nhận hàng)</h3>
              <input name="name" required defaultValue={user?.name ?? ""} placeholder="Họ tên" className="ws-input" />
              <input name="phone" required type="tel" pattern="[0-9 +.]{8,}" placeholder="Số điện thoại" className="ws-input" />
              <input name="address" required placeholder="Địa chỉ nhận hàng" className="ws-input" />
              <textarea name="note" rows={2} placeholder="Ghi chú (không bắt buộc)" className="ws-input" />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button disabled={state === "sending"} className="ws-btn w-full">
                {state === "sending" ? "Đang đặt hàng..." : `Đặt hàng · ${formatPrice(total)}`}
              </button>
            </form>
          </div>
        )}
      </aside>
    </div>
  );
}

export function LoginModal() {
  const { loginOpen, setLoginOpen } = useSiteRuntime();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!loginOpen) return null;
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = formData(e);
    setBusy(true);
    setError("");
    try {
      if (tab === "login") await getBackend().signIn(d.email, d.password);
      else await getBackend().register(d.email, d.password, d.name);
      setLoginOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi, vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };
  const tabCls = (on: boolean) => `flex-1 rounded-full py-2 text-sm font-semibold ${on ? "bg-[var(--card)] shadow" : "ws-muted"}`;
  return (
    <div className="fixed inset-0 z-[65] grid place-items-center bg-black/40 p-4" onClick={() => setLoginOpen(false)}>
      <div className="w-full max-w-sm space-y-4 rounded-[calc(var(--r)*1.5rem)] bg-[var(--bg)] p-6 text-[var(--fg)] shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Đăng nhập">
        <div className="flex items-center justify-between">
          <h2 className="ws-h text-xl">{tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h2>
          <button onClick={() => setLoginOpen(false)} className="rounded-full p-2 hover:bg-[var(--soft)]" aria-label="Đóng">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex gap-1 rounded-full bg-[var(--soft)] p-1">
          <button className={tabCls(tab === "login")} onClick={() => setTab("login")}>
            Đăng nhập
          </button>
          <button className={tabCls(tab === "register")} onClick={() => setTab("register")}>
            Đăng ký
          </button>
        </div>
        <form className="space-y-3" onSubmit={submit}>
          {tab === "register" && <input name="name" required placeholder="Họ tên" className="ws-input" />}
          <input name="email" type="email" required placeholder="Email" autoComplete="email" className="ws-input" />
          <input name="password" type="password" required minLength={6} placeholder="Mật khẩu" autoComplete={tab === "login" ? "current-password" : "new-password"} className="ws-input" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button disabled={busy} className="ws-btn w-full">
            {busy ? "Đang xử lý..." : tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Bảng tra cứu */

export function renderBlock(c: PlacedComponent): React.ReactNode {
  const map: Record<ComponentType, React.ReactNode> = {
    hero: <HeroSection />,
    features: <FeaturesSection props={c.props} />,
    about: <AboutSection props={c.props} />,
    stats: <StatsSection props={c.props} />,
    gallery: <GallerySection props={c.props} />,
    cta: <CtaSection props={c.props} />,
    faq: <FaqSection props={c.props} />,
    login: <HeaderLogin />,
    cart: <HeaderCart />,
    search: <HeaderSearch />,
    promo: <PromoBar props={c.props} />,
    products: <ProductsSection props={c.props} />,
    booking: <BookingSection props={c.props} />,
    contact: <ContactSection props={c.props} />,
    reviews: <ReviewsSection props={c.props} />,
    newsletter: <NewsletterSection props={c.props} />,
    zalo: <ZaloButton props={c.props} />,
  };
  return map[c.type];
}
