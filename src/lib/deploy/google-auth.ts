/**
 * Đăng nhập Google trên trình duyệt bằng Google Identity Services (token model) để lấy
 * access token có quyền quản lý Firebase. Cần NEXT_PUBLIC_GOOGLE_CLIENT_ID (OAuth client
 * loại "Web application", thêm origin của Web Master vào Authorized JavaScript origins).
 */

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const SCOPES = ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/firebase"].join(" ");

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GisWindow {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient(config: {
          client_id: string;
          scope: string;
          callback: (r: TokenResponse) => void;
          error_callback?: (e: { type: string; message?: string }) => void;
        }): { requestAccessToken(opts?: { prompt?: string }): void };
      };
    };
  };
}

let gisPromise: Promise<void> | null = null;
function loadGis(): Promise<void> {
  gisPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gisPromise = null;
      reject(new Error("Không tải được Google Sign-In."));
    };
    document.head.appendChild(s);
  });
  return gisPromise;
}

export interface GoogleToken {
  accessToken: string;
  expiresAt: number;
}

export async function signInWithGoogle(): Promise<GoogleToken> {
  if (!GOOGLE_CLIENT_ID) throw new Error("Web Master chưa cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
  await loadGis();
  const google = (window as unknown as GisWindow).google!;
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (r) => {
        if (r.error || !r.access_token) reject(new Error(r.error_description || r.error || "Đăng nhập Google thất bại."));
        else resolve({ accessToken: r.access_token, expiresAt: Date.now() + (r.expires_in ?? 3600) * 1000 });
      },
      error_callback: (e) => reject(new Error(e.type === "popup_closed" ? "Bạn đã đóng cửa sổ đăng nhập." : e.message || e.type)),
    });
    client.requestAccessToken({ prompt: "consent" });
  });
}
