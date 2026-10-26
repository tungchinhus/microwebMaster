import { BuildError, buildSite } from "../build/builder";
import { regenerateFile } from "../generator";
import { findSpec } from "../generator/blueprint";
import type { BuilderConfig, FirebaseWebConfig, GeneratedFile } from "../types";
import { enableEmailSignIn, ensureFirestore, ensureIndexes, getOrCreateWebConfig, getProject, releaseRules } from "./firebase-project";
import type { ApiOptions } from "./google-api";
import { deployToHosting, getDefaultSite } from "./hosting";

export type StepId = "config" | "build" | "database" | "rules" | "hosting";
export type StepStatus = "pending" | "running" | "done" | "skipped" | "error";

export const STEP_LABELS: Record<StepId, string> = {
  config: "Lấy cấu hình Firebase Web App",
  build: "Build website",
  database: "Chuẩn bị Cloud Firestore",
  rules: "Đưa Security Rules lên",
  hosting: "Tải lên Firebase Hosting",
};

export interface DeployOptions {
  projectId: string;
  api: ApiOptions;
  setupFirestore: boolean;
  firestoreLocation: string;
  deployRules: boolean;
  /** Số vòng tự gửi lỗi build cho Gemini sửa (0 để tắt). */
  autoFixRounds: number;
}

export interface DeployCallbacks {
  onStep: (id: StepId, status: StepStatus, detail?: string) => void;
  onLog: (line: string) => void;
  /** Ghi lại file đã đổi (cấu hình .env, file AI vừa sửa) vào kết quả đang xem. */
  onFileChange: (path: string, content: string) => void;
}

export interface DeployOutcome {
  url: string;
  projectId: string;
  fixedFiles: string[];
  notes: string[];
}

function envContent(c: FirebaseWebConfig): string {
  return `# Cấu hình Firebase Web App (Web Master tự lấy khi deploy)
VITE_FIREBASE_API_KEY=${c.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${c.authDomain}
VITE_FIREBASE_PROJECT_ID=${c.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${c.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${c.messagingSenderId}
VITE_FIREBASE_APP_ID=${c.appId}
`;
}

export async function buildAndDeploy(
  config: BuilderConfig,
  initialFiles: GeneratedFile[],
  opts: DeployOptions,
  cb: DeployCallbacks,
): Promise<DeployOutcome> {
  let files = initialFiles.map((f) => ({ ...f }));
  const setFile = (path: string, content: string) => {
    files = files.map((f) => (f.path === path ? { ...f, content } : f));
    cb.onFileChange(path, content);
  };
  const notes: string[] = [];
  const fixedFiles: string[] = [];
  const { projectId, api } = opts;
  let step: StepId = "config";

  try {
    // 1. Cấu hình Web App: luôn lấy từ chính project được chọn để website kết nối đúng chỗ.
    cb.onStep("config", "running");
    const project = await getProject(projectId, api);
    const webConfig = await getOrCreateWebConfig(projectId, config.store.name, api);
    setFile(".env", envContent(webConfig));
    const emailAuth = await enableEmailSignIn(projectId, api);
    cb.onStep("config", "done", `${project.displayName} (${projectId})`);

    // 2. Build, tự nhờ Gemini sửa file lỗi nếu được phép.
    step = "build";
    cb.onStep("build", "running");
    let built;
    for (let round = 0; ; round++) {
      try {
        built = await buildSite(files, cb.onLog);
        break;
      } catch (err) {
        if (!(err instanceof BuildError)) throw err;
        const broken = [...new Set(err.issues.map((i) => i.file).filter((f): f is string => !!f && !!findSpec(f)))];
        cb.onLog(`Lỗi build:\n${err.message}`);
        if (round >= opts.autoFixRounds || broken.length === 0 || !config.ai.geminiApiKey.trim()) throw err;
        cb.onStep("build", "running", `Nhờ Gemini sửa ${broken.length} file (lần ${round + 1}/${opts.autoFixRounds})`);
        for (const path of broken) {
          const issues = err.issues.filter((i) => i.file === path).map((i) => `dòng ${i.line ?? "?"}: ${i.message}`);
          const current = files.find((f) => f.path === path)?.content ?? "";
          cb.onLog(`Gemini đang sửa ${path}...`);
          const fixed = await regenerateFile(config, path, current, `Sửa lỗi build sau, giữ nguyên chức năng:\n${issues.join("\n")}`);
          setFile(path, fixed);
          if (!fixedFiles.includes(path)) fixedFiles.push(path);
        }
      }
    }
    cb.onStep("build", "done", `${files.length} file nguồn → ${built.files.size} file deploy`);

    // 3. Firestore và index.
    step = "database";
    if (opts.setupFirestore) {
      cb.onStep("database", "running");
      const created = await ensureFirestore(projectId, opts.firestoreLocation, api);
      const indexFile = files.find((f) => f.path === "firestore.indexes.json");
      if (indexFile) await ensureIndexes(projectId, JSON.parse(indexFile.content).indexes ?? [], api);
      cb.onStep("database", "done", created ? `Đã tạo Firestore tại ${opts.firestoreLocation}` : "Firestore đã có sẵn");
    } else cb.onStep("database", "skipped");

    // 4. Security Rules.
    step = "rules";
    if (opts.deployRules) {
      cb.onStep("rules", "running");
      const fsRules = files.find((f) => f.path === "firestore.rules")?.content;
      if (fsRules) await releaseRules(projectId, "cloud.firestore", "firestore.rules", fsRules, api);
      const bucket = webConfig.storageBucket || project.resources?.storageBucket;
      const stRules = files.find((f) => f.path === "storage.rules")?.content;
      let detail = "Firestore";
      if (bucket && stRules) {
        try {
          await releaseRules(projectId, `firebase.storage/${bucket}`, "storage.rules", stRules, api);
          detail += " + Storage";
        } catch (err) {
          notes.push(`Chưa đưa được Storage Rules (${(err as Error).message}). Hãy bật Storage trong Firebase Console để upload ảnh sản phẩm.`);
        }
      } else {
        notes.push("Project chưa có Storage: tính năng upload ảnh sản phẩm cần bật Storage trong Firebase Console.");
      }
      cb.onStep("rules", "done", detail);
    } else cb.onStep("rules", "skipped");

    // 5. Hosting.
    step = "hosting";
    cb.onStep("hosting", "running");
    const site = await getDefaultSite(projectId, api);
    await deployToHosting(site.name, built.files, api, ({ uploaded, total }) =>
      cb.onStep("hosting", "running", total ? `Đã tải ${uploaded}/${total} file` : "Không có file mới cần tải"),
    );
    const url = site.defaultUrl || `https://${projectId}.web.app`;
    cb.onStep("hosting", "done", url);

    notes.push(
      emailAuth
        ? "Đã bật đăng nhập Email/Password. Muốn đăng nhập Google thì bật thêm trong Firebase Console > Authentication > Sign-in method."
        : "Chưa bật được đăng nhập: vào Firebase Console > Authentication, bấm Get started rồi bật Email/Password (và Google nếu muốn).",
    );
    return { url, projectId, fixedFiles, notes };
  } catch (err) {
    cb.onStep(step, "error", (err as Error).message);
    throw err;
  }
}
