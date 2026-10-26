import type { FirebaseWebConfig } from "../types";
import { GoogleApiError, googleFetch, waitOperation, type ApiOptions } from "./google-api";

const FIREBASE = "https://firebase.googleapis.com/v1beta1";
const FIRESTORE = "https://firestore.googleapis.com/v1";
const RULES = "https://firebaserules.googleapis.com/v1";

export interface FirebaseProject {
  projectId: string;
  displayName: string;
  resources?: { hostingSite?: string; storageBucket?: string };
}

export async function listProjects(opts: ApiOptions): Promise<FirebaseProject[]> {
  const all: FirebaseProject[] = [];
  let pageToken = "";
  do {
    const data = await googleFetch<{ results?: FirebaseProject[]; nextPageToken?: string }>(
      `${FIREBASE}/projects?pageSize=100${pageToken ? `&pageToken=${pageToken}` : ""}`,
      opts,
    );
    all.push(...(data.results ?? []));
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);
  return all.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getProject(projectId: string, opts: ApiOptions): Promise<FirebaseProject> {
  return googleFetch<FirebaseProject>(`${FIREBASE}/projects/${projectId}`, opts);
}

/** Lấy cấu hình Web App của project; tạo Web App mới nếu project chưa có. */
export async function getOrCreateWebConfig(projectId: string, displayName: string, opts: ApiOptions): Promise<FirebaseWebConfig> {
  const list = await googleFetch<{ apps?: { appId: string; state?: string }[] }>(
    `${FIREBASE}/projects/${projectId}/webApps`,
    opts,
  );
  let appId = list.apps?.find((a) => a.state !== "DELETED")?.appId;
  if (!appId) {
    const op = await googleFetch<{ name: string }>(`${FIREBASE}/projects/${projectId}/webApps`, opts, {
      method: "POST",
      json: { displayName: displayName.slice(0, 50) || "Web Master" },
    });
    const app = await waitOperation<{ appId: string }>(`${FIREBASE}/${op.name}`, opts);
    appId = app.appId;
  }
  const c = await googleFetch<Partial<FirebaseWebConfig>>(`${FIREBASE}/projects/${projectId}/webApps/${appId}/config`, opts);
  return {
    apiKey: c.apiKey ?? "",
    authDomain: c.authDomain ?? `${projectId}.firebaseapp.com`,
    projectId: c.projectId ?? projectId,
    storageBucket: c.storageBucket ?? "",
    messagingSenderId: c.messagingSenderId ?? "",
    appId: c.appId ?? appId,
  };
}

/** Tạo Cloud Firestore (default) nếu project chưa có. Trả về true nếu vừa tạo. */
export async function ensureFirestore(projectId: string, locationId: string, opts: ApiOptions): Promise<boolean> {
  try {
    await googleFetch(`${FIRESTORE}/projects/${projectId}/databases/(default)`, opts);
    return false;
  } catch (err) {
    if (!(err instanceof GoogleApiError) || err.status !== 404) throw err;
  }
  const op = await googleFetch<{ name: string }>(`${FIRESTORE}/projects/${projectId}/databases?databaseId=(default)`, opts, {
    method: "POST",
    json: { locationId, type: "FIRESTORE_NATIVE" },
  });
  await waitOperation(`${FIRESTORE}/${op.name}`, opts, { timeoutMs: 180_000 });
  return true;
}

/** Tạo index Firestore; bỏ qua nếu đã tồn tại. */
export async function ensureIndexes(
  projectId: string,
  indexes: { collectionGroup: string; queryScope: string; fields: { fieldPath: string; order: string }[] }[],
  opts: ApiOptions,
): Promise<void> {
  for (const idx of indexes) {
    try {
      await googleFetch(
        `${FIRESTORE}/projects/${projectId}/databases/(default)/collectionGroups/${idx.collectionGroup}/indexes`,
        opts,
        { method: "POST", json: { queryScope: idx.queryScope, fields: idx.fields } },
      );
    } catch (err) {
      if (!(err instanceof GoogleApiError) || err.status !== 409) throw err;
    }
  }
}

/** Đưa Security Rules lên và gắn vào Firestore (cloud.firestore) hoặc Storage (firebase.storage/<bucket>). */
export async function releaseRules(projectId: string, releaseId: string, fileName: string, source: string, opts: ApiOptions) {
  const ruleset = await googleFetch<{ name: string }>(`${RULES}/projects/${projectId}/rulesets`, opts, {
    method: "POST",
    json: { source: { files: [{ name: fileName, content: source }] } },
  });
  const name = `projects/${projectId}/releases/${releaseId}`;
  try {
    await googleFetch(`${RULES}/${name}`, opts, { method: "PATCH", json: { release: { name, rulesetName: ruleset.name } } });
  } catch (err) {
    if (!(err instanceof GoogleApiError) || err.status !== 404) throw err;
    await googleFetch(`${RULES}/projects/${projectId}/releases`, opts, { method: "POST", json: { name, rulesetName: ruleset.name } });
  }
}

/** Đặt role "admin" cho tài khoản đã đăng ký trên website (tìm theo email trong users). */
export async function grantAdmin(projectId: string, email: string, opts: ApiOptions): Promise<void> {
  const base = `${FIRESTORE}/projects/${projectId}/databases/(default)/documents`;
  const rows = await googleFetch<{ document?: { name: string } }[]>(`${base}:runQuery`, opts, {
    method: "POST",
    json: {
      structuredQuery: {
        from: [{ collectionId: "users" }],
        where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email.trim() } } },
        limit: 1,
      },
    },
  });
  const doc = rows.find((r) => r.document)?.document;
  if (!doc) throw new GoogleApiError(`Chưa có tài khoản ${email}. Hãy đăng ký trên website trước.`, 404);
  await googleFetch(`${FIRESTORE}/${doc.name}?updateMask.fieldPaths=role`, opts, {
    method: "PATCH",
    json: { fields: { role: { stringValue: "admin" } } },
  });
}

/**
 * Bật đăng nhập Email/Password. Chỉ thành công khi Authentication đã được khởi tạo
 * (bấm "Get started" một lần trong Firebase Console); trả về false nếu chưa.
 */
export async function enableEmailSignIn(projectId: string, opts: ApiOptions): Promise<boolean> {
  try {
    await googleFetch(
      `https://identitytoolkit.googleapis.com/v2/projects/${projectId}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired`,
      opts,
      { method: "PATCH", json: { signIn: { email: { enabled: true, passwordRequired: true } } } },
    );
    return true;
  } catch {
    return false;
  }
}
