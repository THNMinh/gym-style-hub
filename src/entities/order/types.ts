export interface CartLine {
  cartItemId: string;
  variantId: string;
  productId: string;
  slug: string;
  productName: string;
  sku: string;
  colorName: string;
  size: string;
  unitPrice: number;
  originalPrice: number | null;
  imageUrl: string;
  quantity: number;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Packing"
  | "Shipping"
  | "Delivered"
  | "Cancelled";

export type PaymentMethod = "COD" | "Card" | "Momo" | "VNPay";
export type PaymentStatus = "Unpaid" | "Paid" | "Refunded";

export interface OrderItem {
  orderItemId: string;
  variantId: string;
  sku: string;
  productName: string;
  colorName: string;
  size: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderTracking {
  trackingId: string;
  status: OrderStatus;
  title: string;
  description: string | null;
  location: string | null;
  timestamp: string;
}

export interface Order {
  orderId: string;
  orderCode: string;
  userId: string | null;
  shippingAddress: string;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  currentStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerNote: string | null;
  createdAt: string;
  items: OrderItem[];
  tracking: OrderTracking[];
}

export interface Coupon {
  couponId: string;
  code: string;
  discountType: "Percent" | "Fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  isActive: boolean;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  Pending: "Chờ xác nhận",
  Confirmed: "Đã xác nhận",
  Packing: "Đang đóng gói",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Cancelled: "Đã huỷ",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng",
  Card: "Thẻ tín dụng / ghi nợ",
  Momo: "Ví MoMo",
  VNPay: "VNPay QR",
};
