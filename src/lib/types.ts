export type SiteTypeId = "ecommerce";
export type ThemeId = "modern-minimalist" | "tech-dark" | "elegant" | "vibrant" | "organic";
export type GenerationMode = "ai" | "template";

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface StoreInfo {
  name: string;
  slogan: string;
  description: string;
  primaryColor: string;
  phone: string;
  email: string;
  address: string;
  /** Yêu cầu thêm của người dùng gửi kèm cho AI (không bắt buộc). */
  extraRequirements: string;
}

export interface AiSettings {
  geminiApiKey: string;
  model: string;
  rememberKey: boolean;
  /** Để trống để dùng endpoint mặc định của Google. */
  baseUrl: string;
}

export interface BuilderConfig {
  siteType: SiteTypeId;
  theme: ThemeId;
  mode: GenerationMode;
  store: StoreInfo;
  firebase: FirebaseWebConfig;
  ai: AiSettings;
}

export interface GeneratedFile {
  path: string;
  /** Nội dung văn bản; với file nhị phân là chuỗi base64 (xem `encoding`). */
  content: string;
  encoding?: "base64";
  /** "ai": do Gemini viết; "static": khung dự án do Web Master tạo sẵn; "template": từ template đã kiểm thử. */
  source: "ai" | "static" | "template";
}

export interface GenerationResult {
  id: string;
  createdAt: number;
  mode: GenerationMode;
  model: string | null;
  storeName: string;
  files: GeneratedFile[];
  /** File AI không trả về hoặc bị lỗi sau khi đã thử lại. */
  missing: string[];
  setupSteps: string[];
}

export interface GenerationProgress {
  phase: "preparing" | "generating" | "finalizing" | "done" | "error";
  completedBatches: number;
  totalBatches: number;
  currentLabel: string;
  log: string[];
}
