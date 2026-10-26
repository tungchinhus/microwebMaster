"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useBuilderStore } from "@/store/builder-store";

/** Nạp cấu hình đã lưu từ localStorage sau khi hydrate (store dùng skipHydration). */
export function StoreHydrator() {
  useEffect(() => {
    void useBuilderStore.persist.rehydrate();
  }, []);
  return null;
}

const subscribe = (cb: () => void) => useBuilderStore.persist.onFinishHydration(cb);

/** true khi dữ liệu đã lưu được nạp xong; luôn false khi render phía server. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => useBuilderStore.persist.hasHydrated(), () => false);
}
