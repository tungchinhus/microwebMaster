import type { CSSProperties } from "react";

/**
 * Hoạ tiết Việt dùng làm nền chìm cho banner: vẽ bằng SVG lặp lại, đổi màu theo giao diện.
 * Giữ nét mảnh và độ đậm thấp để chữ trên banner vẫn dễ đọc.
 */
export type Motif = "sen" | "trong-dong" | "den-long" | "gach-bong" | "may" | "tre" | "song";

export const MOTIFS: { id: Motif; name: string }[] = [
  { id: "sen", name: "Hoa sen" },
  { id: "trong-dong", name: "Trống đồng" },
  { id: "den-long", name: "Đèn lồng" },
  { id: "gach-bong", name: "Gạch bông" },
  { id: "may", name: "Mây cát tường" },
  { id: "tre", name: "Tre" },
  { id: "song", name: "Sóng nước" },
];

/** Nội dung SVG của một ô hoạ tiết; c là màu nét. Kích thước ô kèm theo. */
const TILES: Record<Motif, (c: string) => [string, number]> = {
  sen: (c) => [
    `<g fill="none" stroke="${c}" stroke-width="1.4" stroke-linejoin="round">` +
      `<path d="M40 22c6 8 6 18 0 26c-6-8-6-18 0-26z"/>` +
      `<path d="M40 48c-4-9-12-14-22-14c2 9 10 15 22 14z"/>` +
      `<path d="M40 48c4-9 12-14 22-14c-2 9-10 15-22 14z"/>` +
      `<path d="M24 54h32"/></g>`,
    80,
  ],
  "trong-dong": (c) => {
    const rays = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      const x = 60 + Math.cos(a) * 14;
      const y = 60 + Math.sin(a) * 14;
      const x2 = 60 + Math.cos(a + 0.12) * 5;
      const y2 = 60 + Math.sin(a + 0.12) * 5;
      const x3 = 60 + Math.cos(a - 0.12) * 5;
      const y3 = 60 + Math.sin(a - 0.12) * 5;
      return `<path d="M${x2.toFixed(1)} ${y2.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}L${x3.toFixed(1)} ${y3.toFixed(1)}"/>`;
    }).join("");
    return [
      `<g fill="none" stroke="${c}" stroke-width="1.2">${rays}` +
        `<circle cx="60" cy="60" r="20"/><circle cx="60" cy="60" r="26" stroke-dasharray="2 4"/>` +
        `<circle cx="60" cy="60" r="34"/><circle cx="60" cy="60" r="40" stroke-dasharray="6 3"/></g>`,
      120,
    ];
  },
  "den-long": (c) => [
    `<g fill="none" stroke="${c}" stroke-width="1.3">` +
      `<path d="M30 6v8"/><path d="M22 14h16"/>` +
      `<ellipse cx="30" cy="30" rx="13" ry="16"/><path d="M30 14v32M20 20c4 6 4 14 0 20M40 20c-4 6-4 14 0 20"/>` +
      `<path d="M22 46h16"/><path d="M30 46v10M27 56h6"/></g>`,
    70,
  ],
  "gach-bong": (c) => [
    `<g fill="none" stroke="${c}" stroke-width="1.2">` +
      `<rect x="0.5" y="0.5" width="59" height="59"/>` +
      `<path d="M30 8c6 8 6 14 0 22c-6-8-6-14 0-22zM30 52c6-8 6-14 0-22c-6 8-6 14 0 22zM8 30c8-6 14-6 22 0c-8 6-14 6-22 0zM52 30c-8-6-14-6-22 0c8 6 14 6 22 0z"/>` +
      `<path d="M0 10a10 10 0 0 0 10-10M50 0a10 10 0 0 0 10 10M60 50a10 10 0 0 0-10 10M10 60a10 10 0 0 0-10-10"/>` +
      `<circle cx="30" cy="30" r="3"/></g>`,
    60,
  ],
  may: (c) => [
    `<g fill="none" stroke="${c}" stroke-width="1.3" stroke-linecap="round">` +
      `<path d="M14 44c-6 0-8-8-2-10c0-8 10-10 14-4c4-6 14-4 14 4c6 2 4 10-2 10z"/>` +
      `<path d="M22 36a4 4 0 1 1 4 4M36 38a3 3 0 1 0-3-3"/>` +
      `<path d="M56 86c-5 0-7-6-2-8c0-6 8-8 11-3c3-5 11-3 11 3c5 2 3 8-2 8z"/></g>`,
    100,
  ],
  tre: (c) => [
    `<g fill="none" stroke="${c}" stroke-width="1.3" stroke-linecap="round">` +
      `<path d="M14 0v28M14 32v28M14 64v26M40 10v30M40 44v34M40 82v8"/>` +
      `<path d="M10 30h8M10 62h8M36 42h8M36 80h8"/>` +
      `<path d="M14 30c8-2 14-8 16-16M40 42c-8 0-14-6-16-14M14 62c6 0 12 4 14 10"/></g>`,
    56,
  ],
  song: (c) => [
    `<g fill="none" stroke="${c}" stroke-width="1.2">` +
      `<path d="M0 20a10 10 0 0 1 20 0a10 10 0 0 1 20 0M5 20a5 5 0 0 1 10 0M25 20a5 5 0 0 1 10 0"/>` +
      `<path d="M-10 40a10 10 0 0 1 20 0a10 10 0 0 1 20 0a10 10 0 0 1 20 0M-5 40a5 5 0 0 1 10 0M15 40a5 5 0 0 1 10 0M35 40a5 5 0 0 1 10 0"/></g>`,
    40,
  ],
};

/**
 * Lớp nền hoạ tiết đặt chồng lên màu banner.
 * @param color màu nét (thường là chữ trên banner)
 * @param unit "px" cho trang thật; "em" cho bản xem trước thu nhỏ (ô hoạ tiết co theo khung)
 */
export function motifLayer(motif: Motif | undefined, color: string, opacity = 0.14, unit: "px" | "em" = "px"): CSSProperties {
  if (!motif || !TILES[motif]) return {};
  const [body, px] = TILES[motif](color);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}"><g opacity="${opacity}">${body}</g></svg>`;
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundSize: unit === "em" ? `${px / 9}em ${px / 9}em` : `${px}px ${px}px`,
    backgroundRepeat: "repeat",
  };
}
