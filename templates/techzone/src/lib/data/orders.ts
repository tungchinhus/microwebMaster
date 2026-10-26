import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/client";
import type { Order, OrderStatus, ShippingInfo } from "../types";
import { toOrder } from "./converters";

const ordersCol = collection(db, "orders");

export async function listMyOrders(uid: string): Promise<Order[]> {
  const snap = await getDocs(
    query(ordersCol, where("userId", "==", uid), orderBy("createdAt", "desc")),
  );
  return snap.docs.map(toOrder);
}

export async function listAllOrders(): Promise<Order[]> {
  const snap = await getDocs(query(ordersCol, orderBy("createdAt", "desc")));
  return snap.docs.map(toOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, "orders", id));
  return snap.exists() ? toOrder(snap) : null;
}

export interface PlaceOrderPayload {
  items: { productId: string; quantity: number }[];
  shipping: ShippingInfo;
}

/**
 * Đặt hàng qua API route phía server: server tự tính giá từ Firestore,
 * kiểm tra tồn kho và trừ kho trong một transaction, nên khách không thể sửa giá.
 */
export async function placeOrder(payload: PlaceOrderPayload): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Bạn cần đăng nhập để đặt hàng.");
  const token = await user.getIdToken();
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Không thể đặt hàng, vui lòng thử lại.");
  return data.orderId as string;
}

/**
 * Admin đổi trạng thái đơn. Khi hủy đơn chưa hủy, hoàn lại tồn kho trong cùng transaction.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await runTransaction(db, async (tx) => {
    const orderRef = doc(db, "orders", orderId);
    const snap = await tx.get(orderRef);
    if (!snap.exists()) throw new Error("Không tìm thấy đơn hàng.");
    const order = toOrder(snap);
    if (order.status === status) return;
    if (order.status === "cancelled") throw new Error("Đơn đã hủy không thể đổi trạng thái.");

    if (status === "cancelled") {
      const productRefs = order.items.map((item) => doc(db, "products", item.productId));
      const productSnaps = await Promise.all(productRefs.map((r) => tx.get(r)));
      order.items.forEach((item, i) => {
        if (productSnaps[i].exists()) {
          tx.update(productRefs[i], { stock: increment(item.quantity) });
        }
      });
    }
    tx.update(orderRef, { status, updatedAt: serverTimestamp() });
  });
}
