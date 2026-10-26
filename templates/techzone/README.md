# TechZone: Web bán hàng + Trang quản trị

Ứng dụng bán hàng online kèm trang quản trị, xây bằng **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4** và **Firebase** (Authentication, Firestore, Storage).

## Tính năng

**Cửa hàng**
- Trang chủ: banner, danh mục, sản phẩm nổi bật, hàng mới về
- Danh sách sản phẩm: lọc theo danh mục, tìm kiếm không dấu, sắp xếp giá/tên, lọc còn hàng, "Xem thêm"
- Chi tiết sản phẩm: nhiều ảnh, giá khuyến mãi, tồn kho, chọn số lượng, Mua ngay
- Giỏ hàng lưu trên trình duyệt, đồng bộ giữa các tab, miễn phí vận chuyển theo ngưỡng
- Thanh toán COD, kiểm tra thông tin giao hàng
- Đăng ký / đăng nhập (email + Google), hồ sơ tài khoản, lịch sử đơn hàng
- Giao diện Sáng/Tối (nhớ lựa chọn, không bị nháy), responsive cho điện thoại

**Trang quản trị (`/admin`)**
- Tổng quan: doanh thu, số đơn, biểu đồ doanh thu 7 ngày, cảnh báo sắp hết hàng, đơn mới
- Sản phẩm: thêm/sửa/xóa, upload nhiều ảnh lên Firebase Storage, bật/tắt bán nhanh
- Danh mục: thêm/sửa/xóa, sắp thứ tự
- Đơn hàng: lọc theo trạng thái, tìm kiếm, chuyển trạng thái (Chờ xác nhận → Đã xác nhận → Đang giao → Hoàn thành), hủy đơn tự hoàn kho
- Khách hàng: danh sách, số đơn, tổng chi tiêu

**Bảo mật**
- Đơn hàng chỉ được tạo qua API server (`/api/orders`): server tự tính giá từ Firestore, kiểm tra và trừ tồn kho trong một transaction, nên khách không thể sửa giá
- Firestore & Storage Security Rules: khách không tự nâng quyền admin, không đọc đơn của người khác, chỉ admin được sửa sản phẩm và upload ảnh
- Có bộ test cho Security Rules (`npm run test:rules`)

## Đổi thông tin cửa hàng

Mọi thông tin cửa hàng nằm trong [`src/config/store.ts`](src/config/store.ts): tên, khẩu hiệu, **màu chủ đạo** (`primaryColor`), chế độ Sáng/Tối mặc định, phí vận chuyển, thông tin liên hệ. Đổi ở đây là toàn bộ giao diện đổi theo.

## Chạy thử nhanh với Firebase Emulator (không cần tài khoản Firebase)

Yêu cầu: Node.js 20+ và Java 11+ (cho Emulator).

```bash
npm install
cp .env.emulator .env.local
npm run emulators            # cửa sổ 1: chạy Auth, Firestore, Storage giả lập (UI: http://127.0.0.1:4000)
npm run seed                 # cửa sổ 2: tạo dữ liệu mẫu
npm run dev                  # mở http://localhost:3000
```

Đăng ký một tài khoản trên web, rồi cấp quyền admin:

```bash
npm run set-admin -- email-cua-ban@example.com
```

Tải lại trang, menu tài khoản sẽ có mục **Trang quản trị**.

## Chạy với Firebase thật

1. Tạo project tại [Firebase Console](https://console.firebase.google.com).
2. Bật **Authentication** → Sign-in method: *Email/Password* và *Google*.
3. Tạo **Firestore Database** và **Storage**.
4. Project settings → *Your apps* → tạo Web app, chép cấu hình vào `.env.local` (theo mẫu [`.env.example`](.env.example)).
5. Project settings → *Service accounts* → *Generate new private key*, chép `client_email` và `private_key` vào `FIREBASE_ADMIN_CLIENT_EMAIL` và `FIREBASE_ADMIN_PRIVATE_KEY`.
6. Đưa rules và index lên Firebase:
   ```bash
   npx firebase login
   npx firebase use --add          # chọn project vừa tạo
   npm run deploy:rules
   ```
7. `npm run seed` (tùy chọn), `npm run dev`, đăng ký tài khoản rồi `npm run set-admin -- email`.

> Không commit file `.env.local` và service account lên Git (đã có trong `.gitignore`).

## Deploy lên Vercel

1. Import repo vào [Vercel](https://vercel.com/new).
2. Thêm toàn bộ biến môi trường trong `.env.example` vào *Settings → Environment Variables* (để `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`, đặt `NEXT_PUBLIC_SITE_URL` là tên miền thật).
3. Deploy. Sau đó vào Firebase Console → Authentication → *Settings → Authorized domains*, thêm tên miền Vercel để đăng nhập Google hoạt động.

## Lệnh hữu ích

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` / `npm start` | Build và chạy bản production |
| `npm run lint` / `npm run typecheck` | Kiểm tra code |
| `npm run emulators` | Chạy Firebase Emulator, lưu dữ liệu vào `emulator-data/` khi tắt |
| `npm run seed` | Tạo dữ liệu mẫu (bỏ qua nếu đã có sản phẩm) |
| `npm run set-admin -- email [--revoke]` | Cấp hoặc thu hồi quyền admin |
| `npm run test:rules` | Chạy test Security Rules trên Emulator |
| `npm run deploy:rules` | Đưa Firestore/Storage rules và index lên Firebase |

## Cấu trúc thư mục

```
src/
  app/
    (shop)/          Trang khách: trang chủ, sản phẩm, giỏ hàng, thanh toán, đơn hàng, tài khoản
    admin/           Trang quản trị
    api/orders/      API đặt hàng (Firebase Admin SDK)
  components/        UI dùng chung, shop/, admin/
  config/store.ts    Cấu hình cửa hàng
  context/           Auth, giỏ hàng, thông báo
  lib/               Firebase, truy cập dữ liệu, kiểu dữ liệu, định dạng tiền
firestore.rules, storage.rules, firestore.indexes.json
scripts/             seed, set-admin
tests/               Test Security Rules
```

## Mô hình dữ liệu (Firestore)

| Collection | Trường chính |
| --- | --- |
| `users/{uid}` | email, displayName, phone, role (`customer` \| `admin`), createdAt |
| `categories/{id}` | name, slug, description, sortOrder |
| `products/{id}` | name, slug, sku, description, price, salePrice, images[], categoryId, stock, featured, active |
| `orders/{id}` | userId, userEmail, items[], subtotal, shippingFee, total, status, paymentMethod, shipping{fullName, phone, address, note} |

## Giới hạn hiện tại

- Lọc và tìm kiếm sản phẩm chạy phía trình duyệt, phù hợp cửa hàng vài trăm đến vài nghìn sản phẩm. Lớn hơn nên chuyển sang Algolia/Typesense hoặc phân trang Firestore.
- Chỉ có thanh toán COD; có thể bổ sung VNPay/MoMo qua API route.
- Ảnh đã upload nhưng không lưu sản phẩm sẽ còn trên Storage.
