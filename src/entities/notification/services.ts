import { mock, request } from "@/core/lib/api-client";
import { useMockData } from "@/core/config/env";
import type {
  GetNotificationsQuery,
  GetNotificationsResponse,
  NotificationPayload,
} from "./types";

const MOCK_NOTIFICATIONS: NotificationPayload[] = [
  {
    notificationId: "8f3b2075-8120-41da-a7a5-d8ca2601bb99",
    title: "Cập nhật đơn hàng #GK-260831-891",
    content: "Đơn hàng #GK-260831-891 của bạn đã đổi trạng thái thành: Shipped",
    type: "Order",
    isRead: false,
    targetUrl: "/account",
    readAt: null,
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: "1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
    title: "Mã giảm giá mới dành riêng cho bạn!",
    content: "Nhập mã GYM20 để được giảm 20% cho đơn hàng tiếp theo.",
    type: "Promotion",
    isRead: true,
    targetUrl: "/coupons",
    readAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

/**
 * 3.1 Lấy danh sách thông báo của tôi (GET /api/notifications)
 */
export async function getNotificationsApi(
  query: GetNotificationsQuery = {}
): Promise<GetNotificationsResponse> {
  const { page = 1, pageSize = 20 } = query;

  if (useMockData) {
    const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;
    return mock({
      notifications: MOCK_NOTIFICATIONS,
      unreadCount: unread,
      totalCount: MOCK_NOTIFICATIONS.length,
      page,
      pageSize,
    });
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  }).toString();

  const res = await request<GetNotificationsResponse | NotificationPayload[]>(
    `/api/notifications?${queryParams}`
  );

  // If response is already GetNotificationsResponse shape
  if (res && typeof res === "object" && "notifications" in res) {
    return res as GetNotificationsResponse;
  }

  // Handle direct array fallback
  const list = Array.isArray(res) ? res : [];
  const unreadCount = list.filter((n) => !n.isRead).length;
  return {
    notifications: list,
    unreadCount,
    totalCount: list.length,
    page,
    pageSize,
  };
}

/**
 * 3.2 Đánh dấu 1 thông báo là đã đọc (PUT /api/notifications/{id}/read)
 */
export async function markNotificationAsReadApi(notificationId: string): Promise<void> {
  if (useMockData) {
    const target = MOCK_NOTIFICATIONS.find((n) => n.notificationId === notificationId);
    if (target) {
      target.isRead = true;
      target.readAt = new Date().toISOString();
    }
    return mock(undefined);
  }

  return request<void>(`/api/notifications/${notificationId}/read`, {
    method: "PUT",
  });
}

/**
 * 3.3 Đánh dấu tất cả thông báo là đã đọc (PUT /api/notifications/read-all)
 */
export async function markAllNotificationsAsReadApi(): Promise<void> {
  if (useMockData) {
    MOCK_NOTIFICATIONS.forEach((n) => {
      n.isRead = true;
      n.readAt = new Date().toISOString();
    });
    return mock(undefined);
  }

  return request<void>("/api/notifications/read-all", {
    method: "PUT",
  });
}
