export interface NotificationPayload {
  notificationId: string;
  title: string;
  content: string;
  type: "Order" | "Promotion" | "System" | string;
  targetUrl?: string | null;
  createdAt: string;
  isRead: boolean;
  readAt?: string | null;
}

export interface GetNotificationsResponse {
  notifications: NotificationPayload[];
  unreadCount: number;
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GetNotificationsQuery {
  page?: number;
  pageSize?: number;
}
