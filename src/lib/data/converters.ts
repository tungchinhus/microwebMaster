import { Timestamp, type DocumentData, type QueryDocumentSnapshot, type DocumentSnapshot } from "firebase/firestore";
import type { Category, Order, Product, UserProfile } from "../types";

function toMillis(value: unknown): number | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  return null;
}

type Snap = QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>;

export function toProduct(snap: Snap): Product {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    name: d.name ?? "",
    slug: d.slug ?? "",
    description: d.description ?? "",
    price: Number(d.price ?? 0),
    salePrice: d.salePrice ?? null,
    images: Array.isArray(d.images) ? d.images : [],
    categoryId: d.categoryId ?? "",
    stock: Number(d.stock ?? 0),
    sku: d.sku ?? "",
    featured: Boolean(d.featured),
    active: d.active !== false,
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

export function toCategory(snap: Snap): Category {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    name: d.name ?? "",
    slug: d.slug ?? "",
    description: d.description ?? "",
    sortOrder: Number(d.sortOrder ?? 0),
    createdAt: toMillis(d.createdAt),
  };
}

export function toOrder(snap: Snap): Order {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    userId: d.userId,
    userEmail: d.userEmail ?? "",
    items: d.items ?? [],
    subtotal: Number(d.subtotal ?? 0),
    shippingFee: Number(d.shippingFee ?? 0),
    total: Number(d.total ?? 0),
    status: d.status ?? "pending",
    paymentMethod: "cod",
    shipping: d.shipping ?? { fullName: "", phone: "", address: "" },
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

export function toUserProfile(snap: Snap): UserProfile {
  const d = snap.data() ?? {};
  return {
    uid: snap.id,
    email: d.email ?? "",
    displayName: d.displayName ?? "",
    phone: d.phone ?? "",
    role: d.role === "admin" ? "admin" : "customer",
    createdAt: toMillis(d.createdAt),
  };
}
