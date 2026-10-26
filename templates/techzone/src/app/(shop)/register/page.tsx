import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/shop/auth-form";
import { Spinner } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Đăng ký" };

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
