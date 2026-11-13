import {
  BarChart3,
  Bot,
  Box,
  Briefcase,
  Car,
  Gamepad2,
  GraduationCap,
  Menu,
  Play,
  Rocket,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { DEFAULT_LOOK, getCategory, type Palette, type PreviewKind, type Project } from "@/lib/showcase/catalog";

const HEADING_FONTS = {
  sans: "inherit",
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
};

/** Biến CSS điều khiển bo góc, kiểu nút và font tiêu đề theo giao diện đang chọn. */
function lookVars(project: Project): CSSProperties {
  const look = project.look ?? DEFAULT_LOOK;
  return {
    "--r": String(look.radius),
    "--pill": look.pillButtons ? "999px" : `${0.45 * Math.max(look.radius, 0.3)}em`,
    "--hfont": HEADING_FONTS[look.headingFont],
    "--hweight": String(look.headingWeight),
  } as CSSProperties;
}

/*
 * Bản xem trước thu nhỏ của một mẫu web, vẽ hoàn toàn bằng HTML/CSS (không cần ảnh chụp).
 * Khung dùng container query: 1em bên trong = 1% chiều rộng khung (desktop) hoặc 2.5% (mobile),
 * nên bản xem trước co giãn đúng tỉ lệ ở mọi kích thước thẻ.
 */

export const KIND_ICON: Record<PreviewKind, LucideIcon> = {
  shop: ShoppingBag,
  edu: GraduationCap,
  service: Sparkles,
  landing: Rocket,
  space3d: Box,
  jobs: Briefcase,
  game: Gamepad2,
  ai: Bot,
  auto: Car,
};

function kindOf(project: Project): PreviewKind {
  return getCategory(project.category)?.kind ?? "shop";
}

const bar = (w: string, color: string, h = "0.55em", extra: CSSProperties = {}): CSSProperties => ({
  width: w,
  height: h,
  borderRadius: "var(--pill)",
  background: color,
  ...extra,
});

function Lines({ color, widths, gap = "0.5em", h }: { color: string; widths: string[]; gap?: string; h?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {widths.map((w, i) => (
        <div key={i} style={bar(w, color, h)} />
      ))}
    </div>
  );
}

function Pill({ children, bg, fg, outline }: { children: React.ReactNode; bg: string; fg: string; outline?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.6em 1.3em",
        borderRadius: "var(--pill)",
        fontSize: "0.95em",
        fontWeight: 600,
        background: outline ? "transparent" : bg,
        color: outline ? bg : fg,
        border: `0.12em solid ${bg}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function fade(color: string, alpha: number) {
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}

/* ---------------------------------------------------------------- Desktop */

function DesktopHeader({ project }: { project: Project }) {
  const p = project.palette;
  return (
    <>
      <div style={{ background: p.accent, color: "#fff", textAlign: "center", fontSize: "0.85em", padding: "0.45em 0", fontWeight: 500 }}>
        {project.announcement}
      </div>
      {project.look?.centeredHeader ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8em", padding: "1.4em 4em 1.2em", borderBottom: `0.1em solid ${fade(p.fg, 0.1)}`, marginBottom: "1.6em" }}>
          <span style={{ fontWeight: "var(--hweight)" as CSSProperties["fontWeight"], fontFamily: "var(--hfont)", fontSize: "2em", letterSpacing: "0.04em" }}>{project.name}</span>
          <div style={{ display: "flex", gap: "2.4em", fontSize: "0.85em", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.75 }}>
            {project.nav.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      ) : (
      <div style={{ display: "flex", alignItems: "center", gap: "2.4em", padding: "1.3em 4em" }}>
        <span style={{ fontWeight: 800, fontSize: "1.7em", letterSpacing: "-0.02em", fontFamily: "var(--hfont)" }}>
          {project.name}
          <span style={{ color: p.accent }}>.</span>
        </span>
        <div style={{ display: "flex", gap: "2em", fontSize: "0.95em", opacity: 0.75 }}>
          {project.nav.map((n, i) => (
            <span key={n} style={i === 0 ? { color: p.accent, fontWeight: 700, opacity: 1 } : undefined}>
              {n}
            </span>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1em" }}>
          <Search style={{ width: "1.3em", height: "1.3em", opacity: 0.6 }} />
          <Pill bg={p.accent} fg="#fff">
            {kindOf(project) === "shop" ? "Giỏ hàng" : "Liên hệ"}
          </Pill>
        </div>
      </div>
      )}
    </>
  );
}

function HeroCopy({ project, fg, light }: { project: Project; fg: string; light?: boolean }) {
  const p = project.palette;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.4em", color: fg }}>
      <span style={{ fontSize: "0.8em", letterSpacing: "0.18em", fontWeight: 700, textTransform: "uppercase", opacity: 0.7 }}>
        {getCategory(project.category)?.name}
      </span>
      <div style={{ fontSize: "3.6em", lineHeight: 1.08, fontWeight: "var(--hweight)" as CSSProperties["fontWeight"], letterSpacing: "-0.03em", maxWidth: "11em" , fontFamily: "var(--hfont)" }}>{project.headline}</div>
      <Lines color={fade(fg, 0.25)} widths={["70%", "55%"]} />
      <div style={{ display: "flex", gap: "0.9em" }}>
        <Pill bg={p.accent} fg="#fff">
          {project.nav[0]}
        </Pill>
        <Pill bg={light ? fg : p.accent} fg="#fff" outline>
          Tìm hiểu thêm
        </Pill>
      </div>
    </div>
  );
}

function IconBlob({ icon: Icon, bg, fg, size = "100%" }: { icon: LucideIcon; bg: string; fg: string; size?: string }) {
  return (
    <div style={{ width: size, aspectRatio: "1", borderRadius: "calc(var(--r) * 1.2em)", background: bg, display: "grid", placeItems: "center" }}>
      <Icon style={{ width: "40%", height: "40%", color: fg, strokeWidth: 1.4 }} />
    </div>
  );
}

const PRICES = ["1.290.000đ", "459.000đ", "2.890.000đ", "189.000đ"];

function ProductRow({ project, count = 4 }: { project: Project; count?: number }) {
  const p = project.palette;
  const Icon = KIND_ICON[kindOf(project)];
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${count}, 1fr)`, gap: "1.6em" }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.7em" }}>
          <IconBlob icon={Icon} bg={i % 2 ? p.soft : fade(p.accent, 0.14)} fg={p.accent} />
          <div style={bar("80%", fade(p.fg, 0.7))} />
          <div style={bar("50%", fade(p.fg, 0.2))} />
          <span style={{ fontWeight: 700, color: p.accent, fontSize: "1.05em" }}>{PRICES[i % PRICES.length]}</span>
        </div>
      ))}
    </div>
  );
}

