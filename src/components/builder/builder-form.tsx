"use client";

import { Loader2 } from "lucide-react";
import { useHydrated } from "@/components/store-hydrator";
import { ConnectStep } from "./connect-step";
import { GeneratePanel } from "./generate-panel";
import { SiteTypeStep } from "./site-type-step";
import { StoreStep } from "./store-step";
import { ThemeStep } from "./theme-step";

export function BuilderForm() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Đang tải cấu hình...
      </div>
    );
  }
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <SiteTypeStep />
        <ThemeStep />
        <StoreStep />
        <ConnectStep />
      </div>
      <div className="lg:sticky lg:top-20">
        <GeneratePanel />
      </div>
    </div>
  );
}
