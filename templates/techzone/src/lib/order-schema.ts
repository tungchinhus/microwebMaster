import { z } from "zod";

const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

export const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(100),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(phoneRegex, "Số điện thoại không hợp lệ")),
  address: z.string().trim().min(10, "Vui lòng nhập địa chỉ đầy đủ").max(300),
  note: z.string().trim().max(500).optional().default(""),
});

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(128),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Giỏ hàng trống")
    .max(50),
  shipping: shippingSchema,
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
