import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { StoreHydrator } from "@/components/store-hydrator";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "vietnamese"] });
const mono = JetBrains_Mono({ variable: "--font-mono-code", subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: { default: "Web Master - Tạo website bán hàng bằng AI", template: "%s | Web Master" },
  description: "Chọn theme, nhập thông tin cửa hàng và để Gemini tạo toàn bộ mã nguồn website bán hàng React + Firebase.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${inter.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
