"use client";

import { CheckCircle2, Send } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SITE } from "@/config/site";
import { PROJECTS, applyVariant, getCategory, getProject, variantsOf } from "@/lib/showcase/catalog";
import { DesktopPreview } from "./mini-site";

const PLANS = ["Cơ bản", "Doanh nghiệp", "Theo yêu cầu", "Chưa rõ, cần tư vấn"];
const field =
  "w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-[15px] outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15";

export function QuoteForm() {
  const params = useSearchParams();
  const [template, setTemplate] = useState(getProject(params.get("mau") ?? "")?.slug ?? "");
  const [plan, setPlan] = useState(PLANS.includes(params.get("goi") ?? "") ? params.get("goi")! : PLANS[0]);
  const [variantId, setVariantId] = useState(params.get("giao-dien") ?? "");
  const [sent, setSent] = useState(false);
  const project = getProject(template);
  const variants = project ? variantsOf(project) : [];
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const lines = [
      `Họ tên: ${data.get("name")}`,
      `Điện thoại: ${data.get("phone")}`,
      `Email: ${data.get("email") || "(không có)"}`,
      `Mẫu quan tâm: ${project ? `${project.name} (${getCategory(project.category)?.name})` : "Chưa chọn"}`,
      `Giao diện: ${variant ? variant.name : "Chưa chọn"}`,
      `Gói: ${plan}`,
      "",
      `${data.get("message") || ""}`,
    ];
    const subject = `Yêu cầu báo giá website${project ? ` - mẫu ${project.name}` : ""}`;
    window.location.assign(`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-[28px] border border-border/60 bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h2 className="mt-4 text-2xl font-bold">Đã soạn sẵn email yêu cầu</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          Ứng dụng email của bạn đã mở với nội dung điền sẵn, chỉ cần bấm Gửi. Nếu không thấy, gửi trực tiếp tới{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="font-medium text-foreground underline">
            {SITE.contactEmail}
          </a>
          {SITE.zaloPhone && <> hoặc nhắn Zalo {SITE.zaloPhone}</>}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {SITE.zaloPhone && (
            <a href={`https://zalo.me/${SITE.zaloPhone}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground">
              Nhắn Zalo
            </a>
          )}
          <Link href="/kho" className="inline-flex h-12 items-center rounded-full border border-border px-6 font-semibold hover:bg-muted">
            Xem thêm mẫu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={submit} className="grid gap-4 rounded-[28px] border border-border/60 bg-card p-6 sm:grid-cols-2 sm:p-8">
        <label className="space-y-2">
          <span className="text-sm font-medium">Họ tên *</span>
          <input name="name" required className={field} placeholder="Nguyễn Văn A" autoComplete="name" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Số điện thoại / Zalo *</span>
          <input name="phone" required className={field} placeholder="09xx xxx xxx" inputMode="tel" autoComplete="tel" />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" className={field} placeholder="ban@congty.vn" autoComplete="email" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Mẫu quan tâm</span>
          <select value={template} onChange={(e) => { setTemplate(e.target.value); setVariantId(""); }} className={field}>
            <option value="">Chưa chọn</option>
            {PROJECTS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} · {getCategory(p.category)?.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Giao diện</span>
          <select value={variant?.id ?? ""} onChange={(e) => setVariantId(e.target.value)} className={field} disabled={!project}>
            {project ? variants.map((v) => <option key={v.id} value={v.id}>{v.name}</option>) : <option value="">Chọn mẫu trước</option>}
          </select>
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Gói</span>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className={field}>
            {PLANS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Bạn cần web làm gì?</span>
          <textarea name="message" rows={5} className={field} placeholder="Ví dụ: shop mỹ phẩm khoảng 200 sản phẩm, cần thanh toán chuyển khoản và quản lý đơn." />
        </label>
        <button type="submit" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground transition hover:brightness-110 sm:col-span-2">
          <Send className="size-5" /> Gửi yêu cầu báo giá
        </button>
        <p className="text-sm text-muted-foreground sm:col-span-2">Chúng tôi phản hồi trong ngày làm việc. Không gửi quảng cáo.</p>
      </form>

      <aside className="space-y-4 lg:sticky lg:top-28">
        {project ? (
          <>
            <div className="overflow-hidden rounded-3xl shadow-xl shadow-black/10 ring-1 ring-black/5">
              <DesktopPreview project={applyVariant(project, variant?.id)} />
            </div>
            <div>
              <div className="text-xl font-semibold">
                {project.name} <span className="font-normal text-muted-foreground">· {variant?.name}</span>
              </div>
              <p className="text-muted-foreground">{project.summary}</p>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-border p-8 text-muted-foreground">
            Chưa chọn mẫu? Không sao, mô tả nhu cầu và chúng tôi gợi ý mẫu phù hợp.{" "}
            <Link href="/kho" className="font-medium text-foreground underline underline-offset-4">
              Xem kho mẫu
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
