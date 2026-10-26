/**
 * Gọi Google Cloud / Firebase REST API bằng access token OAuth của người dùng.
 * `apiBase` (tùy chọn) thay toàn bộ host https://*.googleapis.com bằng một proxy,
 * ví dụ khi kiểm thử hoặc khi trình duyệt bị chặn CORS.
 */

export class GoogleApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly reason?: string,
  ) {
    super(message);
  }
}

export interface ApiOptions {
  token: string;
  apiBase?: string;
}

export function resolveUrl(url: string, apiBase?: string): string {
  if (!apiBase?.trim()) return url;
  const u = new URL(url);
  // https://firebasehosting.googleapis.com/v1beta1/... -> {apiBase}/firebasehosting/v1beta1/...
  const service = u.hostname.replace(".googleapis.com", "");
  return `${apiBase.replace(/\/$/, "")}/${service}${u.pathname}${u.search}`;
}

function explain(status: number, message: string): string {
  if (status === 401) return "Phiên đăng nhập Google đã hết hạn, hãy kết nối lại.";
  if (status === 403 && /has not been used|is disabled/i.test(message))
    return `API chưa được bật cho project: ${message}`;
  if (status === 403) return `Tài khoản Google không có quyền trên project này (${message}).`;
  return message;
}

export async function googleFetch<T = unknown>(
  url: string,
  { token, apiBase }: ApiOptions,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }
  let res: Response;
  try {
    res = await fetch(resolveUrl(url, apiBase), { ...init, headers, body });
  } catch {
    throw new GoogleApiError(`Không kết nối được ${new URL(url).hostname} (mạng hoặc CORS).`, 0);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message: string = data?.error?.message ?? `HTTP ${res.status}`;
    throw new GoogleApiError(explain(res.status, message), res.status, data?.error?.status);
  }
  return data as T;
}

interface Operation {
  name: string;
  done?: boolean;
  error?: { message: string };
  response?: unknown;
}

/** Chờ một long-running operation của Google hoàn tất. */
export async function waitOperation<T>(
  opUrl: string,
  opts: ApiOptions,
  { timeoutMs = 120_000 }: { timeoutMs?: number } = {},
): Promise<T> {
  const start = Date.now();
  for (let delay = 1000; ; delay = Math.min(delay * 1.5, 5000)) {
    const op = await googleFetch<Operation>(opUrl, opts);
    if (op.done) {
      if (op.error) throw new GoogleApiError(op.error.message, 500);
      return op.response as T;
    }
    if (Date.now() - start > timeoutMs) throw new GoogleApiError("Google xử lý quá lâu, hãy thử lại.", 504);
    await new Promise((r) => setTimeout(r, delay));
  }
}
