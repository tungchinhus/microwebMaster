# Web Master: tạo website bán hàng bằng Gemini

Web Master là bảng điều khiển cho phép chọn loại website, theme, nhập thông tin cửa hàng, **Gemini API Key** và cấu hình Firebase, rồi tự động tạo **toàn bộ mã nguồn** một website bán hàng (trang cửa hàng + trang quản trị) dùng React, Tailwind CSS và Firebase. Kết quả hiển thị dạng cây thư mục, xem code có tô màu cú pháp, copy từng file, tải về file `.zip`.

## Tính năng

- **Builder 4 bước:** loại website (giai đoạn 1: Web Bán hàng & Quản lý Sản phẩm), 5 theme có hình minh họa (Modern Minimalist, Tech Dark, Elegant, Vibrant Pop, Organic Nature), thông tin shop và màu chủ đạo, Gemini API Key (ẩn/hiện, tùy chọn ghi nhớ), cấu hình Firebase (nhập từng ô hoặc dán nguyên đoạn `const firebaseConfig = {...}` để tự điền).
- **Hai cách tạo mã nguồn:**
  - **AI viết toàn bộ (Gemini):** Gemini viết 30 file giao diện và logic theo một bản thiết kế cố định; Web Master tự tạo phần khung (package.json, Vite, Tailwind theme, Firebase rules, README) để dự án luôn cài đặt và build được.
  - **Template đã kiểm thử:** xuất ngay bản TechZone (Next.js 16 + Firebase) trong `templates/techzone`, đã chạy thử đầy đủ, chỉ thay thông tin cửa hàng và Firebase. Không cần API Key.
- **Bộ máy sinh code:** chia 30 file thành 12 lượt gọi (tối đa 3 file mỗi lượt, 2 lượt song song), ép Gemini trả JSON theo schema, tự thử lại khi lỗi 429/5xx, tự yêu cầu viết bổ sung file bị thiếu, thanh tiến độ và nhật ký từng bước, nút Hủy.
- **Màn hình kết quả:** nút **Chạy thử online** (StackBlitz), cây thư mục, code viewer có số dòng và highlight, Copy Code, tải từng file, **Download Code (.zip)**, **Viết lại bằng AI** từng file theo yêu cầu (ví dụ "thêm bộ lọc theo khoảng giá"), hướng dẫn chạy nhanh.
- **Bảo mật API Key:** trình duyệt gọi thẳng Gemini API bằng `@google/genai`, key không đi qua máy chủ Web Master. Key chỉ được lưu vào localStorage khi bạn tick "Nhớ key".

## Trang giới thiệu và kho mẫu

Trang chủ của Web Master là trang giới thiệu dịch vụ làm web theo mẫu:

- `/` hero có khung xem trước desktop + mobile đổi theo lĩnh vực, lưới lĩnh vực, mẫu tiêu biểu, quy trình, bảng giá, hỏi đáp.
- `/kho` kho mẫu, lọc theo lĩnh vực (`/kho?loai=giao-duc`).
- `/mau/<slug>` chi tiết từng mẫu, nút xin báo giá và (với mẫu có sẵn) tự tạo bằng AI.
- `/bao-gia` form xin báo giá: mở ứng dụng email với nội dung điền sẵn, kèm nút Zalo.
- `/demo/<slug>` xem demo toàn màn hình: đổi giao diện, đổi máy tính / điện thoại. Mẫu có `demoUrl` sẽ mở bản chạy thật trong khung, không có thì dùng bản xem trước.
- `/so-sanh?mau=a,b,c` so sánh 2 đến 3 mẫu cạnh nhau (chọn bằng nút "+ So sánh" trên thẻ mẫu).
- `/kho` có ô tìm kiếm không phân biệt dấu (`?q=`) và bộ lọc theo tính năng (`?tinh-nang=gio-hang,dat-lich`). Nhãn tính năng của từng mẫu khai báo trong `PROJECT_FEATURES`.
- `/tao-web` trình tạo web bằng AI (trước đây ở trang chủ).

