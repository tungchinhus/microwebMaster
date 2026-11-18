import { getComponentDef, REGIONS, type ComponentType, type RegionId } from "./components";
import { orderRegion, type PlacedComponent, type SiteRegions } from "./types";

/**
 * Quy tắc đặt component theo vùng, dùng chung cho thư viện, nút mũi tên và kéo thả trong trình sửa web.
 * Mỗi component chỉ nằm ở vùng hợp lý với chức năng của nó (giỏ hàng, đăng nhập, tìm kiếm ở đầu trang;
 * khối nội dung ở thân trang; nhận tin, liên hệ ở chân trang; nút Zalo nổi ở góc).
 */

export function regionName(id: RegionId): string {
  return REGIONS.find((r) => r.id === id)?.name ?? id;
}

export function regionMax(id: RegionId): number {
  return REGIONS.find((r) => r.id === id)?.max ?? 99;
}

export function allowedNames(type: ComponentType): string {
  return (getComponentDef(type)?.regions ?? []).map(regionName).join(" hoặc ");
}

export type Placement = { ok: true } | { ok: false; reason: string; suggest?: RegionId };

/**
 * Kiểm tra đặt `type` vào `region` được không. `movingUid` là khối đang được kéo
 * (bỏ qua chính nó khi đếm trùng và đếm số khối của vùng).
 */
export function checkPlacement(regions: SiteRegions, type: ComponentType, region: RegionId, movingUid?: string): Placement {
  const def = getComponentDef(type);
  if (!def) return { ok: false, reason: "Component không tồn tại." };
  const others = (r: RegionId) => regions[r].filter((c) => c.uid !== movingUid);
  const roomIn = (r: RegionId) => others(r).length < regionMax(r);
  const suggest = def.regions.find((r) => r !== region && roomIn(r));
  if (!def.regions.includes(region)) {
    return { ok: false, reason: `${def.name} chỉ đặt ở ${allowedNames(type)}. ${def.why ?? ""}`.trim(), suggest };
  }
  if (def.unique && Object.values(regions).flat().some((c) => c.type === type && c.uid !== movingUid)) {
    return { ok: false, reason: `${def.name} đã có trên trang, mỗi trang chỉ cần một.` };
  }
  if (!roomIn(region)) {
    return { ok: false, reason: `Vùng ${regionName(region)} chỉ chứa tối đa ${regionMax(region)} khối.`, suggest };
  }
  return { ok: true };
}

/** Vùng nên đặt khi thêm mới: vùng đang chọn nếu hợp lệ, không thì vùng hợp lệ còn chỗ. */
export function bestRegion(regions: SiteRegions, type: ComponentType, preferred: RegionId): RegionId | null {
  const def = getComponentDef(type);
  if (!def) return null;
  const order = def.regions.includes(preferred) ? [preferred, ...def.regions.filter((r) => r !== preferred)] : def.regions;
  return order.find((r) => checkPlacement(regions, type, r).ok) ?? null;
}

/** Chỉ số hợp lệ gần nhất: không chen lên trên banner đang khoá ở đầu vùng. */
export function clampIndex(list: PlacedComponent[], type: ComponentType, index: number): number {
  if (getComponentDef(type)?.pin === "first") return 0;
  const pinned = list.filter((c) => getComponentDef(c.type)?.pin === "first").length;
  return Math.max(index, pinned);
}

/** Chèn khối vào vùng ở vị trí mong muốn rồi xếp lại theo luật của vùng (đầu trang, banner). */
export function insertAt(region: RegionId, list: PlacedComponent[], item: PlacedComponent, index = list.length): PlacedComponent[] {
  const next = [...list];
  next.splice(clampIndex(list, item.type, index), 0, item);
  return orderRegion(region, next);
}

/** Vùng này có cho đổi thứ tự bằng tay không (đầu trang tự xếp). */
export function reorderable(region: RegionId): boolean {
  return region !== "header";
}

/** Khối có bị khoá vị trí không (banner). */
export function isPinned(type: ComponentType): boolean {
  return getComponentDef(type)?.pin === "first";
}
