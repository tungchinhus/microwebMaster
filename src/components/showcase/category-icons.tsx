import {
  Bot,
  Box,
  BriefcaseBusiness,
  Building2,
  Car,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  LayoutTemplate,
  Megaphone,
  Plane,
  Scissors,
  ShoppingBag,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/** Biểu tượng cho từng lĩnh vực để quét danh sách nhanh bằng mắt thay vì đọc từng tên. */
const ICONS: Record<string, LucideIcon> = {
  "thuong-mai-dien-tu": ShoppingBag,
  "giao-duc": GraduationCap,
  "dich-vu": Wrench,
  "landing-page": Megaphone,
  "khong-gian-3d": Box,
  "tuyen-dung": BriefcaseBusiness,
  game: Gamepad2,
  "cong-cu-ai": Bot,
  "o-to": Car,
  "am-thuc": UtensilsCrossed,
  "du-lich": Plane,
  "y-te": HeartPulse,
  "bat-dong-san": Building2,
  "lam-dep": Scissors,
  "the-thao": Dumbbell,
};

export function CategoryIcon({ id, className }: { id: string; className?: string }) {
  const Icon = ICONS[id] ?? LayoutTemplate;
  return <Icon className={className} aria-hidden />;
}
