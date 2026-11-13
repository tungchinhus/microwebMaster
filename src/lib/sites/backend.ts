"use client";

/**
 * Nơi lưu web của khách hàng.
 * - Có đủ biến NEXT_PUBLIC_FIREBASE_*: dùng Firestore + Firebase Auth của chính Web Master.
 *   Quyền ghi do firestore.rules kiểm soát (chỉ tài khoản có trong collection admins).
 * - Không có: chế độ thử, lưu trong localStorage của trình duyệt này, cập nhật chéo tab qua sự kiện storage.
 *   Chế độ thử chỉ để trình diễn trên một máy, không có bảo mật thật.
 */

import type { CustomerSite, Submission } from "./types";
import { normalizeHero, normalizeProducts, normalizeRegions } from "./types";

export interface SessionUser {
  uid: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface SitesBackend {
  mode: "firebase" | "local";
  listSites(): Promise<CustomerSite[]>;
  /** Theo dõi một web; gọi lại mỗi khi có bản lưu mới. Trả về hàm huỷ theo dõi. */
  watchSite(id: string, cb: (site: CustomerSite | null) => void): () => void;
  saveSite(site: CustomerSite): Promise<void>;
  deleteSite(id: string): Promise<void>;
  addSubmission(siteId: string, s: Omit<Submission, "id" | "createdAt">): Promise<void>;
  listSubmissions(siteId: string): Promise<Submission[]>;
  watchUser(cb: (user: SessionUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  register(email: string, password: string, name: string): Promise<void>;
  signOut(): Promise<void>;
}

const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const FIREBASE_ENABLED = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.appId);

/** Mật khẩu admin của chế độ thử (đổi bằng NEXT_PUBLIC_DEMO_ADMIN_PASSWORD). */
export const DEMO_ADMIN_EMAIL = "admin@demo.local";
const DEMO_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "admin123";

function toSite(id: string, raw: Record<string, unknown>): CustomerSite {
  const num = (v: unknown) => (typeof v === "number" ? v : typeof (v as { toMillis?: () => number })?.toMillis === "function" ? (v as { toMillis: () => number }).toMillis() : 0);
  return {
    id,
    name: String(raw.name ?? ""),
    customer: String(raw.customer ?? ""),
    template: String(raw.template ?? ""),
    variant: String(raw.variant ?? ""),
    regions: normalizeRegions(raw.regions),
    products: normalizeProducts(raw.products),
    hero: normalizeHero(raw.hero),
    createdAt: num(raw.createdAt),
    updatedAt: num(raw.updatedAt),
    updatedBy: raw.updatedBy ? String(raw.updatedBy) : undefined,
  };
}

/* ------------------------------------------------------------- localStorage */

const LS_SITES = "wm-sites";
const LS_SUBS = "wm-site-submissions";
const LS_USERS = "wm-site-users";
const LS_SESSION = "wm-site-session";

function lsRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsWrite(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Bộ nhớ đầy hoặc bị chặn: bỏ qua, trang vẫn chạy với dữ liệu trong bộ nhớ.
  }
  // Sự kiện storage chỉ bắn sang tab khác; tab hiện tại tự báo.
  window.dispatchEvent(new CustomEvent("wm-local-change", { detail: key }));
}

function onLocalChange(key: string, cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => e.key === key && cb();
  const onSame = (e: Event) => (e as CustomEvent).detail === key && cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener("wm-local-change", onSame);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("wm-local-change", onSame);
  };
}

interface LocalUser {
  uid: string;
  email: string;
  name: string;
  password: string;
}

function localBackend(): SitesBackend {
  const sites = () => lsRead<Record<string, CustomerSite>>(LS_SITES, {});
  const currentUser = (): SessionUser | null => {
    const s = lsRead<SessionUser | null>(LS_SESSION, null);
    return s && s.uid ? s : null;
  };
  return {
    mode: "local",
    async listSites() {
      return Object.values(sites())
        .map((s) => toSite(s.id, s as unknown as Record<string, unknown>))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    },
    watchSite(id, cb) {
      const emit = () => {
        const s = sites()[id];
        cb(s ? toSite(id, s as unknown as Record<string, unknown>) : null);
      };
      emit();
      return onLocalChange(LS_SITES, emit);
    },
    async saveSite(site) {
      if (!currentUser()?.isAdmin) throw new Error("Chỉ admin mới lưu được.");
      lsWrite(LS_SITES, { ...sites(), [site.id]: site });
    },
    async deleteSite(id) {
      if (!currentUser()?.isAdmin) throw new Error("Chỉ admin mới xoá được.");
      const all = sites();
      delete all[id];
      lsWrite(LS_SITES, all);
    },
    async addSubmission(siteId, s) {
      const all = lsRead<Record<string, Submission[]>>(LS_SUBS, {});
      const item: Submission = { ...s, id: Math.random().toString(36).slice(2, 10), createdAt: Date.now() };
      lsWrite(LS_SUBS, { ...all, [siteId]: [item, ...(all[siteId] ?? [])] });
    },
    async listSubmissions(siteId) {
      return lsRead<Record<string, Submission[]>>(LS_SUBS, {})[siteId] ?? [];
    },
    watchUser(cb) {
      cb(currentUser());
      return onLocalChange(LS_SESSION, () => cb(currentUser()));
    },
    async signIn(email, password) {
      const e = email.trim().toLowerCase();
      if (e === DEMO_ADMIN_EMAIL) {
        if (password !== DEMO_ADMIN_PASSWORD) throw new Error("Sai mật khẩu.");
        lsWrite(LS_SESSION, { uid: "demo-admin", email: e, name: "Admin", isAdmin: true });
        return;
      }
      const u = lsRead<LocalUser[]>(LS_USERS, []).find((x) => x.email === e);
      if (!u || u.password !== password) throw new Error("Sai email hoặc mật khẩu.");
      lsWrite(LS_SESSION, { uid: u.uid, email: u.email, name: u.name, isAdmin: false });
    },
    async register(email, password, name) {
      const e = email.trim().toLowerCase();
      const users = lsRead<LocalUser[]>(LS_USERS, []);
      if (e === DEMO_ADMIN_EMAIL || users.some((x) => x.email === e)) throw new Error("Email này đã có tài khoản.");
      if (password.length < 6) throw new Error("Mật khẩu cần ít nhất 6 ký tự.");
      const u: LocalUser = { uid: Math.random().toString(36).slice(2, 10), email: e, name: name.trim() || e, password };
      lsWrite(LS_USERS, [...users, u]);
      lsWrite(LS_SESSION, { uid: u.uid, email: u.email, name: u.name, isAdmin: false });
    },
    async signOut() {
      lsWrite(LS_SESSION, null);
    },
  };
}

