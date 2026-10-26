"use client";

import { useCallback, useEffect, useState } from "react";

interface Settled<T> {
  key: string;
  version: number;
  data: T | undefined;
  error: Error | null;
}

/**
 * Chạy một hàm bất đồng bộ khi `key` đổi và trả về trạng thái tải.
 * Truyền `key = null` để tạm chưa chạy (ví dụ khi chưa có người dùng).
 */
export function useAsync<T>(fn: () => Promise<T>, key: string | null) {
  const [version, setVersion] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    fn().then(
      (data) => !cancelled && setSettled({ key, version, data, error: null }),
      (error: Error) => !cancelled && setSettled({ key, version, data: undefined, error }),
    );
    return () => {
      cancelled = true;
    };
    // fn thường là closure mới mỗi lần render; `key` quyết định khi nào tải lại.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);

  const sameKey = settled !== null && settled.key === key;
  const loading = key !== null && !(sameKey && settled.version === version);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback(
    (data: T) => setSettled((s) => (s ? { ...s, data } : s)),
    [],
  );

  return {
    // Khi tải lại cùng key thì vẫn giữ dữ liệu cũ để giao diện không bị nháy.
    data: sameKey ? settled.data : undefined,
    error: sameKey && !loading ? settled.error : null,
    loading,
    reload,
    setData,
  };
}
