import { COMPONENTS, getComponentDef, REGIONS, type ComponentType, type RegionId } from "./components";

/** Một component đã gắn vào trang, với nội dung riêng do admin nhập. */
export interface PlacedComponent {
  uid: string;
  type: ComponentType;
  props: Record<string, string>;
}

export type SiteRegions = Record<RegionId, PlacedComponent[]>;

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
      .map((c) => ({ uid: String(c.uid), type: c.type, props: { ...(c.props ?? {}) } }));
  }
  return out;
}

export function newUid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function placedTypes(regions: SiteRegions): Set<ComponentType> {
  return new Set(Object.values(regions).flat().map((c) => c.type));
}

/** Tổng giá các component đã gắn thêm. */
export function addonTotal(regions: SiteRegions): number {
  return Object.values(regions)
    .flat()
    .reduce((sum, c) => sum + (COMPONENTS.find((d) => d.type === c.type)?.price ?? 0), 0);
}

/** Thời điểm hiện tại (ms), tách ra hàm riêng để gọi từ trình xử lý sự kiện. */
export function nowMs(): number {
  return Date.now();
}
