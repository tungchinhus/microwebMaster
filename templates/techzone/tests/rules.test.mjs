// Kiểm thử Firestore & Storage Security Rules trên Emulator: npm run test:rules
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { deleteApp, initializeApp as initAdmin } from "firebase-admin/app";
import { getFirestore as adminFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  terminate,
  updateDoc,
  where,
} from "firebase/firestore";
import { connectStorageEmulator, getStorage, ref, uploadBytes } from "firebase/storage";

const projectId = "demo-techzone";
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";

const admin = initAdmin({ projectId }, "rules-admin");
const seedDb = adminFirestore(admin);
const clients = [];

/** Client SDK đăng nhập giả lập bằng mock token (null = khách vãng lai). */
function client(uid, claims = {}) {
  const app = initializeApp({ projectId, apiKey: "test", storageBucket: `${projectId}.appspot.com` }, `c${clients.length}`);
  const db = getFirestore(app);
  const token = uid ? { user_id: uid, sub: uid, ...claims } : undefined;
  connectFirestoreEmulator(db, "127.0.0.1", 8080, token ? { mockUserToken: token } : undefined);
  const storage = getStorage(app);
  connectStorageEmulator(storage, "127.0.0.1", 9199, token ? { mockUserToken: token } : undefined);
  clients.push(db);
  return { db, storage };
}

const allowed = (p) => assert.doesNotReject(p);
const denied = (p) => assert.rejects(p, (e) => /permission|unauthorized/i.test(e.code ?? e.message));

const P = `t${Date.now()}`;
let guest, alice, bob, boss;

before(async () => {
  await seedDb.doc(`users/${P}-boss`).set({ email: "boss@x.vn", displayName: "Boss", role: "admin" });
  await seedDb.doc(`users/${P}-alice`).set({ email: "a@x.vn", displayName: "Alice", role: "customer" });
  await seedDb.doc(`products/${P}-on`).set({ name: "On", active: true, stock: 5, price: 100 });
  await seedDb.doc(`products/${P}-off`).set({ name: "Off", active: false, stock: 5, price: 100 });
  await seedDb.doc(`orders/${P}-alice`).set({ userId: `${P}-alice`, status: "pending", total: 100 });
  guest = client(null);
  alice = client(`${P}-alice`);
  bob = client(`${P}-bob`);
  boss = client(`${P}-boss`, { admin: true });
});

after(async () => {
  await Promise.all(clients.map((db) => terminate(db)));
  await deleteApp(admin);
});

describe("products", () => {
  test("khách xem được sản phẩm đang bán", () => allowed(getDoc(doc(guest.db, `products/${P}-on`))));
  test("khách không xem được sản phẩm đã ẩn", () => denied(getDoc(doc(guest.db, `products/${P}-off`))));
  test("query active==true được phép", () =>
    allowed(getDocs(query(collection(guest.db, "products"), where("active", "==", true)))));
  test("khách hàng không sửa được giá", () => denied(updateDoc(doc(alice.db, `products/${P}-on`), { price: 1 })));
  test("admin xem được sản phẩm đã ẩn", () => allowed(getDoc(doc(boss.db, `products/${P}-off`))));
  test("admin tạo sản phẩm hợp lệ", () =>
    allowed(
      addDoc(collection(boss.db, "products"), {
        name: "Mới", slug: "moi", description: "", price: 1000, salePrice: null, images: [],
        categoryId: "c1", stock: 3, featured: false, active: true,
      }),
    ));
  test("admin không tạo được sản phẩm tồn kho âm", () =>
    denied(
      addDoc(collection(boss.db, "products"), {
        name: "Sai", slug: "sai", description: "", price: 1000, salePrice: null, images: [],
        categoryId: "c1", stock: -1, featured: false, active: true,
      }),
    ));
});

describe("users", () => {
  test("tự tạo hồ sơ customer", () =>
    allowed(setDoc(doc(bob.db, `users/${P}-bob`), { email: "b@x.vn", displayName: "Bob", phone: "", role: "customer" })));
  test("không tự tạo hồ sơ admin", () =>
    denied(setDoc(doc(guest.db, `users/${P}-guest`), { email: "g@x.vn", displayName: "G", phone: "", role: "admin" })));
  test("không tự nâng quyền", () => denied(updateDoc(doc(alice.db, `users/${P}-alice`), { role: "admin" })));
  test("được sửa tên và SĐT của mình", () =>
    allowed(updateDoc(doc(alice.db, `users/${P}-alice`), { displayName: "Alice 2", phone: "0900000000" })));
  test("không đọc được hồ sơ người khác", () => denied(getDoc(doc(bob.db, `users/${P}-alice`))));
});

describe("orders", () => {
  test("chủ đơn đọc được đơn của mình", () => allowed(getDoc(doc(alice.db, `orders/${P}-alice`))));
  test("người khác không đọc được", () => denied(getDoc(doc(bob.db, `orders/${P}-alice`))));
  test("client không tự tạo đơn", () =>
    denied(addDoc(collection(alice.db, "orders"), { userId: `${P}-alice`, total: 0, status: "pending" })));
  test("khách không tự đổi trạng thái", () =>
    denied(updateDoc(doc(alice.db, `orders/${P}-alice`), { status: "completed" })));
  test("admin đổi trạng thái", () => allowed(updateDoc(doc(boss.db, `orders/${P}-alice`), { status: "confirmed" })));
  test("admin không sửa tổng tiền", () => denied(updateDoc(doc(boss.db, `orders/${P}-alice`), { total: 1 })));
});

describe("storage", () => {
  const png = new Uint8Array([137, 80, 78, 71]);
  test("admin upload ảnh", () => allowed(uploadBytes(ref(boss.storage, `products/${P}.png`), png, { contentType: "image/png" })));
  test("khách hàng không upload được", () =>
    denied(uploadBytes(ref(alice.storage, `products/${P}-a.png`), png, { contentType: "image/png" })));
  test("admin không upload file không phải ảnh", () =>
    denied(uploadBytes(ref(boss.storage, `products/${P}.txt`), png, { contentType: "text/plain" })));
});
