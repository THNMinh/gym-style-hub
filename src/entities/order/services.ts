import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import type {
  CartLine,
  Coupon,
  Order,
  OrderStatus,
  PaymentMethod,
  MyOrdersPagedResponse,
  OrderDetailDto,
  OrderTrackingHistoryDto,
} from "./types";

export const MOCK_COUPONS: Coupon[] = [
  {
    couponId: "cp1",
    code: "GYM10",
    discountType: "Percent",
    discountValue: 10,
    minOrderValue: 500_000,
    maxDiscountAmount: 300_000,
    isActive: true,
  },
  {
    couponId: "cp2",
    code: "FREESHIP",
    discountType: "Fixed",
    discountValue: 35_000,
    minOrderValue: 0,
    maxDiscountAmount: null,
    isActive: true,
  },
];

const MOCK_ORDERS: Order[] = [
  {
    orderId: "o1",
    orderCode: "GK-240119-8842",
    userId: "u1",
    shippingAddress: "12 Nguyễn Huệ, P. Bến Nghé, Q.1, TP. Hồ Chí Minh",
    subTotal: 2_080_000,
    shippingFee: 0,
    discountAmount: 208_000,
    totalAmount: 1_872_000,
    currentStatus: "Delivered",
    paymentMethod: "COD",
    paymentStatus: "Paid",
    customerNote: null,
    createdAt: "2026-07-11T08:30:00Z",
    items: [
      {
        orderItemId: "oi1",
        variantId: "p1-v01",
        sku: "GS-DEV-TEE-RIC-S",
        productName: "Devant Seamless T-Shirt",
        colorName: "Rich Purple",
        size: "S",
        imageUrl: "",
        unitPrice: 890_000,
        quantity: 1,
        totalPrice: 890_000,
      },
      {
        orderItemId: "oi2",
        variantId: "p4-v02",
        sku: "GS-VIT-LEG-BLA-M",
        productName: "Vital Seamless Leggings",
        colorName: "Black",
        size: "M",
        imageUrl: "",
        unitPrice: 1_190_000,
        quantity: 1,
        totalPrice: 1_190_000,
      },
    ],
    tracking: [
      {
        trackingId: "t1",
        status: "Pending",
        title: "Đơn hàng được tạo",
        description: null,
        location: "Hệ thống",
        timestamp: "2026-07-11T08:30:00Z",
      },
      {
        trackingId: "t2",
        status: "Shipped",
        title: "Đang giao đến bạn",
        description: null,
        location: "Kho HCM",
        timestamp: "2026-07-12T02:10:00Z",
      },
      {
        trackingId: "t3",
        status: "Delivered",
        title: "Giao hàng thành công",
        description: null,
        location: "Q.1, TP.HCM",
        timestamp: "2026-07-13T05:45:00Z",
      },
    ],
  },
];

/**
 * Client API 2.1: Lấy Danh Sách Đơn Hàng Của Tôi (GET /api/orders/my-orders)
 */
export async function getMyOrdersApi(
  status?: string,
  page = 1,
  pageSize = 20
): Promise<MyOrdersPagedResponse> {
  if (useMockData) {
    const filtered = status
      ? MOCK_ORDERS.filter((o) => o.currentStatus === status)
      : MOCK_ORDERS;
    return mock({
      items: filtered.map((o) => ({
        orderId: o.orderId,
        orderCode: o.orderCode,
        totalAmount: o.totalAmount,
        currentStatus: o.currentStatus,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        totalItems: o.items.length,
        items: o.items.map((i) => ({
          orderItemId: i.orderItemId,
          variantId: i.variantId,
          sku: i.sku,
          productName: i.productName,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          totalPrice: i.totalPrice,
          imageUrl: i.imageUrl || "http://localhost:9000/gymkitten-media/images/2026/08/08/a7c50b08cbb3.jpg",
        })),
      })),
      totalCount: filtered.length,
      page,
      pageSize,
      totalPages: 1,
    });
  }

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  return request<MyOrdersPagedResponse>(`/api/orders/my-orders?${params.toString()}`);
}

/**
 * Client API 2.2: Xem Chi Tiết 1 Đơn Hàng (GET /api/orders/{orderId})
 */
