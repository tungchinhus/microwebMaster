// Tạo dữ liệu mẫu (danh mục + sản phẩm): npm run seed
// Chỉ chạy khi collection products đang trống, để không ghi đè dữ liệu thật.
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./admin-app.mjs";

const existing = await db.collection("products").limit(1).get();
if (!existing.empty && !process.argv.includes("--force")) {
  console.log("Đã có sản phẩm, bỏ qua. Dùng --force để vẫn thêm dữ liệu mẫu.");
  process.exit(0);
}

const slugify = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const categories = [
  { name: "Điện thoại", description: "Smartphone chính hãng" },
  { name: "Laptop", description: "Laptop văn phòng, gaming" },
  { name: "Phụ kiện", description: "Tai nghe, sạc, cáp, ốp lưng" },
  { name: "Đồng hồ thông minh", description: "Smartwatch, vòng đeo sức khỏe" },
];

const products = [
  ["Điện thoại", "Galaxy Nova X 256GB", 18990000, 16990000, 25, true],
  ["Điện thoại", "Pixel Pro 9 128GB", 21490000, null, 12, true],
  ["Điện thoại", "Redmi Note 14 Pro", 7490000, 6890000, 40, false],
  ["Điện thoại", "Oppo Reno 12 5G", 10990000, null, 3, false],
  ["Laptop", "ZenBook 14 OLED i7", 26990000, 24490000, 8, true],
  ["Laptop", "ThinkPad E14 Gen 6", 19990000, null, 15, false],
  ["Laptop", "Aspire Gaming 15 RTX 4060", 28990000, 27490000, 0, false],
  ["Phụ kiện", "Tai nghe Bluetooth chống ồn ANC", 2490000, 1890000, 60, true],
  ["Phụ kiện", "Sạc nhanh GaN 65W 3 cổng", 690000, null, 120, false],
  ["Phụ kiện", "Cáp USB-C bện dù 2m", 190000, 149000, 200, false],
  ["Đồng hồ thông minh", "Watch Fit 4 GPS", 3490000, 2990000, 18, true],
  ["Đồng hồ thông minh", "Vòng đeo sức khỏe Band 9", 990000, null, 4, false],
];

const catIds = {};
for (const [i, c] of categories.entries()) {
  const ref = await db.collection("categories").add({
    ...c,
    slug: slugify(c.name),
    sortOrder: i,
    createdAt: FieldValue.serverTimestamp(),
  });
  catIds[c.name] = ref.id;
}

const batch = db.batch();
products.forEach(([cat, name, price, salePrice, stock, featured], i) => {
  const ref = db.collection("products").doc();
  batch.set(ref, {
    name,
    slug: slugify(name),
    sku: `TZ-${String(i + 1).padStart(4, "0")}`,
    description: `${name} chính hãng, bảo hành 12 tháng.\nGiao hàng toàn quốc, kiểm tra hàng trước khi thanh toán.`,
    price,
    salePrice,
    stock,
    featured,
    active: true,
    categoryId: catIds[cat],
    images: [`https://picsum.photos/seed/${slugify(name)}/800/800`],
    // Lệch thời gian để thứ tự "mới nhất" ổn định.
    createdAt: new Date(Date.now() - i * 60_000),
    updatedAt: FieldValue.serverTimestamp(),
  });
});
await batch.commit();
console.log(`Đã tạo ${categories.length} danh mục và ${products.length} sản phẩm mẫu.`);
