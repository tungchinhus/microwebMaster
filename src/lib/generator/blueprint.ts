/**
 * Bản thiết kế dự án được sinh ra. Web Master cố định danh sách file và "hợp đồng" export
 * của từng file, để các lần gọi Gemini khác nhau vẫn khớp với nhau khi ghép lại.
 */

export interface FileSpec {
  path: string;
  exports: string;
  description: string;
}

export interface Batch {
  id: string;
  label: string;
  files: FileSpec[];
}

export const BATCHES: Batch[] = [
  {
    id: "core",
    label: "Kết nối Firebase, dữ liệu và trạng thái",
    files: [
      {
        path: "src/lib/firebase.js",
        exports: "export const app, auth, db, storage",
        description:
          "Khởi tạo Firebase app từ import.meta.env.VITE_FIREBASE_* (API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID). Dùng getApps() để không khởi tạo hai lần.",
      },
      {
        path: "src/lib/format.js",
        exports:
          "export function formatPrice(number): string; export function formatDate(millis|null): string; export function effectivePrice(product): number; export function slugify(string): string; export function calcShippingFee(subtotal): number; export const ORDER_STATUS_LABELS (object map status -> nhãn tiếng Việt); export const ORDER_STATUSES (mảng 5 trạng thái theo thứ tự)",
        description:
          "formatPrice dùng Intl.NumberFormat(storeConfig.locale, currency storeConfig.currency, không số lẻ). effectivePrice trả salePrice nếu có và nhỏ hơn price. slugify bỏ dấu tiếng Việt (kể cả đ/Đ). calcShippingFee: 0 nếu subtotal <= 0 hoặc >= storeConfig.freeShippingThreshold, ngược lại storeConfig.shippingFee. Nhãn trạng thái: pending 'Chờ xác nhận', confirmed 'Đã xác nhận', shipping 'Đang giao', completed 'Hoàn thành', cancelled 'Đã hủy'.",
      },
      {
        path: "src/services/products.js",
        exports:
          "export async function listActiveProducts(): Product[]; export async function listAllProducts(): Product[]; export async function getProduct(id): Product|null; export async function createProduct(data): string(id); export async function updateProduct(id, data); export async function deleteProduct(id); export async function uploadProductImage(file: File): string(url)",
        description:
          "Dùng collection 'products'. listActiveProducts: where('active','==',true) + orderBy('createdAt','desc'). Hàm chuyển đổi snapshot -> Product phải đổi Timestamp sang millis (createdAt, updatedAt). createProduct/updateProduct thêm serverTimestamp() cho createdAt/updatedAt. uploadProductImage tải lên Storage đường dẫn products/{crypto.randomUUID()}.{ext} rồi trả getDownloadURL. getProduct bắt lỗi permission-denied và trả null.",
      },
      {
        path: "src/services/categories.js",
        exports:
          "export async function listCategories(): Category[]; export async function createCategory(data): string; export async function updateCategory(id, data); export async function deleteCategory(id)",
        description: "Collection 'categories', sắp xếp orderBy('sortOrder','asc'). createCategory thêm createdAt serverTimestamp().",
      },
      {
        path: "src/services/orders.js",
        exports:
          "export async function placeOrder({ user, items: [{productId, quantity}], shipping: {fullName, phone, address, note} }): string(orderId); export async function listMyOrders(uid): Order[]; export async function listAllOrders(): Order[]; export async function getOrder(id): Order|null; export async function updateOrderStatus(orderId, status)",
        description:
          "placeOrder dùng runTransaction: đọc từng product, báo lỗi tiếng Việt nếu không còn bán hoặc thiếu tồn kho, tính giá bằng effectivePrice từ dữ liệu Firestore (không tin giá từ giỏ hàng), trừ stock bằng tx.update(ref, { stock: current - quantity }), tạo doc orders mới (doc(collection(db,'orders'))) với status 'pending', paymentMethod 'cod', subtotal, shippingFee = calcShippingFee(subtotal), total, userId, userEmail, items[{productId,name,image,price,quantity}], shipping, createdAt/updatedAt serverTimestamp(). listMyOrders: where('userId','==',uid) + orderBy('createdAt','desc'). updateOrderStatus dùng runTransaction; nếu chuyển sang 'cancelled' từ trạng thái chưa hủy thì cộng lại stock cho từng sản phẩm còn tồn tại; không cho đổi đơn đã hủy.",
      },
      {
        path: "src/context/AuthContext.jsx",
        exports:
          "export function AuthProvider({children}); export function useAuth(): { user, profile, loading, isAdmin, login(email,password), register(name,email,password), loginWithGoogle(), logout() }",
        description:
          "Theo dõi onAuthStateChanged. Khi có user, đọc users/{uid}; nếu chưa có thì tạo { email, displayName, phone: '', role: 'customer', createdAt: serverTimestamp() }. isAdmin = profile.role === 'admin'. register gọi createUserWithEmailAndPassword rồi updateProfile(displayName) và tạo profile. Đăng nhập Google bằng signInWithPopup + GoogleAuthProvider. Export thêm function authErrorMessage(error): string dịch mã lỗi Firebase Auth phổ biến sang tiếng Việt.",
      },
      {
        path: "src/context/CartContext.jsx",
        exports:
          "export function CartProvider({children}); export function useCart(): { items: CartItem[], count, subtotal, add(product, quantity=1), setQuantity(productId, quantity), remove(productId), clear() }",
        description:
          "CartItem = { productId, name, image, price, quantity, stock }. Lưu vào localStorage key 'cart:v1' (bọc try/catch), khởi tạo state bằng lazy initializer đọc localStorage. Số lượng luôn trong khoảng 1..min(stock, 99). add() cộng dồn nếu sản phẩm đã có.",
      },
    ],
  },
  {
    id: "layout",
    label: "Khung giao diện và component dùng chung",
    files: [
      {
        path: "src/App.jsx",
        exports: "export default function App()",
        description:
          "Khai báo <Routes> (BrowserRouter đã có ở main.jsx). Layout cửa hàng (Header + <Outlet/> + Footer) cho: '/' Home, '/products' Products, '/products/:id' ProductDetail, '/cart' Cart, '/checkout' Checkout (bọc ProtectedRoute), '/login' Login, '/register' Register, '/orders' MyOrders (bọc ProtectedRoute), '/orders/:id' OrderDetail (bọc ProtectedRoute). Khu admin '/admin' bọc <ProtectedRoute admin> và AdminLayout với route con: index AdminDashboard, 'products' AdminProducts, 'products/new' AdminProductForm, 'products/:id' AdminProductForm, 'orders' AdminOrders, 'orders/:id' AdminOrderDetail, 'categories' AdminCategories. Route '*' hiển thị trang 404 đơn giản. Import mặc định từ đúng đường dẫn các file trong bản thiết kế.",
      },
      {
        path: "src/components/Header.jsx",
        exports: "export default function Header()",
        description:
          "Thanh trên cùng sticky: logo chữ cái đầu + storeConfig.name, link Trang chủ/Sản phẩm, ô tìm kiếm (submit -> navigate('/products?q=...')), nút ThemeToggle, icon giỏ hàng kèm badge useCart().count, menu tài khoản (Đăng nhập nếu chưa; nếu đã đăng nhập: Đơn hàng của tôi, Trang quản trị nếu isAdmin, Đăng xuất). Responsive: trên mobile ô tìm kiếm xuống dòng thứ hai.",
      },
      {
        path: "src/components/Footer.jsx",
        exports: "export default function Footer()",
        description: "Ba cột: giới thiệu shop (storeConfig.description), link mua sắm, thông tin liên hệ storeConfig.contact. Dòng bản quyền.",
      },
      {
        path: "src/components/ThemeToggle.jsx",
        exports: "export default function ThemeToggle()",
        description:
          "Nút đổi Sáng/Tối: toggle class 'dark' trên document.documentElement và lưu localStorage key 'theme' ('light'|'dark'). Icon Sun/Moon từ lucide-react. (Script trong index.html đã áp theme trước khi React chạy.)",
      },
      {
        path: "src/components/ProductCard.jsx",
        exports: "export default function ProductCard({ product }); export function PriceTag({ product, large })",
        description:
          "Thẻ sản phẩm: ảnh vuông object-cover (ảnh đầu tiên hoặc khung placeholder), badge % giảm giá, nhãn 'Hết hàng' khi stock <= 0, tên (line-clamp-2) link tới /products/:id, PriceTag (giá hiệu lực màu primary, giá gốc gạch ngang nếu giảm), nút thêm vào giỏ (gọi useCart().add và hiện thông báo nhỏ).",
      },
      {
        path: "src/components/ProtectedRoute.jsx",
        exports: "export default function ProtectedRoute({ children, admin = false })",
        description:
          "Khi useAuth().loading hiện spinner. Chưa đăng nhập -> <Navigate to={'/login?next=' + encodeURIComponent(location.pathname)} replace/>. admin=true mà không phải admin -> <Navigate to='/' replace/>.",
      },
      {
        path: "src/components/ui.jsx",
        exports:
          "export function Button({ variant='primary'|'outline'|'ghost'|'danger', size='sm'|'md'|'lg', loading, className, ...props }); export function Input(props); export function Textarea(props); export function Select(props); export function Field({ label, htmlFor, error, hint, children }); export function Spinner({ label }); export function EmptyState({ title, description, action }); export function Card({ className, children }); export function OrderStatusBadge({ status })",
        description: "Bộ component giao diện dùng chung theo phong cách theme đã chọn. Button có trạng thái loading (icon Loader2 quay).",
      },
    ],
  },
  {
    id: "storefront",
    label: "Các trang cửa hàng",
    files: [
      {
        path: "src/pages/Home.jsx",
        exports: "export default function Home()",
        description:
          "Hero theo theme (storeConfig.name, storeConfig.slogan, nút Mua sắm ngay), dải 3 lợi ích (giao hàng, chính hãng, đổi trả), chip danh mục (link /products?category=id), lưới 'Sản phẩm nổi bật' (featured) và 'Hàng mới về' (8 sản phẩm mới nhất). Skeleton khi đang tải, thông báo lỗi khi tải thất bại.",
      },
      {
        path: "src/pages/Products.jsx",
        exports: "export default function Products()",
        description:
          "Đọc useSearchParams: q, category, sort (newest|price-asc|price-desc|name), inStock=1. Sidebar danh mục + checkbox còn hàng, select sắp xếp, đếm số kết quả. Tìm kiếm không dấu bằng slugify. Lọc/sắp xếp phía client. Hiện 12 sản phẩm, nút 'Xem thêm'.",
      },
      {
        path: "src/pages/ProductDetail.jsx",
        exports: "export default function ProductDetail()",
        description:
          "useParams().id -> getProduct. Breadcrumb, gallery ảnh (ảnh lớn + thumbnail), tên, SKU, PriceTag large, tồn kho, chọn số lượng (+/-), nút 'Thêm vào giỏ' và 'Mua ngay' (thêm rồi navigate('/cart')), mô tả (whitespace-pre-line). Không tìm thấy hoặc inactive -> EmptyState.",
      },
      {
        path: "src/pages/Cart.jsx",
        exports: "export default function Cart()",
        description:
          "Danh sách dòng giỏ hàng (ảnh, tên, đơn giá, +/- số lượng, thành tiền, xóa), khung tóm tắt (tạm tính, phí ship theo calcShippingFee, gợi ý mua thêm để miễn phí ship, tổng), nút 'Tiến hành đặt hàng' tới /checkout. Giỏ trống -> EmptyState.",
      },
      {
        path: "src/pages/Checkout.jsx",
        exports: "export default function Checkout()",
        description:
          "Form giao hàng (họ tên, số điện thoại VN regex /^(0|\\+84)[0-9]{9,10}$/ sau khi bỏ khoảng trắng, địa chỉ >= 10 ký tự, ghi chú), hiển thị lỗi từng ô bằng tiếng Việt, phương thức COD, tóm tắt đơn. Submit gọi placeOrder({ user, items, shipping }), thành công thì clear() giỏ và navigate('/orders/' + id + '?success=1'), lỗi thì hiện thông báo.",
      },
      {
        path: "src/pages/Login.jsx",
        exports: "export default function Login()",
        description:
          "Form email/mật khẩu + nút 'Tiếp tục với Google', link sang /register. Sau khi đăng nhập chuyển tới tham số ?next (chỉ chấp nhận đường dẫn bắt đầu bằng '/' và không bắt đầu bằng '//'), mặc định '/'. Nếu đã đăng nhập thì chuyển hướng ngay. Lỗi dùng authErrorMessage.",
      },
      {
        path: "src/pages/Register.jsx",
        exports: "export default function Register()",
        description: "Giống Login nhưng thêm ô Họ tên và gọi register(name, email, password). Mật khẩu tối thiểu 6 ký tự.",
      },
      {
        path: "src/pages/MyOrders.jsx",
        exports: "export default function MyOrders()",
        description: "Danh sách đơn của người dùng hiện tại (mã 8 ký tự đầu viết hoa, ngày, số sản phẩm, OrderStatusBadge, tổng tiền), mỗi dòng link /orders/:id. Chưa có đơn -> EmptyState.",
      },
      {
        path: "src/pages/OrderDetail.jsx",
        exports: "export default function OrderDetail()",
        description:
          "Chi tiết đơn: nếu ?success=1 hiện banner 'Đặt hàng thành công!'. Danh sách sản phẩm, tạm tính/phí ship/tổng, thông tin giao hàng, trạng thái. Đơn không tồn tại hoặc không có quyền -> EmptyState.",
      },
    ],
  },
  {
    id: "admin",
    label: "Trang quản trị",
    files: [
      {
        path: "src/pages/admin/AdminLayout.jsx",
        exports: "export default function AdminLayout()",
        description:
          "Sidebar (Tổng quan /admin, Đơn hàng, Sản phẩm, Danh mục, link 'Xem cửa hàng'), highlight mục đang mở bằng NavLink, sidebar thành drawer trên mobile (nút Menu). Header có ThemeToggle, tên admin, Đăng xuất. Nội dung qua <Outlet/>.",
      },
      {
        path: "src/pages/admin/AdminDashboard.jsx",
        exports: "export default function AdminDashboard()",
        description:
          "Tải listAllOrders + listAllProducts. 4 thẻ thống kê: doanh thu (tổng total của đơn completed), số đơn không bị hủy kèm số đơn chờ xác nhận, số sản phẩm/đang bán, số đơn hôm nay. Biểu đồ cột doanh thu 7 ngày gần nhất vẽ bằng div (không thêm thư viện, bỏ đơn đã hủy). Danh sách sắp hết hàng (stock <= 5). Bảng 8 đơn mới nhất link tới /admin/orders/:id.",
      },
      {
        path: "src/pages/admin/AdminProducts.jsx",
        exports: "export default function AdminProducts()",
        description:
          "Bảng sản phẩm (ảnh nhỏ, tên + SKU, danh mục, giá, tồn kho tô màu khi thấp, checkbox Đang bán cập nhật ngay bằng updateProduct). Ô tìm kiếm, lọc danh mục, lọc trạng thái (đang bán/đã ẩn/hết hàng). Nút 'Thêm sản phẩm' tới /admin/products/new. Tên link tới /admin/products/:id.",
      },
      {
        path: "src/pages/admin/AdminProductForm.jsx",
        exports: "export default function AdminProductForm()",
        description:
          "Dùng chung cho thêm mới (không có :id) và sửa (có :id, tải bằng getProduct). Trường: tên, SKU, mô tả, giá, giá khuyến mãi (phải nhỏ hơn giá), tồn kho (số nguyên >= 0), danh mục (select từ listCategories), đang bán, nổi bật. Quản lý ảnh: upload nhiều ảnh (chỉ image/*, <= 5MB, tối đa 10) bằng uploadProductImage, xem trước, xóa, đặt làm ảnh đầu. Lưu: slug = slugify(name), salePrice null nếu trống; sau đó navigate('/admin/products'). Khi sửa có nút Xóa (confirm).",
      },
      {
        path: "src/pages/admin/AdminOrders.jsx",
        exports: "export default function AdminOrders()",
        description:
          "Tab lọc theo trạng thái kèm số lượng, ô tìm theo mã đơn/tên/SĐT/email (không dấu). Bảng: mã đơn link /admin/orders/:id, khách (tên + SĐT), ngày đặt, OrderStatusBadge, tổng tiền.",
      },
      {
        path: "src/pages/admin/AdminOrderDetail.jsx",
        exports: "export default function AdminOrderDetail()",
        description:
          "Chi tiết đơn như trang khách, thêm khung 'Xử lý đơn' với các nút chuyển trạng thái hợp lệ: pending -> confirmed|cancelled, confirmed -> shipping|cancelled, shipping -> completed|cancelled; completed/cancelled không đổi được nữa. Hủy đơn cần confirm và nói rõ tồn kho được hoàn lại. Gọi updateOrderStatus rồi tải lại.",
      },
      {
        path: "src/pages/admin/AdminCategories.jsx",
        exports: "export default function AdminCategories()",
        description:
          "Bảng danh mục (tên, mô tả, thứ tự, số sản phẩm) và form bên cạnh để thêm/sửa (tên, mô tả, thứ tự). Không cho xóa danh mục còn sản phẩm. slug = slugify(name).",
      },
    ],
  },
];

export const AI_FILE_PATHS = BATCHES.flatMap((b) => b.files.map((f) => f.path));

export function findSpec(path: string): FileSpec | undefined {
  return BATCHES.flatMap((b) => b.files).find((f) => f.path === path);
}
