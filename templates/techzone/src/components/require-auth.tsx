"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/misc";
import { useAuth } from "@/context/auth-context";

/** Chuyển về trang đăng nhập nếu chưa đăng nhập; `admin` yêu cầu thêm quyền quản trị. */
export function RequireAuth({ children, admin }: { children: React.ReactNode; admin?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = !!user && (!admin || isAdmin);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (admin && !isAdmin) router.replace("/");
  }, [loading, user, admin, isAdmin, router, pathname]);

  if (loading || !allowed) return <Spinner label="Đang kiểm tra đăng nhập..." />;
  return <>{children}</>;
}
