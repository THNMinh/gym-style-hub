import * as signalR from "@microsoft/signalr";
import { env } from "@/core/config/env";
import type { NotificationPayload } from "@/entities/notification/types";

export interface NewOrderPlacedPayload {
  orderId: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  itemCount: number;
  createdAt: string;
  targetUrl: string;
}

export interface OrderTrackingUpdatedPayload {
  trackingId: string;
  orderId: string;
  orderCode: string;
  status: string;
  title: string;
  description?: string;
  location?: string;
  timestamp: string;
  updatedBy: string;
}

type NotificationHandler = (notification: NotificationPayload) => void;
type NewOrderPlacedHandler = (order: NewOrderPlacedPayload) => void;
type OrderTrackingUpdatedHandler = (tracking: OrderTrackingUpdatedPayload) => void;

class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private isConnecting = false;

  private notificationListeners = new Set<NotificationHandler>();
  private newOrderListeners = new Set<NewOrderPlacedHandler>();
  private orderTrackingListeners = new Set<OrderTrackingUpdatedHandler>();

  public onNotificationReceived(handler: NotificationHandler): () => void {
    this.notificationListeners.add(handler);
    return () => this.notificationListeners.delete(handler);
  }

  public onNewOrderPlaced(handler: NewOrderPlacedHandler): () => void {
    this.newOrderListeners.add(handler);
    return () => this.newOrderListeners.delete(handler);
  }

  public onOrderTrackingUpdated(handler: OrderTrackingUpdatedHandler): () => void {
    this.orderTrackingListeners.add(handler);
    return () => this.orderTrackingListeners.delete(handler);
  }

  public async startConnection(
    getToken: () => string | null,
    onNotificationReceived?: NotificationHandler
  ): Promise<void> {
    if (onNotificationReceived) {
      this.notificationListeners.add(onNotificationReceived);
    }

    const token = getToken();
    if (!token) return;

    if (
      this.hubConnection &&
      (this.hubConnection.state === signalR.HubConnectionState.Connected ||
        this.hubConnection.state === signalR.HubConnectionState.Connecting)
    ) {
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    const baseUrl = env.apiBaseUrl || "https://localhost:7191";
    const hubUrl = `${baseUrl.replace(/\/$/, "")}/hubs/notification`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getToken() ?? "",
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hubConnection.on("ReceiveNotification", (notification: NotificationPayload) => {
      console.log("📥 [SignalR ReceiveNotification]", notification);
      this.notificationListeners.forEach((listener) => {
        try {
          listener(notification);
        } catch (err) {
          console.error("Error in notification listener:", err);
        }
      });
    });

    this.hubConnection.on("NewOrderPlaced", (order: NewOrderPlacedPayload) => {
      console.log("🔔 [SignalR NewOrderPlaced]", order);
      this.newOrderListeners.forEach((listener) => {
        try {
          listener(order);
        } catch (err) {
          console.error("Error in new order listener:", err);
        }
      });
    });

    this.hubConnection.on("OrderTrackingUpdated", (tracking: OrderTrackingUpdatedPayload) => {
      console.log("📍 [SignalR OrderTrackingUpdated]", tracking);
      this.orderTrackingListeners.forEach((listener) => {
        try {
          listener(tracking);
        } catch (err) {
          console.error("Error in order tracking listener:", err);
        }
      });
    });

    this.hubConnection.onreconnecting((error) => {
      console.warn("⚠️ [SignalR Reconnecting] Mất kết nối, đang thử lại...", error);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log("✅ [SignalR Reconnected] Đã kết nối lại thành công, ID:", connectionId);
    });

    this.hubConnection.onclose((error) => {
      if (error) {
        console.warn("⚠️ [SignalR Closed] Kết nối đã đóng:", error);
      }
    });

    try {
      await this.hubConnection.start();
      console.log("🚀 [SignalR Connected] Kết nối WebSocket thông báo thành công!");
    } catch (error: unknown) {
      const errObj = error as { name?: string; message?: string };
      const isAbort =
        errObj?.name === "AbortError" ||
        String(errObj?.message || "").includes("stopped during negotiation") ||
        String(errObj?.message || "").includes("canceled");

      if (!isAbort) {
        console.warn("⚠️ [SignalR Warning] Kết nối WebSocket không thành công:", errObj?.message || error);
      }
    } finally {
      this.isConnecting = false;
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      const conn = this.hubConnection;
      this.hubConnection = null;
      conn.off("ReceiveNotification");
      conn.off("NewOrderPlaced");
      conn.off("OrderTrackingUpdated");
      try {
        await conn.stop();
      } catch {
        // Safe silent cleanup
      }
      console.log("🛑 [SignalR Disconnected] Đã ngắt kết nối WebSocket.");
    }
  }
}

export const signalRService = new SignalRService();
