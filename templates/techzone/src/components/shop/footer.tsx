import Link from "next/link";
import { storeConfig } from "@/config/store";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div className="space-y-2">
          <div className="text-base font-bold">{storeConfig.name}</div>
          <p className="text-muted-foreground">{storeConfig.description}</p>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Mua sắm</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link href="/products" className="hover:text-foreground">Tất cả sản phẩm</Link></li>
            <li><Link href="/cart" className="hover:text-foreground">Giỏ hàng</Link></li>
            <li><Link href="/orders" className="hover:text-foreground">Tra cứu đơn hàng</Link></li>
          </ul>
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Liên hệ</div>
          <ul className="space-y-1 text-muted-foreground">
            <li>{storeConfig.contact.address}</li>
            <li>Hotline: {storeConfig.contact.phone}</li>
            <li>Email: {storeConfig.contact.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {storeConfig.name}. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}
