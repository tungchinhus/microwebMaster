"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/context/toast-context";
import { updateMyProfile } from "@/lib/data/users";

function AccountForm() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <Card className="max-w-lg p-6">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await updateMyProfile(user!.uid, { displayName: displayName.trim(), phone: phone.trim() });
            await refreshProfile();
            toast("Đã lưu thông tin");
          } catch {
            toast("Không lưu được, vui lòng thử lại", "error");
          } finally {
            setSaving(false);
          }
        }}
      >
        <Field label="Email" htmlFor="email">
          <Input id="email" value={user?.email ?? ""} disabled />
        </Field>
        <Field label="Họ và tên" htmlFor="displayName">
          <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </Field>
        <Field label="Số điện thoại" htmlFor="phone" hint="Dùng để điền sẵn khi đặt hàng">
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Button type="submit" loading={saving}>
          Lưu thay đổi
        </Button>
      </form>
    </Card>
  );
}

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tài khoản</h1>
      <RequireAuth>
        <AccountForm />
      </RequireAuth>
    </div>
  );
}
