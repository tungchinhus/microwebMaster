"use client";

import { CheckCircle2, CircleDashed, CloudUpload, Copy, ExternalLink, Loader2, LogIn, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { Button, Card, Field, Input, SecretInput, Select } from "@/components/ui";
import { buildAndDeploy, STEP_LABELS, type DeployOutcome, type StepId, type StepStatus } from "@/lib/deploy";
import { grantAdmin, listProjects, type FirebaseProject } from "@/lib/deploy/firebase-project";
import { GOOGLE_CLIENT_ID, signInWithGoogle } from "@/lib/deploy/google-auth";
import { useBuilderStore } from "@/store/builder-store";

const LOCATIONS = [
  { id: "asia-southeast1", label: "Singapore (asia-southeast1)" },
  { id: "asia-east1", label: "Đài Loan (asia-east1)" },
  { id: "asia-northeast1", label: "Tokyo (asia-northeast1)" },
  { id: "us-central1", label: "Mỹ (us-central1)" },
  { id: "europe-west1", label: "Bỉ (europe-west1)" },
];

const STEPS = Object.keys(STEP_LABELS) as StepId[];
type StepState = Record<StepId, { status: StepStatus; detail?: string }>;
const initialSteps = (): StepState =>
  Object.fromEntries(STEPS.map((s) => [s, { status: "pending" as StepStatus }])) as StepState;

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "running") return <Loader2 className="size-4 animate-spin text-primary" />;
  if (status === "done") return <CheckCircle2 className="size-4 text-emerald-500" />;
  if (status === "error") return <XCircle className="size-4 text-red-500" />;
  return <CircleDashed className={`size-4 ${status === "skipped" ? "text-muted-foreground/40" : "text-muted-foreground"}`} />;
}