/* ----------------------------------------------------------------- Firebase */

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Sai email hoặc mật khẩu.",
  "auth/wrong-password": "Sai email hoặc mật khẩu.",
  "auth/user-not-found": "Sai email hoặc mật khẩu.",
  "auth/invalid-email": "Email không hợp lệ.",
  "auth/email-already-in-use": "Email này đã có tài khoản.",
  "auth/weak-password": "Mật khẩu cần ít nhất 6 ký tự.",
  "auth/too-many-requests": "Thử sai quá nhiều lần, vui lòng đợi một lát.",
  "auth/operation-not-allowed": "Chưa bật đăng nhập Email/Password trong Firebase Console.",
};

function authError(err: unknown): Error {
  const code = (err as { code?: string })?.code ?? "";
  return new Error(AUTH_ERRORS[code] ?? (err instanceof Error ? err.message : "Có lỗi, vui lòng thử lại."));
}

function firebaseBackend(): SitesBackend {
  // Nạp Firebase SDK khi cần, để trang giới thiệu không phải tải thêm.
  const sdk = (async () => {
    const [{ initializeApp, getApps }, fs, auth] = await Promise.all([import("firebase/app"), import("firebase/firestore"), import("firebase/auth")]);
    const app = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);
    return { fs, auth, db: fs.getFirestore(app), au: auth.getAuth(app) };
  })();

  return {
    mode: "firebase",
    async listSites() {
      const { fs, db } = await sdk;
      const snap = await fs.getDocs(fs.query(fs.collection(db, "customerSites"), fs.orderBy("updatedAt", "desc")));
      return snap.docs.map((d) => toSite(d.id, d.data()));
    },
    watchSite(id, cb) {
      let unsub: (() => void) | null = null;
      let cancelled = false;
      void sdk.then(({ fs, db }) => {
        if (cancelled) return;
        unsub = fs.onSnapshot(
          fs.doc(db, "customerSites", id),
          (d) => cb(d.exists() ? toSite(d.id, d.data()) : null),
          () => cb(null),
        );
      });
      return () => {
        cancelled = true;
        unsub?.();
      };
    },
    async saveSite(site) {
      const { fs, db } = await sdk;
      const { id, ...data } = site;
      await fs.setDoc(fs.doc(db, "customerSites", id), JSON.parse(JSON.stringify(data)));
    },
    async deleteSite(id) {
      const { fs, db } = await sdk;
      await fs.deleteDoc(fs.doc(db, "customerSites", id));
    },
    async addSubmission(siteId, s) {
      const { fs, db } = await sdk;
      await fs.addDoc(fs.collection(db, "customerSites", siteId, "submissions"), { ...JSON.parse(JSON.stringify(s)), createdAt: Date.now() });
    },
    async listSubmissions(siteId) {
      const { fs, db } = await sdk;
      const snap = await fs.getDocs(fs.query(fs.collection(db, "customerSites", siteId, "submissions"), fs.orderBy("createdAt", "desc"), fs.limit(100)));
      return snap.docs.map((d) => ({ ...(d.data() as Omit<Submission, "id">), id: d.id }));
    },
    watchUser(cb) {
      let unsub: (() => void) | null = null;
      let cancelled = false;
      void sdk.then(({ fs, db, auth, au }) => {
        if (cancelled) return;
        unsub = auth.onAuthStateChanged(au, async (u) => {
          if (!u) return cb(null);
          let isAdmin = false;
          try {
            isAdmin = (await fs.getDoc(fs.doc(db, "admins", u.uid))).exists();
          } catch {
            isAdmin = false;
          }
          cb({ uid: u.uid, email: u.email ?? "", name: u.displayName || u.email || "", isAdmin });
        });
      });
      return () => {
        cancelled = true;
        unsub?.();
      };
    },
    async signIn(email, password) {
      const { auth, au } = await sdk;
      try {
        await auth.signInWithEmailAndPassword(au, email.trim(), password);
      } catch (err) {
        throw authError(err);
      }
    },
    async register(email, password, name) {
      const { auth, au } = await sdk;
      try {
        const cred = await auth.createUserWithEmailAndPassword(au, email.trim(), password);
        if (name.trim()) await auth.updateProfile(cred.user, { displayName: name.trim() });
      } catch (err) {
        throw authError(err);
      }
    },
    async signOut() {
      const { auth, au } = await sdk;
      await auth.signOut(au);
    },
  };
}

let instance: SitesBackend | null = null;

export function getBackend(): SitesBackend {
  instance ??= FIREBASE_ENABLED ? firebaseBackend() : localBackend();
  return instance;
}
