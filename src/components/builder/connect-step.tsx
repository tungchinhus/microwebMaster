"use client";

import { Bot, ClipboardPaste, ExternalLink, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { Button, Field, Input, SecretInput, Select, StepCard, Textarea } from "@/components/ui";
import { FIREBASE_FIELDS, parseFirebaseConfig } from "@/lib/firebase-config";
import { GEMINI_MODELS } from "@/lib/site-types";
import { useBuilderStore } from "@/store/builder-store";

const CUSTOM = "__custom__";

function ModeToggle() {
  const mode = useBuilderStore((s) => s.config.mode);
  const setMode = useBuilderStore((s) => s.setMode);
  const options = [
    { id: "ai" as const, icon: Bot, title: "AI viết toàn bộ (Gemini)", text: "Gemini viết giao diện và logic theo theme, Web Master ghép khung dự án Vite + React." },
    { id: "template" as const, icon: LayoutTemplate, title: "Template đã kiểm thử", text: "Xuất ngay bản TechZone (Next.js) đã chạy thử, thay thông tin shop của bạn. Không cần API Key." },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map(({ id, icon: Icon, title, text }) => (
        <button
          key={id}
          type="button"
          aria-pressed={mode === id}
          onClick={() => setMode(id)}
          className={`rounded-xl border p-4 text-left transition ${mode === id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
        >
          <Icon className="mb-2 size-5 text-primary" />
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-xs text-muted-foreground">{text}</p>
        </button>
      ))}
    </div>
  );
}

function GeminiSettings() {
  const ai = useBuilderStore((s) => s.config.ai);
  const update = useBuilderStore((s) => s.updateAi);
  const [advanced, setAdvanced] = useState(Boolean(ai.baseUrl));
  const known = GEMINI_MODELS.some((m) => m.id === ai.model);
  const [custom, setCustom] = useState(!known);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
      <Field
        label="Gemini API Key *"
        htmlFor="gemini-key"
        hint={
          <>
            Lấy miễn phí tại{" "}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline">
              Google AI Studio <ExternalLink className="size-3" />
            </a>
            . Key chỉ được gửi thẳng từ trình duyệt của bạn tới Google, không qua máy chủ Web Master.
          </>
        }
      >
        <SecretInput id="gemini-key" placeholder="AIza..." value={ai.geminiApiKey} onChange={(e) => update({ geminiApiKey: e.target.value })} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-primary" checked={ai.rememberKey} onChange={(e) => update({ rememberKey: e.target.checked })} />
        Nhớ key trên trình duyệt này (lưu trong localStorage)
      </label>
      <Field label="Model" htmlFor="gemini-model">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            id="gemini-model"
            value={custom ? CUSTOM : ai.model}
            onChange={(e) => {
              const v = e.target.value;
              setCustom(v === CUSTOM);
              if (v !== CUSTOM) update({ model: v });
            }}
          >
            {GEMINI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
            <option value={CUSTOM}>Model khác...</option>
          </Select>
          {custom && (
            <Input aria-label="Tên model" placeholder="gemini-..." value={ai.model} onChange={(e) => update({ model: e.target.value.trim() })} className="font-mono" />
          )}
        </div>
      </Field>
      <button type="button" className="text-xs font-medium text-muted-foreground hover:text-foreground" onClick={() => setAdvanced((a) => !a)}>
        {advanced ? "Ẩn" : "Hiện"} cài đặt nâng cao
      </button>
      {advanced && (
        <Field label="Gemini API base URL" htmlFor="gemini-base" hint="Để trống để dùng https://generativelanguage.googleapis.com. Dùng khi đi qua proxy riêng.">
          <Input id="gemini-base" placeholder="https://generativelanguage.googleapis.com" value={ai.baseUrl} onChange={(e) => update({ baseUrl: e.target.value })} />
        </Field>
      )}
    </div>
  );
}

function FirebaseSettings() {
  const firebase = useBuilderStore((s) => s.config.firebase);
  const update = useBuilderStore((s) => s.updateFirebase);
  const [paste, setPaste] = useState("");
  const [pasteMessage, setPasteMessage] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Cấu hình Firebase</h3>
        <p className="text-xs text-muted-foreground">
          Firebase Console → Project settings → Your apps → Web app → SDK setup. Có thể bỏ trống và điền sau trong file .env.
        </p>
      </div>
      <div className="space-y-2">
        <Textarea
          aria-label="Dán cấu hình Firebase"
          rows={3}
          className="font-mono text-xs"
          placeholder={'Dán đoạn "const firebaseConfig = { apiKey: ..., ... }" hoặc JSON vào đây'}
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!paste.trim()}
            onClick={() => {
              const parsed = parseFirebaseConfig(paste);
              if (!parsed) {
                setPasteMessage("Không đọc được cấu hình, hãy kiểm tra lại.");
                return;
              }
              update(parsed);
              setPaste("");
              setPasteMessage(`Đã điền ${Object.keys(parsed).length}/6 trường.`);
            }}
          >
            <ClipboardPaste className="size-3.5" /> Tự điền từ đoạn đã dán
          </Button>
          {pasteMessage && <span className="text-xs text-muted-foreground">{pasteMessage}</span>}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIREBASE_FIELDS.map(({ key, label, placeholder }) => (
          <Field key={key} label={label} htmlFor={`fb-${key}`}>
            <Input
              id={`fb-${key}`}
              className="font-mono text-xs"
              placeholder={placeholder}
              value={firebase[key]}
              onChange={(e) => update({ [key]: e.target.value.trim() })}
              spellCheck={false}
            />
          </Field>
        ))}
      </div>
    </div>
  );
}

export function ConnectStep() {
  const mode = useBuilderStore((s) => s.config.mode);
  return (
    <StepCard step={4} title="Cách tạo mã nguồn & kết nối" description="Chọn AI hoặc template, rồi nhập API Key và cấu hình Firebase.">
      <div className="space-y-5">
        <ModeToggle />
        {mode === "ai" && <GeminiSettings />}
        <FirebaseSettings />
      </div>
    </StepCard>
  );
}
