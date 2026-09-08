import * as signalR from "@microsoft/signalr";
import { env } from "@/core/config/env";
import type { NotificationPayload } from "@/entities/notification/types";

class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private isConnecting = false;

  public async startConnection(
    getToken: () => string | null,
    onNotificationReceived: (notification: NotificationPayload) => void
  ): Promise<void> {
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
      console.log("📥 [SignalR Received]", notification);
      onNotificationReceived(notification);
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
