import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../firebase/client";
import type { Product, ProductInput } from "../types";
import { toProduct } from "./converters";

const productsCol = collection(db, "products");

/** Sản phẩm đang bán, mới nhất trước. Lọc và tìm kiếm thực hiện phía client. */
export async function listActiveProducts(): Promise<Product[]> {
  const snap = await getDocs(
    query(productsCol, where("active", "==", true), orderBy("createdAt", "desc")),
  );
  return snap.docs.map(toProduct);
}

/** Tất cả sản phẩm (kể cả đã ẩn), chỉ dành cho admin. */
export async function listAllProducts(): Promise<Product[]> {
  const snap = await getDocs(query(productsCol, orderBy("createdAt", "desc")));
  return snap.docs.map(toProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  return snap.exists() ? toProduct(snap) : null;
}

export async function createProduct(input: ProductInput): Promise<string> {
  const created = await addDoc(productsCol, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  await updateDoc(doc(db, "products", id), { ...input, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

/** Xóa ảnh trên Storage nếu URL thuộc bucket của dự án; bỏ qua ảnh ngoài. */
export async function deleteProductImage(url: string): Promise<void> {
  if (!url.includes("firebasestorage") && !url.includes("127.0.0.1:9199")) return;
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // Ảnh đã bị xóa trước đó: không cần báo lỗi.
  }
}
