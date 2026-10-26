"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getTheme } from "@/lib/themes";
import type {
  AiSettings,
  BuilderConfig,
  FirebaseWebConfig,
  GenerationProgress,
  GenerationResult,
  StoreInfo,
  ThemeId,
} from "@/lib/types";

export const DEFAULT_CONFIG: BuilderConfig = {
  siteType: "ecommerce",
  theme: "modern-minimalist",
  mode: "ai",
  store: {
    name: "",
    slogan: "",
    description: "",
    primaryColor: getTheme("modern-minimalist").suggestedColor,
    phone: "",
    email: "",
    address: "",
    extraRequirements: "",
  },
  firebase: { apiKey: "", authDomain: "", projectId: "", storageBucket: "", messagingSenderId: "", appId: "" },
  ai: { geminiApiKey: "", model: "gemini-2.5-flash", rememberKey: false, baseUrl: "" },
};

export interface DeploySettings {
  projectId: string;
  firestoreLocation: string;
  setupFirestore: boolean;
  deployRules: boolean;
  autoFixRounds: number;
  /** Thay https://*.googleapis.com bằng proxy (để trống khi dùng bình thường). */
  apiBase: string;
  lastUrl: string;
}

export const DEFAULT_DEPLOY: DeploySettings = {
  projectId: "",
  firestoreLocation: "asia-southeast1",
  setupFirestore: true,
  deployRules: true,
  autoFixRounds: 2,
  apiBase: "",
  lastUrl: "",
};

interface BuilderState {
  deploy: DeploySettings;
  updateDeploy: (patch: Partial<DeploySettings>) => void;
  config: BuilderConfig;
  result: GenerationResult | null;
  progress: GenerationProgress | null;
  generating: boolean;
  setTheme: (theme: ThemeId) => void;
  setMode: (mode: BuilderConfig["mode"]) => void;
  updateStore: (patch: Partial<StoreInfo>) => void;
  updateFirebase: (patch: Partial<FirebaseWebConfig>) => void;
  updateAi: (patch: Partial<AiSettings>) => void;
  setProgress: (progress: GenerationProgress | null) => void;
  setGenerating: (generating: boolean) => void;
  setResult: (result: GenerationResult | null) => void;
  updateResultFile: (path: string, content: string) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      deploy: DEFAULT_DEPLOY,
      updateDeploy: (patch) => set((s) => ({ deploy: { ...s.deploy, ...patch } })),
      result: null,
      progress: null,
      generating: false,
      setTheme: (theme) =>
        set((s) => ({
          config: {
            ...s.config,
            theme,
            // Đổi theme thì gợi ý luôn màu của theme đó.
            store: { ...s.config.store, primaryColor: getTheme(theme).suggestedColor },
          },
        })),
      setMode: (mode) => set((s) => ({ config: { ...s.config, mode } })),
      updateStore: (patch) => set((s) => ({ config: { ...s.config, store: { ...s.config.store, ...patch } } })),
      updateFirebase: (patch) =>
        set((s) => ({ config: { ...s.config, firebase: { ...s.config.firebase, ...patch } } })),
      updateAi: (patch) => set((s) => ({ config: { ...s.config, ai: { ...s.config.ai, ...patch } } })),
      setProgress: (progress) => set({ progress }),
      setGenerating: (generating) => set({ generating }),
      setResult: (result) => set({ result }),
      updateResultFile: (path, content) =>
        set((s) =>
          s.result
            ? {
                result: {
                  ...s.result,
                  files: s.result.files.some((f) => f.path === path)
                    ? s.result.files.map((f) => (f.path === path ? { ...f, content } : f))
                    : [...s.result.files, { path, content, source: "ai" }],
                  missing: s.result.missing.filter((p) => p !== path),
                },
              }
            : s,
        ),
      reset: () => set({ config: DEFAULT_CONFIG, result: null, progress: null }),
    }),
    {
      name: "web-master:v1",
      storage: createJSONStorage(() => localStorage),
      // Chỉ đọc localStorage sau khi trang đã hydrate (xem StoreHydrator) để tránh lệch HTML.
      skipHydration: true,
      // API Key chỉ được lưu khi người dùng chọn "Nhớ key trên trình duyệt này".
      partialize: (s) => ({
        config: { ...s.config, ai: { ...s.config.ai, geminiApiKey: s.config.ai.rememberKey ? s.config.ai.geminiApiKey : "" } },
        result: s.result,
        deploy: s.deploy,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<BuilderState>;
        const c = p.config ?? DEFAULT_CONFIG;
        return {
          ...current,
          result: p.result ?? null,
          deploy: { ...DEFAULT_DEPLOY, ...p.deploy },
          config: {
            ...DEFAULT_CONFIG,
            ...c,
            store: { ...DEFAULT_CONFIG.store, ...c.store },
            firebase: { ...DEFAULT_CONFIG.firebase, ...c.firebase },
            ai: { ...DEFAULT_CONFIG.ai, ...c.ai },
          },
        };
      },
    },
  ),
);