export async function getOrderByIdApi(orderId: string): Promise<OrderDetailDto> {
  if (useMockData) {
    const found = MOCK_ORDERS.find((o) => o.orderId === orderId || o.orderCode === orderId) ?? MOCK_ORDERS[0];
    if (!found) throw new Error("Mock order not found");
    return mock({
      orderId: found.orderId,
      orderCode: found.orderCode,
      userId: found.userId || "u1",
      shippingAddress: found.shippingAddress,
      subtotal: found.subTotal,
      shippingFee: found.shippingFee,
      discountAmount: found.discountAmount,
      totalAmount: found.totalAmount,
      currentStatus: found.currentStatus,
      paymentMethod: found.paymentMethod,
      paymentStatus: found.paymentStatus,
      customerNote: found.customerNote,
      createdAt: found.createdAt,
      updatedAt: found.createdAt,
      items: found.items.map((i) => ({
        orderItemId: i.orderItemId,
        variantId: i.variantId,
        sku: i.sku,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
        imageUrl: i.imageUrl || "http://localhost:9000/gymkitten-media/images/2026/08/08/a7c50b08cbb3.jpg",
      })),
    });
  }

  return request<OrderDetailDto>(`/api/orders/${orderId}`);
}

/**
 * Client API 2.3: Xem Lịch Sử Hành Trình Giao Hàng Timeline (GET /api/orders/{orderId}/tracking)
 */
export async function getOrderTrackingApi(orderId: string): Promise<OrderTrackingHistoryDto[]> {
  if (useMockData) {
    const found = MOCK_ORDERS.find((o) => o.orderId === orderId || o.orderCode === orderId) ?? MOCK_ORDERS[0];
    if (!found) throw new Error("Mock order not found");
    return mock(
      found.tracking.map((t) => ({
        trackingId: t.trackingId,
        orderId: found.orderId,
        status: t.status,
        title: t.title,
        description: t.description,
        location: t.location,
        timestamp: t.timestamp,
        createdAt: t.timestamp,
      }))
    );
  }

  return request<OrderTrackingHistoryDto[]>(`/api/orders/${orderId}/tracking`);
}

/**
 * Client API 2.4: Khách Hàng Tự Bấm Hủy Đơn (PUT /api/orders/{orderId}/cancel)
 */
export async function cancelMyOrderApi(orderId: string): Promise<{ orderId: string; status: string; message: string }> {
  if (useMockData) {
    const found = MOCK_ORDERS.find((o) => o.orderId === orderId);
    if (found) found.currentStatus = "Cancelled";
    return mock({ orderId, status: "Cancelled", message: "Đơn hàng đã được hủy thành công." });
  }

  return request<{ orderId: string; status: string; message: string }>(`/api/orders/${orderId}/cancel`, {
    method: "PUT",
  });
}

// Backward compatibility legacy helpers
export async function getOrders(): Promise<Order[]> {
  return mock(MOCK_ORDERS);
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  return mock(MOCK_ORDERS.find((o) => o.orderCode === code) ?? null);
}

export async function applyCoupon(code: string, subTotal: number): Promise<Coupon> {
  const coupon = MOCK_COUPONS.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!coupon || !coupon.isActive) throw new Error("Mã giảm giá không hợp lệ");
  if (subTotal < coupon.minOrderValue) throw new Error("Đơn hàng chưa đạt giá trị tối thiểu");
  return mock(coupon);
}

export function calcDiscount(coupon: Coupon | null, subTotal: number): number {
  if (!coupon) return 0;
  const raw =
    coupon.discountType === "Percent" ? (subTotal * coupon.discountValue) / 100 : coupon.discountValue;
  return Math.round(Math.min(raw, coupon.maxDiscountAmount ?? raw));
}

export interface PlaceOrderPayload {
  lines: CartLine[];
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  customerNote: string | null;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<Order> {
  const now = new Date().toISOString();
  const status: OrderStatus = "Pending";
  const order: Order = {
    orderId: crypto.randomUUID(),
    orderCode: `GK-${Date.now().toString().slice(-8)}`,
    userId: "u1",
    shippingAddress: payload.shippingAddress,
    subTotal: payload.subTotal,
    shippingFee: payload.shippingFee,
    discountAmount: payload.discountAmount,
    totalAmount: payload.subTotal + payload.shippingFee - payload.discountAmount,
    currentStatus: status,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === "COD" ? "Unpaid" : "Paid",
    customerNote: payload.customerNote,
    createdAt: now,
    items: payload.lines.map((line) => ({
      orderItemId: crypto.randomUUID(),
      variantId: line.variantId,
      sku: line.sku,
      productName: line.productName,
      colorName: line.colorName,
      size: line.size,
      imageUrl: line.imageUrl,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
      totalPrice: line.unitPrice * line.quantity,
    })),
    tracking: [
      {
        trackingId: crypto.randomUUID(),
        status,
        title: "Đơn hàng được tạo",
        description: "Chúng tôi đang xác nhận đơn của bạn",
        location: "Hệ thống",
        timestamp: now,
      },
    ],
  };
  MOCK_ORDERS.unshift(order);
  return mock(order, 500);
}
