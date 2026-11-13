import { COMPONENTS, getComponentDef, REGIONS, type ComponentType, type RegionId } from "./components";

/** Một component đã gắn vào trang, với nội dung riêng do admin nhập. */
export interface PlacedComponent {
  uid: string;
  type: ComponentType;
  props: Record<string, string>;
  /** Khối có sẵn trong mẫu hoặc đã tính trong giá mẫu: không cộng phí mua thêm */
  included?: boolean;
  /** Admin ẩn tạm: vẫn giữ chỗ và nội dung, khách không thấy */
  hidden?: boolean;
}

export type SiteRegions = Record<RegionId, PlacedComponent[]>;

/** Sản phẩm / dịch vụ thật do admin nhập cho web của khách. */
export interface SiteProduct {
  id: string;
  name: string;
  price: number;
  /** Link ảnh (https://...), để trống thì hiện biểu tượng theo lĩnh vực */
  image?: string;
  description?: string;
}

/** Chữ trên banner đầu trang, ghi đè chữ mặc định của mẫu. */
export interface SiteHeroText {
  headline?: string;
  subtitle?: string;
  announcement?: string;
}

/** Web của một khách hàng: dựng từ một mẫu + giao diện, cộng các component mua thêm. */
export interface CustomerSite {
  id: string;
  /** Tên hiển thị trên web (mặc định tên mẫu) */
  name: string;
  /** Tên khách hàng, chỉ admin thấy */
  customer: string;
  /** slug mẫu trong catalog */
  template: string;
  /** id giao diện (variantsOf) */
  variant: string;
  regions: SiteRegions;
  /** Sản phẩm thật; rỗng thì dùng sản phẩm mẫu theo lĩnh vực */
  products?: SiteProduct[];
  hero?: SiteHeroText;
  /** 2 = phần thân mẫu đã tách thành các khối trong vùng Nội dung */
  layout?: number;
  createdAt: number;
  updatedAt: number;
  updatedBy?: string;
}

/** Đơn hàng, yêu cầu đặt lịch, liên hệ... khách gửi từ web. */
export interface Submission {
  id: string;
  kind: "order" | "booking" | "contact" | "newsletter";
  data: Record<string, string>;
  items?: { name: string; price: number; qty: number }[];
  total?: number;
  createdAt: number;
}

export function emptyRegions(): SiteRegions {
  return Object.fromEntries(REGIONS.map((r) => [r.id, []])) as unknown as SiteRegions;
}

/** Sửa dữ liệu đọc về (thiếu vùng, component lạ) để trang luôn hiển thị được. */
export function normalizeRegions(raw: unknown): SiteRegions {
  const out = emptyRegions();
  if (!raw || typeof raw !== "object") return out;
  for (const r of REGIONS) {
    const list = (raw as Record<string, unknown>)[r.id];
    if (!Array.isArray(list)) continue;
    out[r.id] = list
      .filter((c): c is PlacedComponent => !!c && typeof c === "object" && !!getComponentDef((c as PlacedComponent).type))
      .map((c) => ({
        uid: String(c.uid),
        type: c.type,
        props: Object.fromEntries(Object.entries(c.props ?? {}).map(([k, v]) => [k, String(v).slice(0, 4000)])),
        ...(c.included ? { included: true } : {}),
        ...(c.hidden ? { hidden: true } : {}),
      }));
  }
  return out;
}

export function newUid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Các component đang hiện cho khách (bỏ qua khối bị ẩn). */
export function placedTypes(regions: SiteRegions): Set<ComponentType> {
  return new Set(Object.values(regions).flat().filter((c) => !c.hidden).map((c) => c.type));
}

/** Mọi component đã đặt, kể cả khối ẩn (để biết component chỉ được đặt một lần đã có chưa). */
export function allTypes(regions: SiteRegions): Set<ComponentType> {
  return new Set(Object.values(regions).flat().map((c) => c.type));
}

/** Các component mua thêm (không tính khối có sẵn của mẫu). */
export function addons(regions: SiteRegions): PlacedComponent[] {
  return Object.values(regions)
    .flat()
    .filter((c) => !c.included && !getComponentDef(c.type)?.section);
}

/** Tổng giá các component đã gắn thêm. */
export function addonTotal(regions: SiteRegions): number {
  return addons(regions).reduce((sum, c) => sum + (COMPONENTS.find((d) => d.type === c.type)?.price ?? 0), 0);
}

/** Thời điểm hiện tại (ms), tách ra hàm riêng để gọi từ trình xử lý sự kiện. */
export function nowMs(): number {
  return Date.now();
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

/** Làm sạch danh sách sản phẩm đọc về. */
export function normalizeProducts(raw: unknown): SiteProduct[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p) => p && typeof p === "object")
    .slice(0, 60)
    .map((p) => {
      const o = p as Record<string, unknown>;
      const price = Number(o.price);
      return {
        id: str(o.id, 40) || newUid(),
        name: str(o.name, 120),
        price: Number.isFinite(price) && price >= 0 ? Math.round(price) : 0,
        image: str(o.image, 500) || undefined,
        description: str(o.description, 400) || undefined,
      };
    })
    .filter((p) => p.name);
}

export function normalizeHero(raw: unknown): SiteHeroText | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const hero: SiteHeroText = {
    headline: str(o.headline, 140) || undefined,
    subtitle: str(o.subtitle, 300) || undefined,
    announcement: str(o.announcement, 160) || undefined,
  };
  return hero.headline || hero.subtitle || hero.announcement ? hero : undefined;
}

/** Chỉ cho ảnh http(s) để tránh link javascript: hay data: lạ. */
export function safeImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}
