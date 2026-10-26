"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/** Đổi Sáng/Tối bằng class "dark" trên <html>; giá trị được nhớ trong localStorage. */
export function ThemeToggle() {
  const toggle = () => {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Không lưu được lựa chọn: vẫn đổi theme cho trang hiện tại.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Đổi giao diện sáng/tối"
      className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Sun className="hidden size-5 dark:block" />
      <Moon className="size-5 dark:hidden" />
    </button>
  );
}