function ShopBody({ project }: { project: Project }) {
  const p = project.palette;
  return (
    <div style={{ padding: "0 4em", display: "flex", flexDirection: "column", gap: "2.6em" }}>
      <div
        style={{
          background: p.hero,
          borderRadius: "calc(var(--r) * 1.6em)",
          padding: "4em",
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          alignItems: "center",
          gap: "3em",
        }}
      >
        <HeroCopy project={project} fg={p.heroFg} light />
        <IconBlob icon={ShoppingBag} bg={fade(p.heroFg, 0.1)} fg={p.heroFg} size="78%" />
      </div>
      <div style={{ fontWeight: 800, fontSize: "1.8em", textAlign: "center" }}>Sản phẩm nổi bật</div>
      <ProductRow project={project} />
    </div>
  );
}

function EduBody({ project }: { project: Project }) {
  const p = project.palette;
  return (
    <div style={{ padding: "0 4em", display: "flex", flexDirection: "column", gap: "2.6em" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "3em", alignItems: "center", paddingTop: "2em" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2em" }}>
          <HeroCopy project={project} fg={p.fg} />
          <div style={{ display: "flex", gap: "2.5em" }}>
            {[
              ["140+", "bài học"],
              ["9.000", "học viên"],
              ["4.9", "đánh giá"],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontWeight: 800, fontSize: "1.8em" }}>{n}</div>
                <div style={{ fontSize: "0.85em", opacity: 0.6 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", background: p.hero, borderRadius: "calc(var(--r) * 1.6em)", aspectRatio: "4/3", display: "grid", placeItems: "center" }}>
          <div style={{ width: "5em", height: "5em", borderRadius: "var(--pill)", background: p.accent, display: "grid", placeItems: "center" }}>
            <Play style={{ width: "2em", height: "2em", color: "#fff", fill: "#fff" }} />
          </div>
          <div style={{ position: "absolute", left: "-1.5em", bottom: "2em", background: p.card ?? "#fff", color: p.fg, borderRadius: "calc(var(--r) * 1em)", padding: "1em 1.4em", boxShadow: "0 0.6em 2em rgba(0,0,0,.12)", fontSize: "0.9em", fontWeight: 700 }}>
            Chuỗi 12 ngày học
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.6em" }}>
        {[0.8, 0.45, 0.2].map((progress, i) => (
          <div key={i} style={{ background: p.card ?? "#fff", borderRadius: "calc(var(--r) * 1.2em)", padding: "1.4em", border: `0.1em solid ${fade(p.fg, 0.08)}`, display: "flex", flexDirection: "column", gap: "0.8em" }}>
            <IconBlob icon={GraduationCap} bg={p.soft} fg={p.accent} size="3.6em" />
            <div style={bar("75%", fade(p.fg, 0.7))} />
            <div style={bar("100%", fade(p.fg, 0.1), "0.5em")}>
              <div style={bar(`${progress * 100}%`, p.accent, "0.5em")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceBody({ project }: { project: Project }) {
  const p = project.palette;
  return (
    <div style={{ padding: "0 4em", display: "flex", flexDirection: "column", gap: "2.6em" }}>
      <div style={{ background: p.hero, borderRadius: "calc(var(--r) * 1.6em)", padding: "4em", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "3em", alignItems: "center" }}>
        <HeroCopy project={project} fg={p.heroFg} />
        <div style={{ background: p.card ?? "#fff", color: p.fg, borderRadius: "calc(var(--r) * 1.3em)", padding: "2em", display: "flex", flexDirection: "column", gap: "1em", boxShadow: "0 1em 3em rgba(0,0,0,.12)" }}>
          <div style={{ fontWeight: 800, fontSize: "1.3em" }}>Nhận báo giá nhanh</div>
          {["Họ tên", "Số điện thoại", "Dịch vụ cần"].map((l) => (
            <div key={l} style={{ border: `0.1em solid ${fade(p.fg, 0.15)}`, borderRadius: "calc(var(--r) * 0.7em)", padding: "0.8em 1em", fontSize: "0.85em", color: fade(p.fg, 0.5) }}>
              {l}
            </div>
          ))}
          <div style={{ background: p.accent, color: "#fff", borderRadius: "calc(var(--r) * 0.7em)", padding: "0.9em", textAlign: "center", fontWeight: 700, fontSize: "0.95em" }}>
            Gửi yêu cầu
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.6em" }}>
        {project.nav.slice(0, 3).map((n) => (
          <div key={n} style={{ display: "flex", gap: "1em", alignItems: "center" }}>
            <IconBlob icon={Sparkles} bg={p.soft} fg={p.accent} size="4em" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5em" }}>
              <span style={{ fontWeight: 700 }}>{n}</span>
              <div style={bar("90%", fade(p.fg, 0.15))} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LandingBody({ project }: { project: Project }) {
  const p = project.palette;
  return (
    <div style={{ padding: "3em 4em 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "2em", textAlign: "center" }}>
      <span style={{ background: p.soft, color: p.accent, borderRadius: "var(--pill)", padding: "0.5em 1.2em", fontSize: "0.85em", fontWeight: 700 }}>Sắp ra mắt</span>
      <div style={{ fontSize: "4.2em", lineHeight: 1.05, fontWeight: "var(--hweight)" as CSSProperties["fontWeight"], letterSpacing: "-0.03em", maxWidth: "12em" , fontFamily: "var(--hfont)" }}>{project.headline}</div>
      <div style={{ display: "flex", gap: "0.8em", width: "34em" }}>
        <div style={{ flex: 1, border: `0.12em solid ${fade(p.fg, 0.15)}`, borderRadius: "var(--pill)", padding: "0.9em 1.4em", textAlign: "left", fontSize: "0.9em", opacity: 0.6, background: p.card ?? "#fff" }}>
          Số điện thoại của bạn
        </div>
        <Pill bg={p.accent} fg="#fff">
          Giữ chỗ
        </Pill>
      </div>
      <div style={{ display: "flex", gap: "3em", alignItems: "flex-end" }}>
        {["12", "08", "45"].map((n, i) => (
          <div key={i} style={{ background: p.card ?? "#fff", borderRadius: "calc(var(--r) * 1em)", padding: "1em 1.6em", boxShadow: "0 0.5em 1.5em rgba(0,0,0,.06)" }}>
            <div style={{ fontWeight: 800, fontSize: "2.2em", color: p.accent }}>{n}</div>
            <div style={{ fontSize: "0.8em", opacity: 0.6 }}>{["ngày", "giờ", "phút"][i]}</div>
          </div>
        ))}
        <div style={{ width: "13em", height: "18em", borderRadius: "calc(var(--r) * 2em) calc(var(--r) * 2em) 0 0", background: p.fg, padding: "0.8em 0.8em 0", order: -1 }}>
          <div style={{ height: "100%", borderRadius: "calc(var(--r) * 1.4em) calc(var(--r) * 1.4em) 0 0", background: p.accent, display: "grid", placeItems: "center" }}>
            <Rocket style={{ width: "4em", height: "4em", color: "#fff" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Space3dBody({ project }: { project: Project }) {
  const p = project.palette;
  return (
    <div style={{ position: "relative", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "-30%",
          right: "-30%",
          top: "35%",
          height: "120%",
          transform: "perspective(40em) rotateX(62deg)",
          backgroundImage: `linear-gradient(${fade(p.accent, 0.35)} 0.08em, transparent 0.08em), linear-gradient(90deg, ${fade(p.accent, 0.35)} 0.08em, transparent 0.08em)`,
          backgroundSize: "4em 4em",
        }}
      />
      <div style={{ position: "absolute", left: "4em", top: "3em", maxWidth: "34em", display: "flex", flexDirection: "column", gap: "1.4em" }}>
        <div style={{ fontSize: "3.6em", lineHeight: 1.08, fontWeight: "var(--hweight)" as CSSProperties["fontWeight"], letterSpacing: "-0.03em" , fontFamily: "var(--hfont)" }}>{project.headline}</div>
        <div style={{ display: "flex", gap: "0.8em" }}>
          <Pill bg={p.accent} fg={p.bg}>
            Bắt đầu tham quan
          </Pill>
        </div>
      </div>
      {[
        { l: "52%", t: "30%", w: 16, h: 10, c: p.accent },
        { l: "72%", t: "42%", w: 11, h: 14, c: "#818cf8" },
        { l: "60%", t: "58%", w: 14, h: 6, c: "#f472b6" },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.l,
            top: b.t,
            width: `${b.w}em`,
            height: `${b.h}em`,
            transform: "skewY(-12deg)",
            borderRadius: "calc(var(--r) * 0.6em)",
            background: `linear-gradient(160deg, ${fade(b.c, 0.85)}, ${fade(b.c, 0.25)})`,
            boxShadow: `0 1.5em 3em ${fade(b.c, 0.35)}`,
          }}
        />
      ))}
      <div style={{ position: "absolute", left: "70%", top: "24%", background: "#fff", color: "#0f172a", borderRadius: "calc(var(--r) * 0.8em)", padding: "0.7em 1em", fontSize: "0.85em", fontWeight: 700 }}>
        Phòng khách · 32m²
      </div>
    </div>
  );
}

function JobsBody({ project }: { project: Project }) {
  const p = project.palette;
  return (
    <div style={{ padding: "0 4em", display: "flex", flexDirection: "column", gap: "2em" }}>
      <div style={{ background: p.hero, color: p.heroFg, borderRadius: "calc(var(--r) * 1.6em)", padding: "3.4em 4em", display: "flex", flexDirection: "column", gap: "1.6em" }}>
        <div style={{ fontSize: "3.2em", fontWeight: "var(--hweight)" as CSSProperties["fontWeight"], letterSpacing: "-0.03em" , fontFamily: "var(--hfont)" }}>{project.headline}</div>
        <div style={{ display: "flex", background: p.card ?? "#fff", borderRadius: "var(--pill)", padding: "0.5em", gap: "0.5em", color: fade(p.fg, 0.6), fontSize: "0.95em" }}>
          {["Vị trí, kỹ năng", "Khu vực", "Mức lương"].map((l) => (
            <div key={l} style={{ flex: 1, padding: "0.6em 1.2em", borderRight: "0.1em solid #eee" }}>
              {l}
            </div>
          ))}
          <Pill bg={p.accent} fg="#fff">
            Tìm việc
          </Pill>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
        {["15 - 25 triệu", "12 - 18 triệu", "Thoả thuận"].map((salary, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "1.4em", background: p.card ?? "#fff", borderRadius: "calc(var(--r) * 1em)", padding: "1.2em 1.6em", border: `0.1em solid ${fade(p.fg, 0.08)}` }}>
            <IconBlob icon={Briefcase} bg={p.soft} fg={p.accent} size="3.4em" />
            <div style={{ flex: 1 }}>
              <Lines color={fade(p.fg, 0.6)} widths={["40%"]} />
              <div style={{ display: "flex", gap: "0.5em", marginTop: "0.7em" }}>
                {["Hà Nội", "Toàn thời gian"].map((t) => (
                  <span key={t} style={{ fontSize: "0.75em", background: fade(p.fg, 0.06), borderRadius: "var(--pill)", padding: "0.3em 0.9em" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <span style={{ fontWeight: 700, color: p.accent }}>{salary}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const WORD = ["Đ", "Ồ", "N", "G", "H", "Ồ", "M", "Ặ", "T", "T", "R", "Ờ", "I", "S", "A", "O", "B", "I", "Ể", "N", "G", "I", "Ó", "C", "Â"];

function GameBody({ project }: { project: Project }) {
  const p = project.palette;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 22em", gap: "3em", padding: "2em 4em", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.6em" }}>
        <div style={{ fontSize: "2.4em", fontWeight: "var(--hweight)" as CSSProperties["fontWeight"] , fontFamily: "var(--hfont)" }}>{project.headline}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 4.6em)", gap: "0.6em" }}>
          {WORD.map((ch, i) => {
            const state = [0, 1, 2, 3, 6, 12, 18, 24].includes(i) ? "hit" : [8, 14].includes(i) ? "near" : "idle";
            return (
              <div
                key={i}
                style={{
                  height: "4.6em",
                  borderRadius: "calc(var(--r) * 0.6em)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: "1em",
                  background: state === "hit" ? p.accent : state === "near" ? "#52525b" : p.soft,
                  color: state === "hit" ? "#18181b" : p.fg,
                }}
              >
                <span style={{ fontSize: "1.8em" }}>{ch}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: p.soft, borderRadius: "calc(var(--r) * 1.2em)", padding: "1.6em", display: "flex", flexDirection: "column", gap: "1em" }}>
        <div style={{ fontWeight: 800, fontSize: "1.2em" }}>Xếp hạng hôm nay</div>
        {["Minh", "Lan", "Huy", "Thảo", "Quân"].map((n, i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: "0.8em", fontSize: "0.95em" }}>
            <span style={{ width: "1.6em", color: i === 0 ? p.accent : undefined, fontWeight: 800 }}>{i + 1}</span>
            <span style={{ flex: 1 }}>{n}</span>
            <span style={{ opacity: 0.6 }}>{[3, 4, 4, 5, 6][i]} lượt</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiBody({ project }: { project: Project }) {
  const p = project.palette;
  const bars = [40, 55, 48, 70, 62, 85, 78, 92, 66, 74, 88, 96];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "16em 1fr", height: "100%" }}>
      <div style={{ background: p.hero, color: p.heroFg, padding: "2em 1.6em", display: "flex", flexDirection: "column", gap: "1.2em" }}>
        {project.nav.map((n, i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: "0.8em", padding: "0.7em 1em", borderRadius: "calc(var(--r) * 0.7em)", background: i === 0 ? fade(p.heroFg, 0.12) : undefined, fontSize: "0.95em" }}>
            <BarChart3 style={{ width: "1.2em", height: "1.2em" }} /> {n}
          </div>
        ))}
      </div>
      <div style={{ padding: "2em 3em", display: "flex", flexDirection: "column", gap: "1.8em" }}>
        <div style={{ fontWeight: "var(--hweight)" as CSSProperties["fontWeight"], fontSize: "2em" , fontFamily: "var(--hfont)" }}>{project.headline}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.2em" }}>
          {[
            ["128,4tr", "+12%"],
            ["1.204", "+8%"],
            ["3,2%", "+0,4"],
          ].map(([v, d]) => (
            <div key={v} style={{ background: p.card ?? "#fff", borderRadius: "calc(var(--r) * 1em)", padding: "1.2em 1.4em", border: `0.1em solid ${fade(p.fg, 0.08)}` }}>
              <div style={bar("50%", fade(p.fg, 0.2))} />
              <div style={{ fontWeight: 800, fontSize: "1.9em", marginTop: "0.5em" }}>{v}</div>
              <div style={{ color: "#16a34a", fontSize: "0.85em", fontWeight: 700 }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.2em" }}>
          <div style={{ background: p.card ?? "#fff", borderRadius: "calc(var(--r) * 1em)", padding: "1.6em", border: `0.1em solid ${fade(p.fg, 0.08)}`, display: "flex", alignItems: "flex-end", gap: "0.7em", height: "16em" }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "calc(var(--r) * 0.4em) calc(var(--r) * 0.4em) 0 0", background: i === bars.length - 1 ? p.accent : fade(p.accent, 0.3) }} />
            ))}
          </div>
          <div style={{ background: p.soft, borderRadius: "calc(var(--r) * 1em)", padding: "1.6em", display: "flex", flexDirection: "column", gap: "0.9em" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6em", fontWeight: 800, color: p.accent }}>
              <Bot style={{ width: "1.4em", height: "1.4em" }} /> Trợ lý AI
            </div>
            <div style={{ fontSize: "0.9em", lineHeight: 1.5 }}>{project.announcement.replace("AI: ", "")}.</div>
            <Lines color={fade(p.fg, 0.15)} widths={["90%", "75%", "60%"]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoBody({ project }: { project: Project }) {
  const p = project.palette;
  return (
    <div style={{ padding: "0 4em", display: "flex", flexDirection: "column", gap: "2.4em" }}>
      <div style={{ background: `radial-gradient(circle at 70% 70%, ${fade(p.accent, 0.35)}, ${p.hero} 60%)`, color: p.heroFg, borderRadius: "calc(var(--r) * 1.6em)", padding: "4em", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: "2em" }}>
        <HeroCopy project={project} fg={p.heroFg} light />
        <Car style={{ width: "100%", height: "auto", color: p.heroFg, strokeWidth: 0.9 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.6em" }}>
        {[
          ["Sedan", "từ 559 triệu"],
          ["SUV 7 chỗ", "từ 899 triệu"],
          ["Điện", "từ 690 triệu"],
        ].map(([n, price]) => (
          <div key={n} style={{ background: p.card ?? "#fff", borderRadius: "calc(var(--r) * 1.2em)", padding: "1.4em", display: "flex", flexDirection: "column", gap: "0.6em" }}>
            <div style={{ background: p.soft, borderRadius: "calc(var(--r) * 0.9em)", aspectRatio: "16/8", display: "grid", placeItems: "center" }}>
              <Car style={{ width: "50%", height: "auto", color: p.fg, strokeWidth: 1 }} />
            </div>
            <span style={{ fontWeight: 700 }}>{n}</span>
            <span style={{ color: p.accent, fontWeight: 700, fontSize: "0.95em" }}>{price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const DESKTOP_BODY: Record<PreviewKind, (props: { project: Project }) => React.ReactNode> = {
  shop: ShopBody,
  edu: EduBody,
  service: ServiceBody,
  landing: LandingBody,
  space3d: Space3dBody,
  jobs: JobsBody,
  game: GameBody,
  ai: AiBody,
  auto: AutoBody,
};

/** Khung trình duyệt desktop, tỉ lệ 16:10. */
export function DesktopPreview({ project, className = "" }: { project: Project; className?: string }) {
  const p = project.palette;
  const kind = kindOf(project);
  const Body = DESKTOP_BODY[kind];
  const ownHeader = kind !== "ai";
  return (
    <div className={`@container overflow-hidden ${className}`} aria-hidden>
      <div
        style={{ ...lookVars(project), fontSize: "1cqw", background: p.bg, color: p.fg, aspectRatio: "16 / 10", display: "flex", flexDirection: "column", overflow: "hidden", lineHeight: 1.3 }}
      >
        {ownHeader ? <DesktopHeader project={project} /> : <MiniBrowserBar palette={p} name={project.name} />}
        <div style={{ flex: 1, minHeight: 0 }}>
          <Body project={project} />
        </div>
      </div>
    </div>
  );
}

function MiniBrowserBar({ palette, name }: { palette: Palette; name: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1em", padding: "1em 2em", borderBottom: `0.1em solid ${fade(palette.fg, 0.08)}` }}>
      <span style={{ fontWeight: 800, fontSize: "1.5em" }}>
        {name}
        <span style={{ color: palette.accent }}>.</span>
      </span>
      <div style={{ marginLeft: "auto", width: "18em", ...bar("18em", fade(palette.fg, 0.06), "2.2em") }} />
      <div style={{ width: "2.4em", height: "2.4em", borderRadius: "var(--pill)", background: palette.accent }} />
    </div>
  );
}

/* ----------------------------------------------------------------- Mobile */

/** Khung điện thoại, 1em = 2.5% chiều rộng. */
export function MobilePreview({ project, className = "" }: { project: Project; className?: string }) {
  const p = project.palette;
  const kind = kindOf(project);
  const Icon = KIND_ICON[kind];
  const dark = kind === "space3d" || kind === "game";
  const heroBg = dark ? p.soft : p.hero;
  const heroFg = dark ? p.fg : p.heroFg;
  return (
    <div className={`@container overflow-hidden ${className}`} aria-hidden>
      <div style={{ ...lookVars(project), fontSize: "2.5cqw", background: p.bg, color: p.fg, aspectRatio: "9 / 17", display: "flex", flexDirection: "column", overflow: "hidden", lineHeight: 1.3 }}>
        <div style={{ background: p.accent, color: "#fff", textAlign: "center", fontSize: "0.85em", padding: "0.5em 1em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {project.announcement}
        </div>
        <div style={{ display: "flex", alignItems: "center", padding: "1.2em 1.6em" }}>
          <Menu style={{ width: "1.8em", height: "1.8em" }} />
          <span style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: "1.6em" }}>
            {project.name}
            <span style={{ color: p.accent }}>.</span>
          </span>
          <Search style={{ width: "1.6em", height: "1.6em" }} />
        </div>
        <div style={{ margin: "0 1.4em", background: heroBg, color: heroFg, borderRadius: "calc(var(--r) * 1.6em)", padding: "2.4em 1.8em", display: "flex", flexDirection: "column", gap: "1.2em" }}>
          <span style={{ fontSize: "0.75em", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, opacity: 0.7 }}>{getCategory(project.category)?.name}</span>
          <div style={{ fontSize: "2.5em", lineHeight: 1.1, fontWeight: "var(--hweight)" as CSSProperties["fontWeight"], letterSpacing: "-0.02em" , fontFamily: "var(--hfont)" }}>{project.headline}</div>
          <Lines color={fade(heroFg, 0.25)} widths={["90%", "65%"]} />
          <div>
            <Pill bg={p.accent} fg={dark ? p.bg : "#fff"}>
              {project.nav[0]}
            </Pill>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2em", padding: "1.6em 1.4em" }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.6em" }}>
              <IconBlob icon={Icon} bg={i % 2 ? p.soft : fade(p.accent, 0.14)} fg={p.accent} />
              <div style={bar("80%", fade(p.fg, 0.6))} />
              <div style={{ display: "flex", alignItems: "center", gap: "0.3em", fontSize: "0.85em", color: p.accent, fontWeight: 700 }}>
                {kind === "shop" ? PRICES[i] : (
                  <>
                    <Star style={{ width: "1em", height: "1em", fill: "currentColor" }} /> 4.{9 - i}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
