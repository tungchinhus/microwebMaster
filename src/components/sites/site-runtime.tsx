"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { SessionUser } from "@/lib/sites/backend";
import type { SampleProduct } from "@/lib/sites/products";
import type { ComponentType } from "@/lib/sites/components";
import type { Palette, Project } from "@/lib/showcase/catalog";

export interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface SiteRuntime {
  siteId: string;
  project: Project;
  palette: Palette;
  products: SampleProduct[];
  /** Các component đang có trên trang, để component khác biết mà phối hợp */
  placed: Set<ComponentType>;
  user: SessionUser | null | undefined;
  /** Đang ở chế độ chỉnh sửa: form không gửi thật */
  editing: boolean;
  cart: CartLine[];
  addToCart: (p: SampleProduct) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
}

const Ctx = createContext<SiteRuntime | null>(null);

export function useSiteRuntime(): SiteRuntime {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSiteRuntime phải nằm trong <SiteRuntimeProvider>");
  return v;
}

function readCart(siteId: string): CartLine[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(`wm-cart-${siteId}`) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function SiteRuntimeProvider({
  siteId,
  project,
  products,
  placed,
  user,
  editing,
  children,
}: {
  siteId: string;
  project: Project;
  products: SampleProduct[];
  placed: Set<ComponentType>;
  user: SessionUser | null | undefined;
  editing: boolean;
  children: React.ReactNode;
}) {
  // Giỏ hàng của mỗi web lưu riêng trong trình duyệt khách.
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loadedFor, setLoadedFor] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  if (typeof window !== "undefined" && loadedFor !== siteId) {
    setLoadedFor(siteId);
    setCart(readCart(siteId));
  }

  useEffect(() => {
    if (loadedFor !== siteId) return;
    try {
      window.localStorage.setItem(`wm-cart-${siteId}`, JSON.stringify(cart));
    } catch {
      // Không lưu được thì giỏ vẫn dùng được trong lần xem này.
    }
  }, [cart, siteId, loadedFor]);

  const addToCart = useCallback((p: SampleProduct) => {
    setCart((c) => {
      const found = c.find((l) => l.id === p.id);
      return found ? c.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l)) : [...c, { id: p.id, name: p.name, price: p.price, qty: 1 }];
    });
    setCartOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => (l.id === id ? { ...l, qty } : l))));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo<SiteRuntime>(
    () => ({
      siteId,
      project,
      palette: project.palette,
      products,
      placed,
      user,
      editing,
      cart,
      addToCart,
      setQty,
      clearCart,
      cartOpen,
      setCartOpen,
      loginOpen,
      setLoginOpen,
    }),
    [siteId, project, products, placed, user, editing, cart, addToCart, setQty, clearCart, cartOpen, loginOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