Sửa tên thương hiệu, email, số Zalo, giá khởi điểm trong `src/config/site.ts`; thêm hoặc sửa mẫu và lĩnh vực trong `src/lib/showcase/catalog.ts`. Mỗi mẫu có sẵn 3 giao diện để khách chọn (Nguyên bản, Thanh lịch, Đêm), sinh tự động từ bảng màu gốc qua `variantsOf()`; thêm giao diện riêng bằng `extraVariants` của từng mẫu. Bản xem trước mỗi mẫu được vẽ bằng HTML/CSS theo bảng màu của mẫu (`src/components/showcase/mini-site.tsx`), không cần ảnh chụp.

## Web của khách hàng và chế độ chỉnh sửa của admin

Mỗi mẫu trong kho được ráp từ các **khối** (banner, điểm nổi bật, giới thiệu, con số, thư viện ảnh, kêu gọi hành động, hỏi đáp, cùng sản phẩm, đặt lịch... tuỳ lĩnh vực; bố cục từng lĩnh vực ở `src/lib/sites/layouts.ts`). Tạo web cho khách là chép bố cục đó vào vùng Nội dung; ở chế độ sửa admin kéo thả (hoặc bấm mũi tên) để sắp xếp, ẩn với khách, sửa chữ, xoá hoặc chèn lại khối. Khối của mẫu miễn phí, chỉ component mua thêm mới cộng vào báo giá. Web tạo trước đây tự được chuyển sang bố cục khối khi mở. Trang chi tiết mẫu có nút **Admin: tạo web cho khách từ mẫu này** khi đã đăng nhập admin.

Khi chào hàng: khách chọn mẫu và giao diện, thấy thiếu đăng nhập hay giỏ hàng thì admin thêm ngay trên trang và báo giá phần mua thêm.

1. Vào `/quan-tri`, đăng nhập admin, điền tên khách, chọn mẫu và giao diện, bấm **Tạo và mở chỉnh sửa**.
2. Web của khách mở ở `/site?id=<mã web>`. Admin thấy thanh đen trên cùng; bấm **Bật chỉnh sửa** để hiện các vùng: Trên banner, Đầu trang, Nội dung, Chân trang, Nút nổi.
3. Bấm **+ Thêm component** ở vùng muốn đặt và chọn từ thư viện: Đăng nhập khách hàng, Giỏ hàng, Tìm kiếm, Dải khuyến mãi, Danh sách sản phẩm, Đặt lịch, Form liên hệ, Đánh giá, Đăng ký nhận tin, Nút Zalo. Mỗi component có giá mua thêm; thanh admin cộng tổng. Di chuột vào component để đổi thứ tự, sửa nội dung (tiêu đề, mã giảm giá, số Zalo) hoặc gỡ. Đổi được cả giao diện và tên hiển thị.
4. Trên thanh admin: **Sản phẩm** để nhập sản phẩm, dịch vụ thật (tên, giá, link ảnh, mô tả; chưa nhập thì dùng sản phẩm mẫu), **Chữ banner** để đổi dòng thông báo, tiêu đề lớn và mô tả.
5. Bấm **Lưu**: chỉ web đó được cập nhật, và ai đang mở web đó thấy thay đổi ngay, không cần tải lại.

Trên điện thoại, banner đầu trang dùng bản HTML co giãn (`site-hero.tsx`) thay cho bản dựng thu nhỏ của mẫu.

Các component chạy thật: giỏ hàng thêm, bớt, đặt hàng COD; đăng nhập và đăng ký bằng email; form đặt lịch, liên hệ, nhận tin gửi về `/quan-tri` (nút **Đơn & yêu cầu** của từng web). Thêm component mới trong `src/lib/sites/components.ts` (khai báo) và `src/components/sites/site-blocks.tsx` (giao diện).

**Nơi lưu dữ liệu:**

