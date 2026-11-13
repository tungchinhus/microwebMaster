"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const COMPARE_MAX = 3;

interface CompareState {
  slugs: string[];
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

/** Danh sách mẫu đang chọn để so sánh (tối đa 3), nhớ trong trình duyệt. */
export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const { slugs } = get();
        if (slugs.includes(slug)) set({ slugs: slugs.filter((s) => s !== slug) });
        else set({ slugs: [...slugs, slug].slice(-COMPARE_MAX) });
      },
      remove: (slug) => set({ slugs: get().slugs.filter((s) => s !== slug) }),
      clear: () => set({ slugs: [] }),
    }),
    {
      name: "webmaster-compare",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

/** Gọi một lần ở component dùng store để nạp danh sách đã lưu sau khi hydrate. */
export function useCompareHydration() {
  useEffect(() => {
    void useCompareStore.persist.rehydrate();
  }, []);
}
