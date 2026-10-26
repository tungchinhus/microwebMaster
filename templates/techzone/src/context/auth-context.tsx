"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { ensureUserProfile } from "@/lib/data/users";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null);
      return;
    }
    try {
      const p = await ensureUserProfile(u.uid, u.email ?? "", u.displayName ?? "");
      // Vừa được cấp quyền admin: làm mới token để nhận custom claim (cần cho upload ảnh).
      if (p.role === "admin" && !(await u.getIdTokenResult()).claims.admin) {
        await u.getIdToken(true);
      }
      setProfile(p);
    } catch (err) {
      console.error("Không tải được hồ sơ người dùng", err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      await loadProfile(u);
      setLoading(false);
    });
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === "admin",
      login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      register: async (name, email, password) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        // onAuthStateChanged có thể chạy trước khi tên được cập nhật, nên tạo hồ sơ ngay tại đây.
        setProfile(await ensureUserProfile(cred.user.uid, email, name));
      },
      loginWithGoogle: async () => {
        await signInWithPopup(auth, new GoogleAuthProvider());
      },
      logout: async () => {
        await signOut(auth);
      },
      refreshProfile: () => loadProfile(auth.currentUser),
    }),
    [user, profile, loading, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
}

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
  "auth/wrong-password": "Email hoặc mật khẩu không đúng.",
  "auth/user-not-found": "Email hoặc mật khẩu không đúng.",
  "auth/email-already-in-use": "Email này đã được đăng ký.",
  "auth/weak-password": "Mật khẩu phải có ít nhất 6 ký tự.",
  "auth/invalid-email": "Email không hợp lệ.",
  "auth/too-many-requests": "Bạn thử quá nhiều lần, vui lòng đợi một lát.",
  "auth/popup-closed-by-user": "Bạn đã đóng cửa sổ đăng nhập.",
};

export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  return AUTH_ERRORS[code] ?? "Đã có lỗi xảy ra, vui lòng thử lại.";
}
