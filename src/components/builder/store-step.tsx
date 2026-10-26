"use client";

import { Field, Input, StepCard, Textarea } from "@/components/ui";
import { useBuilderStore } from "@/store/builder-store";

const SWATCHES = ["#6366F1", "#10B981", "#F43F5E", "#F59E0B", "#0EA5E9", "#B08D57", "#16A34A", "#111827"];

export function StoreStep() {
  const store = useBuilderStore((s) => s.config.store);
  const update = useBuilderStore((s) => s.updateStore);
  const validHex = /^#[0-9a-f]{6}$/i.test(store.primaryColor);

  return (
    <StepCard step={3} title="Thông tin cửa hàng" description="Hiển thị trên website và dùng để AI viết nội dung phù hợp.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên cửa hàng *" htmlFor="store-name">
          <Input id="store-name" placeholder="TechZone" value={store.name} onChange={(e) => update({ name: e.target.value })} />
        </Field>
        <Field label="Slogan" htmlFor="store-slogan">
          <Input id="store-slogan" placeholder="Cửa Hàng Công Nghệ" value={store.slogan} onChange={(e) => update({ slogan: e.target.value })} />
        </Field>
        <Field label="Mô tả ngắn" htmlFor="store-desc" className="sm:col-span-2">
          <Textarea
            id="store-desc"
            rows={2}
            placeholder="Điện thoại, laptop, phụ kiện chính hãng, giao hàng toàn quốc."
            value={store.description}
            onChange={(e) => update({ description: e.target.value })}
          />
        </Field>
        <Field label="Tông màu chủ đạo" htmlFor="store-color" className="sm:col-span-2" error={validHex ? undefined : "Mã màu dạng #RRGGBB"}>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="color"
              aria-label="Chọn màu"
              value={validHex ? store.primaryColor : "#6366f1"}
              onChange={(e) => update({ primaryColor: e.target.value.toUpperCase() })}
              className="size-10 cursor-pointer rounded-lg border border-border bg-card p-1"
            />
            <Input
              id="store-color"
              className="w-32 font-mono uppercase"
              value={store.primaryColor}
              onChange={(e) => update({ primaryColor: e.target.value.trim() })}
            />
            <div className="flex gap-1.5">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Màu ${c}`}
                  onClick={() => update({ primaryColor: c })}
                  className={`size-7 rounded-full border-2 ${store.primaryColor.toUpperCase() === c ? "border-foreground" : "border-transparent"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </Field>
        <Field label="Số điện thoại" htmlFor="store-phone">
          <Input id="store-phone" placeholder="0900 000 000" value={store.phone} onChange={(e) => update({ phone: e.target.value })} />
        </Field>
        <Field label="Email" htmlFor="store-email">
          <Input id="store-email" type="email" placeholder="hello@shop.vn" value={store.email} onChange={(e) => update({ email: e.target.value })} />
        </Field>
        <Field label="Địa chỉ" htmlFor="store-address" className="sm:col-span-2">
          <Input id="store-address" placeholder="123 Nguyễn Huệ, Quận 1, TP. HCM" value={store.address} onChange={(e) => update({ address: e.target.value })} />
        </Field>
        <Field
          label="Yêu cầu thêm cho AI (không bắt buộc)"
          htmlFor="store-extra"
          className="sm:col-span-2"
          hint="Ví dụ: shop bán cà phê, trang chủ có mục 'Câu chuyện của chúng tôi', nút liên hệ Zalo nổi."
        >
          <Textarea id="store-extra" rows={3} value={store.extraRequirements} onChange={(e) => update({ extraRequirements: e.target.value })} />
        </Field>
      </div>
    </StepCard>
  );
}
