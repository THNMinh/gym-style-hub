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
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Confirmed"
  | "Packing"
  | "Shipping"
  | string;

export type PaymentMethod = "COD" | "Card" | "Momo" | "VNPay" | string;
export type PaymentStatus = "Unpaid" | "Paid" | "Refunded" | string;

export interface MyOrderItemDto {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  currentStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  totalItems: number;
  items?: OrderDetailItemDto[];
}

export interface MyOrdersPagedResponse {
  items: MyOrderItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OrderDetailItemDto {
  orderItemId: string;
  variantId: string;
  productId?: string;
  sku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string | null;
}

export interface OrderDetailDto {
  orderId: string;
  orderCode: string;
  userId: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  currentStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerNote: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderDetailItemDto[];
}

export interface OrderTrackingHistoryDto {
  trackingId: string;
  orderId: string;
  status: OrderStatus;
  title: string;
  description: string | null;
  location: string | null;
  timestamp: string;
  createdAt?: string;
}

export interface OrderItem {
  orderItemId: string;
  variantId: string;
  sku: string;
  productName: string;
  colorName?: string;
  size?: string;
  imageUrl?: string;
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

export const ORDER_STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Processing: "Đang đóng gói",
  Shipped: "Đang giao hàng",
  Delivered: "Đã giao hàng",
  Cancelled: "Đã hủy đơn",
  Confirmed: "Đã xác nhận",
  Packing: "Đang chuẩn bị",
  Shipping: "Đang giao hàng",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  Card: "Thẻ tín dụng / ghi nợ",
  Momo: "Ví MoMo",
  VNPay: "VNPay QR",
  VNPAY: "VNPay QR",
};
