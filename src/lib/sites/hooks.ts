"use client";

import { useEffect, useState } from "react";
import { getBackend, type SessionUser } from "./backend";
import type { CustomerSite } from "./types";

/** Người đang đăng nhập; undefined khi chưa biết (đang tải). */
export function useSessionUser(): SessionUser | null | undefined {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  useEffect(() => getBackend().watchUser(setUser), []);
  return user;
}

/** Bản đã lưu mới nhất của một web, tự cập nhật khi admin lưu. undefined khi đang tải. */
export function useSite(id: string): CustomerSite | null | undefined {
  const [state, setState] = useState<{ id: string; site: CustomerSite | null } | null>(null);
  useEffect(() => {
    if (!id) return;
    return getBackend().watchSite(id, (site) => setState({ id, site }));
  }, [id]);
  if (!id) return null;
  return state?.id === id ? state.site : undefined;
}
