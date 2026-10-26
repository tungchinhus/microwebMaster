import { Loader2, PackageOpen } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export function Spinner({ label = "Đang tải..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground" role="status">
      <Loader2 className="size-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <PackageOpen className="size-10 text-muted-foreground" />
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-xl border border-border bg-card ${className}`}>{children}</div>;
}

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  confirmed: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  shipping: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  cancelled: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
      {children}
    </div>
  );
}
