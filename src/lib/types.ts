export type UserRole = "customer" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  createdAt: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  createdAt: number | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  /** Giá khuyến mãi, bỏ trống nếu không giảm giá. */
  salePrice?: number | null;
  images: string[];
  categoryId: string;
  stock: number;
  sku?: string;
  featured: boolean;
  active: boolean;
  createdAt: number | null;
  updatedAt: number | null;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipping",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  productId: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "cod";
  shipping: ShippingInfo;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
  stock: number;
}