function GrantAdmin({ projectId, token, apiBase }: { projectId: string; token: string; apiBase: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ busy: boolean; message: string; ok: boolean }>({ busy: false, message: "", ok: false });
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Cấp quyền quản trị</div>
      <p className="text-xs text-muted-foreground">Đăng ký tài khoản trên website trước, rồi nhập email đó để mở được trang /admin.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input id="admin-email" type="email" placeholder="email@cua-ban.vn" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button
          variant="outline"
          loading={state.busy}
          disabled={!email.includes("@")}
          onClick={async () => {
            setState({ busy: true, message: "", ok: false });
            try {
              await grantAdmin(projectId, email, { token, apiBase });
              setState({ busy: false, message: `Đã cấp quyền admin cho ${email}. Tải lại website để thấy Trang quản trị.`, ok: true });
            } catch (err) {
              setState({ busy: false, message: (err as Error).message, ok: false });
            }
          }}
        >
          <ShieldCheck className="size-4" /> Cấp quyền admin
        </Button>
      </div>
      {state.message && <p className={`text-xs ${state.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>{state.message}</p>}
    </div>
  );
}

export function DeployPanel() {
  const result = useBuilderStore((s) => s.result);
  const config = useBuilderStore((s) => s.config);
  const deploy = useBuilderStore((s) => s.deploy);
  const updateDeploy = useBuilderStore((s) => s.updateDeploy);
  const updateResultFile = useBuilderStore((s) => s.updateResultFile);
  const updateFirebase = useBuilderStore((s) => s.updateFirebase);

  // Access token chỉ giữ trong bộ nhớ, không bao giờ lưu xuống trình duyệt.
  const [token, setToken] = useState("");
  const [manualToken, setManualToken] = useState(!GOOGLE_CLIENT_ID);
  const [projects, setProjects] = useState<FirebaseProject[] | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepState>(initialSteps);
  const [log, setLog] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<DeployOutcome | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(Boolean(deploy.apiBase));
  const [copied, setCopied] = useState(false);

  if (!result) return null;
  if (result.mode !== "ai") {
    return (
      <Card className="p-5 text-sm text-muted-foreground">
        <h2 className="mb-1 flex items-center gap-2 font-semibold text-foreground">
          <CloudUpload className="size-4 text-primary" /> Deploy lên Firebase
        </h2>
        Template TechZone có API đặt hàng chạy trên server nên cần Firebase App Hosting hoặc Vercel (xem README của template). Deploy tự động
        từ Web Master hỗ trợ website do AI tạo.
      </Card>
    );
  }

  const api = { token: token.trim(), apiBase: deploy.apiBase };

  const fetchProjects = async (accessToken: string) => {
    setLoadingProjects(true);
    setError("");
    try {
      const list = await listProjects({ token: accessToken, apiBase: deploy.apiBase });
      setProjects(list);
      const preferred = deploy.projectId || config.firebase.projectId;
      if (!list.some((p) => p.projectId === preferred)) updateDeploy({ projectId: list[0]?.projectId ?? "" });
      else if (!deploy.projectId) updateDeploy({ projectId: preferred });
      if (list.length === 0) setError("Tài khoản này chưa có project Firebase nào. Hãy tạo project trên Firebase Console rồi bấm tải lại.");
    } catch (err) {
      setProjects(null);
      setError((err as Error).message);
    } finally {
      setLoadingProjects(false);
    }
  };

  const connectGoogle = async () => {
    setError("");
    try {
      const t = await signInWithGoogle();
      setToken(t.accessToken);
      await fetchProjects(t.accessToken);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const run = async () => {
    setRunning(true);
    setError("");
    setOutcome(null);
    setSteps(initialSteps());
    setLog([]);
    try {
      const out = await buildAndDeploy(
        config,
        result.files,
        {
          projectId: deploy.projectId,
          api,
          setupFirestore: deploy.setupFirestore,
          firestoreLocation: deploy.firestoreLocation,
          deployRules: deploy.deployRules,
          autoFixRounds: deploy.autoFixRounds,
        },
        {
          onStep: (id, status, detail) => setSteps((s) => ({ ...s, [id]: { status, detail } })),
          onLog: (line) => setLog((l) => [...l, line]),
          onFileChange: updateResultFile,
        },
      );
      setOutcome(out);
      updateDeploy({ lastUrl: out.url });
      updateFirebase({ projectId: out.projectId });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const connected = projects !== null;

  return (
    <Card className="space-y-5 p-5">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <CloudUpload className="size-4 text-primary" /> Deploy lên Firebase của bạn
        </h2>
        <p className="text-sm text-muted-foreground">
          Web Master build website ngay trên trình duyệt, tạo Firestore, đưa Security Rules và website lên Firebase Hosting rồi trả link chạy
          ngay. Chưa có project? Tạo miễn phí tại{" "}
          <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline">
            Firebase Console <ExternalLink className="size-3" />
          </a>
          .
        </p>
      </div>

      {!connected ? (
        <div className="space-y-3">
          {GOOGLE_CLIENT_ID && (
            <Button onClick={connectGoogle} disabled={loadingProjects}>
              <LogIn className="size-4" /> Đăng nhập Google để chọn project
            </Button>
          )}
          {GOOGLE_CLIENT_ID && (
            <button type="button" className="block text-xs text-muted-foreground hover:text-foreground" onClick={() => setManualToken((m) => !m)}>
              {manualToken ? "Ẩn" : "Hoặc dán"} access token thủ công
            </button>
          )}
          {manualToken && (
            <Field
              label="Google access token"
              htmlFor="gcp-token"
              hint={
                <>
                  Chạy <code className="rounded bg-muted px-1">gcloud auth print-access-token</code> bằng tài khoản sở hữu project Firebase rồi dán vào
                  đây. Token chỉ giữ trong tab này.
                </>
              }
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <SecretInput id="gcp-token" placeholder="ya29...." value={token} onChange={(e) => setToken(e.target.value)} />
                </div>
                <Button variant="outline" loading={loadingProjects} disabled={!token.trim()} onClick={() => fetchProjects(token.trim())}>
                  Kết nối
                </Button>
              </div>
            </Field>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Project Firebase" htmlFor="deploy-project">
            <div className="flex gap-2">
              <Select id="deploy-project" value={deploy.projectId} onChange={(e) => updateDeploy({ projectId: e.target.value })} disabled={running}>
                {projects.map((p) => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.displayName} ({p.projectId})
                  </option>
                ))}
              </Select>
              <Button variant="outline" aria-label="Tải lại danh sách project" onClick={() => fetchProjects(api.token)} disabled={running || loadingProjects}>
                <RefreshCw className={`size-4 ${loadingProjects ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-primary" checked={deploy.setupFirestore} onChange={(e) => updateDeploy({ setupFirestore: e.target.checked })} />
              Tạo Firestore và index nếu chưa có
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-primary" checked={deploy.deployRules} onChange={(e) => updateDeploy({ deployRules: e.target.checked })} />
              Đưa Security Rules lên
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={deploy.autoFixRounds > 0}
                onChange={(e) => updateDeploy({ autoFixRounds: e.target.checked ? 2 : 0 })}
              />
              Gemini tự sửa lỗi build
            </label>
          </div>
          {deploy.setupFirestore && (
            <Field label="Vị trí Firestore (chỉ dùng khi tạo mới, không đổi được sau này)" htmlFor="deploy-location">
              <Select id="deploy-location" value={deploy.firestoreLocation} onChange={(e) => updateDeploy({ firestoreLocation: e.target.value })}>
                {LOCATIONS.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </Select>
            </Field>
          )}
          <Button size="lg" className="w-full" loading={running} disabled={!deploy.projectId} onClick={run}>
            <CloudUpload className="size-5" /> Build & Deploy lên {deploy.projectId || "Firebase"}
          </Button>
        </div>
      )}

      <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowAdvanced((a) => !a)}>
        {showAdvanced ? "Ẩn" : "Hiện"} cài đặt nâng cao
      </button>
      {showAdvanced && (
        <Field label="Google API proxy" htmlFor="gcp-base" hint="Để trống để gọi thẳng *.googleapis.com. Dùng khi cần đi qua proxy riêng.">
          <Input id="gcp-base" placeholder="https://proxy.example.com" value={deploy.apiBase} onChange={(e) => updateDeploy({ apiBase: e.target.value.trim() })} />
        </Field>
      )}

      {(running || outcome || steps.config.status !== "pending") && (
        <ol className="space-y-2">
          {STEPS.map((id) => (
            <li key={id} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5"><StepIcon status={steps[id].status} /></span>
              <div className="min-w-0">
                <div className={steps[id].status === "skipped" ? "text-muted-foreground line-through" : ""}>{STEP_LABELS[id]}</div>
                {steps[id].detail && <div className="break-words text-xs text-muted-foreground">{steps[id].detail}</div>}
              </div>
            </li>
          ))}
        </ol>
      )}

      {error && (
        <div className="whitespace-pre-wrap rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {log.length > 0 && (
        <details className="rounded-lg bg-muted/60 p-3 text-xs">
          <summary className="cursor-pointer font-medium">Nhật ký build ({log.length})</summary>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-muted-foreground">{log.join("\n")}</pre>
        </details>
      )}

      {outcome && (
        <div className="space-y-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="size-5" /> Website đã chạy trên Firebase!
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <a href={outcome.url} target="_blank" rel="noreferrer" className="truncate font-mono text-base font-semibold text-primary hover:underline">
              {outcome.url}
            </a>
            <div className="flex gap-2 sm:ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(outcome.url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                <Copy className="size-3.5" /> {copied ? "Đã copy" : "Copy link"}
              </Button>
              <a href={outcome.url} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground">
                Mở website <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
          {outcome.fixedFiles.length > 0 && (
            <p className="text-xs text-muted-foreground">Gemini đã tự sửa: {outcome.fixedFiles.join(", ")}.</p>
          )}
          <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {outcome.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <GrantAdmin projectId={outcome.projectId} token={api.token} apiBase={deploy.apiBase} />
        </div>
      )}
    </Card>
  );
}
