import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">Không tìm thấy trang</h1>
      <p className="text-sm text-muted-foreground">Trang bạn tìm có thể đã bị xóa hoặc đổi địa chỉ.</p>
      <ButtonLink href="/">Về trang chủ</ButtonLink>
    </main>
  );
}
