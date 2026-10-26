import { FieldValue } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { calcShippingFee, effectivePrice } from "@/lib/format";
import { placeOrderSchema } from "@/lib/order-schema";

class OrderError extends Error {}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để đặt hàng." }, { status: 401 });
  }

  let uid: string;
  let email: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
    email = decoded.email ?? "";
  } catch {
    return NextResponse.json({ error: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại." }, { status: 401 });
  }

  const parsed = placeOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dữ liệu đơn hàng không hợp lệ.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const { shipping } = parsed.data;

  // Gộp các dòng trùng sản phẩm để kiểm tra tồn kho chính xác.
  const quantities = new Map<string, number>();
  for (const item of parsed.data.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  try {
    const orderId = await adminDb.runTransaction(async (tx) => {
      const refs = [...quantities.keys()].map((id) => adminDb.collection("products").doc(id));
      const snaps = await tx.getAll(...refs);

      const items = snaps.map((snap) => {
        const data = snap.data();
        if (!snap.exists || !data || data.active !== true) {
          throw new OrderError("Một sản phẩm trong giỏ không còn được bán.");
        }
        const quantity = quantities.get(snap.id)!;
        if ((data.stock ?? 0) < quantity) {
          throw new OrderError(`"${data.name}" chỉ còn ${data.stock ?? 0} sản phẩm.`);
        }
        return {
          productId: snap.id,
          name: data.name as string,
          image: (data.images?.[0] as string | undefined) ?? null,
          price: effectivePrice({ price: data.price, salePrice: data.salePrice }),
          quantity,
        };
      });

      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const shippingFee = calcShippingFee(subtotal);
      const orderRef = adminDb.collection("orders").doc();

      refs.forEach((ref, i) => {
        tx.update(ref, { stock: FieldValue.increment(-items[i].quantity) });
      });
      tx.set(orderRef, {
        userId: uid,
        userEmail: email,
        items,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        status: "pending",
        paymentMethod: "cod",
        shipping,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return orderRef.id;
    });

    return NextResponse.json({ orderId }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("Place order failed", err);
    return NextResponse.json({ error: "Không thể đặt hàng, vui lòng thử lại." }, { status: 500 });
  }
}
