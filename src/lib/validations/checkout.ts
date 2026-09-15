import { z } from "zod";

export const checkoutSchema = z.object({
  receiverName: z.string().min(2, "Vui lòng nhập tên người nhận (ít nhất 2 ký tự)"),
  phoneNumber: z
    .string()
    .min(9, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+-\s()]+$/, "Số điện thoại chỉ chứa các chữ số"),
  shippingAddress: z.string().min(5, "Vui lòng nhập địa chỉ giao hàng chi tiết (ít nhất 5 ký tự)"),
  ward: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  paymentMethod: z.enum(["COD", "MOMO"], {
    required_error: "Vui lòng chọn phương thức thanh toán",
  }),
  customerNote: z.string().max(500, "Ghi chú không quá 500 ký tự").optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export interface CheckoutItemRequest {
  variantId: string;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItemRequest[];
  shippingAddress: string;
  paymentMethod: "COD" | "MOMO";
  customerNote?: string;
}

export interface CheckoutResponseData {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  currentStatus: string;
  paymentStatus: string;
  paymentUrl: string | null;
}
