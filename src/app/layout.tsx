import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { StoreHydrator } from "@/components/store-hydrator";
import "./globals.css";

const sans = Be_Vietnam_Pro({ variable: "--font-sans-vn", subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700", "800"] });
const mono = JetBrains_Mono({ variable: "--font-mono-code", subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: { default: "Web Master - Website riêng, chọn mẫu là có", template: "%s | Web Master" },
  description: "Kho mẫu website bán hàng, giáo dục, dịch vụ, tuyển dụng, 3D... Giá cố định từ 3.900.000đ, bàn giao trong vài ngày, hoặc tự tạo bằng AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
