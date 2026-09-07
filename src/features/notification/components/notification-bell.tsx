import { useState } from "react";
import { Bell, BellOff, CheckCheck, Package, Tag, Info, Sparkles } from "lucide-react";
import { useNotifications } from "../hooks/use-notifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";

export function NotificationBell({ className }: { className?: string }) {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  if (!user) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Order":
        return <Package className="size-4 text-blue-500 shrink-0" />;
      case "Promotion":
        return <Tag className="size-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="size-4 text-amber-500 shrink-0" />;
    }
  };

  const formatNotificationTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Thông báo"
          className={cn(
            "relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-pulse shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 shadow-2xl border-border bg-background/95 backdrop-blur-md rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold bg-primary/10 text-primary rounded-full">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
            >
              <CheckCheck className="size-3.5 text-emerald-500" />
              Đọc tất cả
            </Button>
          )}
        </div>

        {/* Content list */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Sparkles className="size-6 text-primary animate-spin" />
              <span>Đang tải thông báo...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
              <BellOff className="size-8 text-muted-foreground/50" />
              <p className="font-medium text-foreground">Không có thông báo nào</p>
              <p className="text-xs text-muted-foreground">Bạn sẽ nhận được cập nhật đơn hàng và khuyến mãi tại đây.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.notificationId}
                onClick={() => {
                  markAsRead(item.notificationId, item.targetUrl);
                  setOpen(false);
                }}
                className={cn(
                  "p-3.5 flex gap-3 cursor-pointer transition-all duration-150 relative text-left group",
                  item.isRead
                    ? "bg-background hover:bg-muted/40 text-muted-foreground"
                    : "bg-primary/5 hover:bg-primary/10 text-foreground font-medium"
                )}
              >
                {/* Type Icon Container */}
                <div className="mt-0.5 p-2 rounded-lg bg-background border border-border/60 shadow-xs shrink-0 h-fit">
                  {getTypeIcon(item.type)}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs leading-snug line-clamp-1",
                        item.isRead ? "font-normal text-foreground/80" : "font-semibold text-foreground"
                      )}
                    >
                      {item.title}
                    </p>
                    {!item.isRead && (
                      <span className="size-2 mt-1 bg-primary rounded-full shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                    {item.content}
                  </p>
                  <span className="text-[10px] text-muted-foreground/70 mt-1.5 block">
                    {formatNotificationTime(item.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
