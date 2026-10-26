"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { effectivePrice } from "@/lib/format";
import type { CartItem, Product } from "@/lib/types";

const STORAGE_KEY = "cart:v1";
const EMPTY: CartItem[] = [];

/** Giỏ hàng lưu trong localStorage, đồng bộ giữa các tab qua sự kiện "storage". */
const cartStore = (() => {
  let cachedRaw: string | null = null;
  let cached: CartItem[] = EMPTY;
  let memoryFallback: string | null = null;
  const listeners = new Set<() => void>();

  const readRaw = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return memoryFallback;
    }
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && listener();
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot(): CartItem[] {
      const raw = readRaw();
      if (raw !== cachedRaw) {
        cachedRaw = raw;
        try {
          const parsed = raw ? JSON.parse(raw) : [];
          cached = Array.isArray(parsed) ? parsed : EMPTY;
        } catch {
          cached = EMPTY;
        }
      }
      return cached;
    },
    set(update: (prev: CartItem[]) => CartItem[]) {
      const raw = JSON.stringify(update(this.getSnapshot()));
      try {
        localStorage.setItem(STORAGE_KEY, raw);
      } catch {
        memoryFallback = raw;
      }
      listeners.forEach((l) => l());
    },
  };
})();

const noopSubscribe = () => () => {};

interface CartContextValue {
  items: CartItem[];
  /** false khi đang render phía server, lúc chưa đọc được localStorage. */
  ready: boolean;
  count: number;
  subtotal: number;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(cartStore.subscribe, () => cartStore.getSnapshot(), () => EMPTY);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const value = useMemo<CartContextValue>(() => {
    const clamp = (q: number, stock: number) => Math.max(1, Math.min(q, Math.max(stock, 1), 99));
    return {
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      add: (product, quantity = 1) =>
        cartStore.set((prev) => {
          const fresh = {
            productId: product.id,
            name: product.name,
            image: product.images[0] ?? null,
            price: effectivePrice(product),
            stock: product.stock,
          };
          const existing = prev.find((i) => i.productId === product.id);
          if (existing) {
            return prev.map((i) =>
              i.productId === product.id
                ? { ...i, ...fresh, quantity: clamp(i.quantity + quantity, product.stock) }
                : i,
            );
          }
          return [...prev, { ...fresh, quantity: clamp(quantity, product.stock) }];
        }),
      setQuantity: (productId, quantity) =>
        cartStore.set((prev) =>
          prev.map((i) => (i.productId === productId ? { ...i, quantity: clamp(quantity, i.stock) } : i)),
        ),
      remove: (productId) => cartStore.set((prev) => prev.filter((i) => i.productId !== productId)),
      clear: () => cartStore.set(() => []),
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải được dùng bên trong CartProvider");
  return ctx;
}
