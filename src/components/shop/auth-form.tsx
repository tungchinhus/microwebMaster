"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Card, ErrorMessage } from "@/components/ui/misc";
import { authErrorMessage, useAuth } from "@/context/auth-context";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "/";
  // Chỉ cho phép chuyển hướng nội bộ để tránh open redirect.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  const { user, loading, login, register, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, next, router]);

  const run = async (fn: () => Promise<void>) => {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  };

  const isLogin = mode === "login";
  const otherHref = `${isLogin ? "/register" : "/login"}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <Card className="mx-auto w-full max-w-md space-y-5 p-6 sm:p-8">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">{isLogin ? "Đăng nhập" : "Tạo tài khoản"}</h1>
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Chào mừng bạn quay lại." : "Đăng ký để đặt hàng và theo dõi đơn."}
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => (isLogin ? login(email, password) : register(name.trim(), email, password)));
        }}
      >
        {!isLogin && (
          <Field label="Họ và tên" htmlFor="name">
            <Input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        )}
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Mật khẩu" htmlFor="password" hint={isLogin ? undefined : "Ít nhất 6 ký tự"}>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button type="submit" className="w-full" loading={busy}>
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </Button>
      </form>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <hr className="flex-1" /> hoặc <hr className="flex-1" />
      </div>
      <Button variant="outline" className="w-full" disabled={busy} onClick={() => run(loginWithGoogle)}>
        Tiếp tục với Google
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
        <Link href={otherHref} className="font-medium text-primary hover:underline">
          {isLogin ? "Đăng ký" : "Đăng nhập"}
        </Link>
      </p>
    </Card>
  );
}