- **Chế độ thử (mặc định):** không cần cấu hình, dữ liệu nằm trong localStorage của trình duyệt đang dùng, cập nhật chéo tab. Đăng nhập admin bằng `admin@demo.local`, mật khẩu `admin123` (đổi bằng biến `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD`). Chế độ này chỉ để trình diễn trên một máy, không có bảo mật thật và khách ở máy khác không thấy web.
- **Firebase (dùng thật):** tạo một project Firebase cho chính Web Master, bật Authentication (Email/Password) và Firestore, rồi đặt các biến sau trong `.env.local` (hoặc biến môi trường khi build):

  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=...
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
  NEXT_PUBLIC_FIREBASE_APP_ID=...
  ```

  Đưa luật bảo mật lên: `firebase deploy --only firestore:rules --project <project-id>` (file `firestore.rules` ở thư mục gốc). Tạo tài khoản admin trong Authentication, rồi trong Firestore tạo tài liệu `admins/<uid của tài khoản đó>` (nội dung tuỳ ý). Chỉ tài khoản có trong `admins` mới tạo, sửa, xoá web và đọc đơn hàng; khách chỉ xem web qua link và gửi form.

## Chạy Web Master ở máy local

Yêu cầu: Node.js 20 trở lên.

```bash
npm install
npm run dev          # mở http://localhost:3000
```

Lấy Gemini API Key miễn phí tại https://aistudio.google.com/apikey, dán vào bước 4 rồi bấm **Tự động tạo Website bằng AI**. Một lượt tạo thường mất 2 đến 5 phút với `gemini-2.5-flash`.

Build production: `npm run build && npm start`.

## Đưa Web Master lên mạng

Web Master chạy hoàn toàn trên trình duyệt (Gemini được gọi trực tiếp từ trình duyệt), nên host như một trang tĩnh là đủ.

- **GitHub Pages (tự động):** repo đã có workflow `.github/workflows/deploy-pages.yml`. Vào *Settings → Pages → Source: GitHub Actions* một lần; từ đó mỗi lần push lên `main`, trang được build lại tại `https://<tài-khoản>.github.io/<tên-repo>/`.
- **Vercel:** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tungchinhus/microwebMaster) (không cần biến môi trường).
- **Hosting tĩnh khác (Firebase Hosting, Netlify...):** `STATIC_EXPORT=1 npm run build`, rồi đưa thư mục `out/` lên. Nếu chạy trong thư mục con, đặt thêm `NEXT_PUBLIC_BASE_PATH=/ten-thu-muc`. Build trên Windows có bước `postbuild` (`scripts/fix-export-segments.mjs`) sửa tên file prefetch, nếu thiếu thì trình duyệt nhận 404 khi prefetch link.
- **Bản đang chạy (https://microwebmaster.web.app):** `firebase.json` và `.firebaserc` trỏ tới site `microwebmaster` của project `demobanhang-ab0da`. Deploy: `STATIC_EXPORT=1 npm run build` rồi `firebase deploy --only hosting`. Project này dùng chung Firestore với web bán hàng demo nên luật nằm ở `firestore.demobanhang.rules` (không phải `firestore.rules`); chỉ deploy luật bằng `firebase deploy --only firestore:rules` khi đã sửa file đó. Lưu ý: luật hiện mở đọc/ghi các collection của web demo tới hết 13/12/2026, sau ngày đó web demo bị chặn ghi.

## Deploy thẳng lên Firebase của người dùng

Ở màn hình kết quả (chế độ AI), khung **Deploy lên Firebase của bạn** làm trọn vòng: người dùng chỉ cần tạo một project trên [Firebase Console](https://console.firebase.google.com/), rồi Web Master tự:

1. Lấy (hoặc tạo) Web App của project và điền `.env`, bật đăng nhập Email/Password.
2. Build website **ngay trong trình duyệt** bằng esbuild-wasm và Tailwind. React, React Router, Firebase SDK và lucide-react được dựng sẵn ở `public/runtime/` (script `npm run build-runtime`, tự chạy trước `dev`/`build`). Nếu file do AI viết bị lỗi build, Gemini được nhờ sửa tự động (tối đa 2 vòng).
3. Tạo Cloud Firestore (nếu chưa có) và các index cần thiết.
4. Đưa Security Rules của Firestore và Storage lên.
5. Tải website lên Firebase Hosting (có SPA rewrite) và trả về link `https://<project>.web.app`.

Sau đó có ô **Cấp quyền admin** theo email để mở trang /admin.

**Đăng nhập Google:** Web Master cần một access token có quyền quản lý Firebase của chính người dùng.

- Cách tiện nhất: tạo *OAuth client ID* loại *Web application* trên [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), thêm tên miền của Web Master (ví dụ `https://tungchinhus.github.io`, `http://localhost:3000`) vào *Authorized JavaScript origins*, rồi đặt `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (file `.env.local` khi chạy local; biến repo `GOOGLE_CLIENT_ID` khi build bằng GitHub Pages). Nút "Đăng nhập Google" sẽ xuất hiện. Khi màn hình đồng ý của OAuth còn ở chế độ *Testing*, thêm email người dùng vào *Test users*.
- Không có client ID: dán token từ `gcloud auth print-access-token` (token hết hạn sau khoảng 1 giờ).

Token chỉ nằm trong bộ nhớ của tab, không lưu xuống trình duyệt. Project trên gói Spark (miễn phí) dùng được Hosting và Firestore; Storage cho project mới cần gói Blaze, nếu chưa có thì bước Storage rules được bỏ qua kèm ghi chú.

## Chạy thử website vừa tạo ngay trên trình duyệt

Ở màn hình kết quả, bấm **Chạy thử online**: mã nguồn được mở trên StackBlitz, nơi `npm install` và `npm run dev` chạy ngay trong trình duyệt (WebContainers), không cần cài Node trên máy. Đăng nhập Google của Firebase chỉ chạy khi bạn thêm tên miền StackBlitz vào *Authentication → Settings → Authorized domains*.

## Website được tạo ra (chế độ AI)

Dự án Vite + React 19 + react-router-dom + Tailwind CSS 4 + Firebase:

```
index.html, vite.config.js, package.json, .env (cấu hình Firebase đã điền)
firestore.rules, storage.rules, firestore.indexes.json, firebase.json, README.md
src/
  main.jsx, App.jsx, index.css (token màu theo theme), config/store.js
  lib/firebase.js, lib/format.js
  services/products.js, categories.js, orders.js
  context/AuthContext.jsx, CartContext.jsx
  components/Header, Footer, ThemeToggle, ProductCard, ProtectedRoute, ui
  pages/Home, Products, ProductDetail, Cart, Checkout, Login, Register, MyOrders, OrderDetail
  pages/admin/AdminLayout, AdminDashboard, AdminProducts, AdminProductForm, AdminOrders, AdminOrderDetail, AdminCategories
```

Chạy: `npm install`, `npm run dev`. Các bước bật Firebase và cấp quyền admin có trong README của dự án được tạo.

## Cấu trúc Web Master

```
src/
  app/page.tsx                 Builder (form cấu hình)
  app/result/page.tsx          Kết quả: cây thư mục, code viewer, tải .zip
  components/builder/          4 bước của form + bảng tóm tắt và tiến độ
  components/result/           FileTree, CodeViewer, ResultView
  lib/generator/blueprint.ts   Bản thiết kế 30 file và "hợp đồng" export của từng file
  lib/generator/prompt.ts      System prompt chuẩn hóa gửi Gemini
  lib/generator/gemini.ts      Gọi Gemini (JSON schema, thử lại, thông báo lỗi tiếng Việt)
  lib/generator/index.ts       generateWebsiteCode(config) và regenerateFile(...)
  lib/generator/static-files.ts Khung dự án tạo sẵn (package.json, theme CSS, rules...)
  lib/generator/template-mode.ts Xuất template TechZone
  lib/themes.ts                5 theme và mô tả phong cách gửi cho AI
  store/builder-store.ts       Zustand (lưu cấu hình và kết quả gần nhất)
templates/techzone/            Template Next.js + Firebase đã kiểm thử (dự án riêng, có README)
scripts/pack-template.mjs      Đóng gói template thành public/templates/techzone.json khi dev/build
```

## Muốn chỉnh

- **Thêm theme:** thêm một mục vào `THEMES` trong `src/lib/themes.ts` (màu xem trước + `promptGuide` mô tả phong cách).
- **Đổi yêu cầu kỹ thuật gửi AI:** sửa `src/lib/generator/prompt.ts` và mô tả từng file trong `blueprint.ts`.
- **Thêm model:** sửa `GEMINI_MODELS` trong `src/lib/site-types.ts`, hoặc chọn "Model khác..." ngay trên giao diện.
- **Proxy:** phần "cài đặt nâng cao" cho phép đổi base URL của Gemini API.

## Lưu ý

- Code do AI viết có thể còn lỗi nhỏ tùy model. Dùng nút **Viết lại bằng AI** cho file lỗi, hoặc chọn chế độ **Template đã kiểm thử** khi cần bản chắc chắn chạy được.
- Website tạo bằng AI đặt hàng trực tiếp từ trình duyệt; Security Rules chỉ cho khách tạo đơn của chính mình và chỉ được giảm tồn kho, nhưng không kiểm chứng tổng tiền. Template TechZone xử lý việc này trên server.
