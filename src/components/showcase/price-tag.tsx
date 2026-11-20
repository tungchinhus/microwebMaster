import { SITE, formatVnd } from "@/config/site";

/**
 * Giá của một mẫu hoặc gói. Khi SITE.showPrices tắt, hiện lời mời báo giá rõ ràng
 * thay vì một con số bị làm mờ (số mờ trông như lỗi hiển thị và làm khách nghi ngờ).
 */
export function PriceTag({ value, from = true, hiddenLabel = "Báo giá trong ngày", className = "" }: { value: number; from?: boolean; hiddenLabel?: string; className?: string }) {
  if (!SITE.showPrices) return <span className={className}>{hiddenLabel}</span>;
  return (
    <span className={className}>
      {from && "từ "}
      {formatVnd(value)}
    </span>
  );
}
