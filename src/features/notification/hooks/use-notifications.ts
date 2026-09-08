import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store";
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from "@/entities/notification/services";
import type { NotificationPayload } from "@/entities/notification/types";
import { signalRService } from "../services/signalr-service";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function useNotifications() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const isFetchingRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!accessToken || isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      setLoading(true);
      const res = await getNotificationsApi({ page: 1, pageSize: 20 });
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount ?? 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [accessToken]);

  const handleIncomingNotification = useCallback(
    (incoming: NotificationPayload & { orderId?: string }) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [
        incoming,
        ...prev.filter((n) => n.notificationId !== incoming.notificationId),
      ]);

      // Tự động làm mới danh sách đơn hàng & chi tiết đơn hàng trên màn hình khi nhận được thông báo về Đơn hàng (Real-time update)
      if (incoming.type === "Order" || incoming.orderId) {
        queryClient.invalidateQueries({ queryKey: ["my-orders"] });
        queryClient.invalidateQueries({ queryKey: ["client-order-detail"] });
        queryClient.invalidateQueries({ queryKey: ["client-order-tracking"] });
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      }

      toast.info(incoming.title, {
        description: incoming.content,
        action: incoming.targetUrl
          ? {
              label: "Xem",
              onClick: () => {
                try {
                  navigate({ to: incoming.targetUrl as any });
                } catch {
                  window.location.href = incoming.targetUrl!;
                }
              },
            }
          : undefined,
      });

      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch(() => {});
      } catch {}
    },
    [navigate, queryClient]
  );

  useEffect(() => {
    if (!accessToken || !user) {
      setNotifications([]);
      setUnreadCount(0);
      signalRService.stopConnection();
      return;
    }

    fetchNotifications();

    signalRService.startConnection(() => useAuthStore.getState().accessToken, handleIncomingNotification);

    return () => {
      signalRService.stopConnection();
    };
  }, [accessToken, user, fetchNotifications, handleIncomingNotification]);

  const markAsRead = async (notificationId: string, targetUrl?: string | null) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await markNotificationAsReadApi(notificationId);

      if (targetUrl) {
        try {
          navigate({ to: targetUrl as any });
        } catch {
          window.location.href = targetUrl;
        }
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      await markAllNotificationsAsReadApi();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
