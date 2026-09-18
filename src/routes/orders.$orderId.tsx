import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  AlertCircle,
  FileText,
  Star,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import { getOrderByIdApi, getOrderTrackingApi, cancelMyOrderApi } from "@/entities/order/services";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/entities/order/types";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WriteOrderReviewModal } from "@/features/order/components/write-order-review-modal";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store";
import { AuthFeature } from "@/features/auth/components/auth-feature";
import { signalRService } from "@/features/notification/services/signalr-service";

export const Route = createFileRoute("/orders/$orderId")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [reviewItemTarget, setReviewItemTarget] = useState<{
    productId: string;
    productName: string;
    imageUrl?: string | null;
  } | null>(null);

  // Detail Query
  const detailQuery = useQuery({
    queryKey: ["client-order-detail", orderId],
    queryFn: () => getOrderByIdApi(orderId),
    enabled: !!orderId && !!user,
  });

  // Tracking History Query
  const trackingQuery = useQuery({
    queryKey: ["client-order-tracking", orderId],
    queryFn: () => getOrderTrackingApi(orderId),
    enabled: !!orderId && !!user,
  });

  // Live Tracking listener via SignalR
  useEffect(() => {
    if (!orderId) return;

    const unsub = signalRService.onOrderTrackingUpdated((payload) => {
      if (payload.orderId?.toLowerCase() === orderId.toLowerCase()) {
        toast.info(`📍 Cập nhật tiến trình: ${payload.title}`, {
          description: payload.description || `Trạng thái: ${payload.status}`,
        });

        queryClient.setQueryData(["client-order-tracking", orderId], (prev: any) => {
          if (!Array.isArray(prev)) return [payload];
          if (prev.some((item) => item.trackingId === payload.trackingId)) return prev;
          return [payload, ...prev];
        });

        queryClient.setQueryData(["client-order-detail", orderId], (prev: any) =>
          prev ? { ...prev, currentStatus: payload.status } : prev
        );

        queryClient.invalidateQueries({ queryKey: ["client-order-tracking", orderId] });
        queryClient.invalidateQueries({ queryKey: ["client-order-detail", orderId] });
        queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      }
    });

    return () => {
      unsub();
    };
  }, [orderId, queryClient]);

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: cancelMyOrderApi,
    onSuccess: (data) => {
      toast.success(data.message || "Hủy đơn hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["client-order-detail", orderId] });
      queryClient.invalidateQueries({ queryKey: ["client-order-tracking", orderId] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  if (!user) {
    return (
      <div className="py-12 px-4 max-w-md mx-auto">
        <AuthFeature />
      </div>
    );
  }

  const order = detailQuery.data;
  const trackingList = trackingQuery.data || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="size-4 text-amber-500" />;
      case "Processing":
        return <Package className="size-4 text-blue-500" />;
      case "Shipped":
        return <Truck className="size-4 text-purple-500" />;
      case "Delivered":
        return <CheckCircle2 className="size-4 text-emerald-500" />;
      case "Cancelled":
        return <XCircle className="size-4 text-destructive" />;
      default:
        return <Clock className="size-4 text-muted-foreground" />;
    }
  };

  const isDelivered =
    (order?.currentStatus || "").toLowerCase() === "delivered" ||
    (order?.currentStatus || "").toLowerCase() === "completed";

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Quay lại Đơn hàng của tôi (Account)
          </Link>
          <Badge variant="outline" className="text-xs font-mono font-bold">
            Order ID: {orderId}
          </Badge>
        </div>

        {detailQuery.isLoading ? (
          <Card className="p-12 text-center text-sm text-muted-foreground">
            Đang tải thông tin đơn hàng #{orderId}...
          </Card>
        ) : !order ? (
          <Card className="p-12 text-center space-y-4">
            <XCircle className="size-12 text-destructive mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Không tìm thấy đơn hàng</h2>
            <p className="text-xs text-muted-foreground">
              Đơn hàng không tồn tại hoặc bạn không có quyền truy cập đơn hàng này.
            </p>
            <Button onClick={() => navigate({ to: "/account" })} variant="outline" size="sm">
              Về danh sách đơn hàng
            </Button>
          </Card>
        ) : (
          <>
            {/* Header Title Card */}
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-extrabold text-foreground flex items-center gap-2">
                      <Package className="size-6 text-primary" /> Đơn hàng #{order.orderCode || orderId}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ngày đặt: {formatDate(order.createdAt || new Date().toISOString())}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs font-bold px-3 py-1 bg-primary text-primary-foreground">
                      {ORDER_STATUS_LABEL[order.currentStatus] || order.currentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Phương thức thanh toán</span>
                  <span className="font-bold text-foreground mt-0.5 block">
                    {PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Trạng thái tiền</span>
                  <span
                    className={`font-bold mt-0.5 block ${
                      order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {order.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Số lượng sản phẩm</span>
                  <span className="font-bold text-foreground mt-0.5 block">{order.items?.length || 0} sản phẩm</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Tổng giá trị đơn</span>
                  <span className="font-extrabold text-primary text-sm mt-0.5 block">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Truck className="size-5 text-purple-600" /> Hành trình vận chuyển (Timeline)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {trackingQuery.isLoading ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">Đang cập nhật hành trình...</div>
                ) : trackingList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                    Chưa có lịch sử cập nhật từ bưu cục vận chuyển.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {trackingList.map((item, idx) => (
                      <div key={item.trackingId || idx} className="relative flex items-start gap-3 text-xs">
                        <span className="absolute -left-[21px] top-0.5 size-5 rounded-full bg-background border border-border shadow-sm flex items-center justify-center">
                          {getStatusIcon(item.status)}
                        </span>
                        <div className="space-y-1 flex-1 bg-muted/20 p-3 rounded-lg border">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-bold text-foreground text-sm">{item.title}</p>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {formatDate(item.timestamp || item.createdAt || new Date().toISOString())}
                            </span>
                          </div>
                          {item.description && <p className="text-muted-foreground leading-relaxed">{item.description}</p>}
                          {item.location && (
                            <div className="flex items-center gap-1 text-[11px] text-purple-600 font-medium pt-1">
                              <MapPin className="size-3" /> Bưu cục / Vị trí: <span>{item.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Products List */}
            <Card className="border border-border/80 shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <ShoppingBag className="size-5 text-primary" /> Danh sách sản phẩm trong đơn ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="divide-y border rounded-lg overflow-hidden bg-background">
                  {order.items.map((item) => (
                    <div key={item.orderItemId} className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="size-16 rounded-lg bg-muted border overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px] font-bold bg-muted/50">
                              GK
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="font-bold text-foreground text-sm line-clamp-1">{item.productName}</p>
                          <p className="text-muted-foreground font-mono">SKU: {item.sku}</p>
                          <p className="text-muted-foreground font-semibold">
                            {formatPrice(item.unitPrice)} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-foreground text-sm">{formatPrice(item.totalPrice)}</span>
                        {isDelivered && (
                          <Button
                            size="sm"
                            onClick={() =>
                              setReviewItemTarget({
                                productId: item.variantId || item.orderItemId,
                                productName: item.productName,
                                imageUrl: item.imageUrl,
                              })
                            }
                            className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 gap-1 rounded-md"
                          >
                            <Star className="size-3.5 fill-current" /> Đánh Giá
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Address & Financial Info */}
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <MapPin className="size-4 text-primary" /> Thông tin giao hàng & Ghi chú
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block font-medium">Địa chỉ người nhận:</span>
                    <p className="font-semibold text-foreground leading-relaxed mt-0.5">{order.shippingAddress}</p>
                  </div>
                  <div className="border-t pt-2">
                    <span className="text-muted-foreground block font-medium">Ghi chú đơn hàng:</span>
                    <p className="italic text-muted-foreground mt-0.5">{order.customerNote || "Không có ghi chú"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <FileText className="size-4 text-primary" /> Chi tiết thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính (Subtotal):</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Phí vận chuyển:</span>
                    <span>+{formatPrice(order.shippingFee)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Giảm giá (Voucher):</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-foreground pt-3 border-t">
                    <span>Tổng cộng:</span>
                    <span className="text-primary text-base">{formatPrice(order.totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cancel Action Button */}
            {order.currentStatus === "Pending" && (
              <Card className="border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>Đơn hàng đang ở trạng thái chờ xác nhận. Bạn có thể tự bấm hủy đơn nếu không còn nhu cầu.</span>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={cancelMutation.isPending}
                    onClick={() => {
                      if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${order.orderCode}?`)) {
                        cancelMutation.mutate(order.orderId);
                      }
                    }}
                    className="font-bold shrink-0"
                  >
                    {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn hàng ngay"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Review Modal */}
        {reviewItemTarget && (
          <WriteOrderReviewModal
            open={reviewItemTarget !== null}
            onClose={() => setReviewItemTarget(null)}
            orderId={order?.orderId || orderId}
            orderCode={order?.orderCode || ""}
            productId={reviewItemTarget.productId}
            productName={reviewItemTarget.productName}
            imageUrl={reviewItemTarget.imageUrl}
          />
        )}
      </div>
    </div>
  );
}
