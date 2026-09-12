import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  Calendar,
  User,
} from "lucide-react";
import { getOrderByIdApi, getOrderTrackingApi, cancelMyOrderApi } from "@/entities/order/services";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/entities/order/types";
import { formatDate, formatDateTime, formatPrice } from "@/shared/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WriteOrderReviewModal } from "./write-order-review-modal";

interface OrderTrackingModalProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
}

export function OrderTrackingModal({ orderId, open, onClose }: OrderTrackingModalProps) {
  const queryClient = useQueryClient();
  const [reviewItemTarget, setReviewItemTarget] = useState<{
    productId: string;
    productName: string;
    imageUrl?: string | null;
  } | null>(null);

  // Detail Query
  const detailQuery = useQuery({
    queryKey: ["client-order-detail", orderId],
    queryFn: () => (orderId ? getOrderByIdApi(orderId) : Promise.resolve(null)),
    enabled: !!orderId && open,
  });

  // Tracking History Query
  const trackingQuery = useQuery({
    queryKey: ["client-order-tracking", orderId],
    queryFn: () => (orderId ? getOrderTrackingApi(orderId) : Promise.resolve([])),
    enabled: !!orderId && open,
  });

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

  const isDelivered = (order?.currentStatus || "").toLowerCase() === "delivered" || (order?.currentStatus || "").toLowerCase() === "completed";

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="size-5 text-primary" /> Chi tiết & Hành trình Đơn hàng #{order?.orderCode || orderId}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Theo dõi trạng thái thời gian thực và lịch sử vận chuyển bưu cục (Shopee / Lazada Style)
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">Đang tải thông tin đơn hàng...</div>
          ) : !order ? (
            <div className="py-12 text-center text-xs text-muted-foreground">Không tìm thấy chi tiết đơn hàng.</div>
          ) : (
            <div className="space-y-6 py-2">
              {/* Header Summary Info */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-muted/30 text-xs border">
                  <div>
                    <span className="text-muted-foreground font-medium">Trạng thái đơn:</span>
                    <p className="font-bold text-primary mt-0.5">
                      {ORDER_STATUS_LABEL[order.currentStatus] || order.currentStatus}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Phương thức:</span>
                    <p className="font-semibold mt-0.5">{PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Trạng thái tiền:</span>
                    <p className="font-bold mt-0.5 text-emerald-600">{order.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">Tổng thanh toán:</span>
                    <p className="font-extrabold text-foreground mt-0.5 text-sm">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-xs border">
                  <div className="flex items-start gap-2">
                    <Calendar className="size-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground font-medium">Ngày giờ đặt hàng:</span>
                      <p className="font-bold text-foreground mt-0.5 font-mono">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="size-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground font-medium">Khách hàng đặt mua:</span>
                      <p className="font-bold text-foreground mt-0.5">
                        {order.userEmail || "Khách hàng"}
                      </p>
                    </div>
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="p-3.5 rounded-lg bg-muted/20 text-xs border flex items-start gap-2">
                    <MapPin className="size-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground font-medium">Địa chỉ nhận hàng:</span>
                      <p className="font-medium text-foreground mt-0.5 leading-relaxed">{order.shippingAddress}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopee Style Tracking Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-foreground flex items-center gap-1.5 border-b pb-2">
                  <Truck className="size-4 text-purple-600" /> Hành trình vận chuyển (Timeline)
                </h4>

                {trackingQuery.isLoading ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">Đang cập nhật hành trình...</div>
                ) : trackingList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                    Chưa có thông tin cập nhật bưu cục.
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
                              <MapPin className="size-3" /> Địa điểm / Bưu cục: <span>{item.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-foreground border-b pb-2">Danh sách sản phẩm ({order.items.length})</h4>
                <div className="divide-y border rounded-lg overflow-hidden bg-background">
                  {order.items.map((item) => (
                    <div key={item.orderItemId} className="p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
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
              </div>

              {/* Shipping Address & Note */}
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="p-3 border rounded-lg bg-muted/20 space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <MapPin className="size-3.5 text-primary" /> Địa chỉ giao hàng:
                  </span>
                  <p className="text-muted-foreground leading-relaxed">{order.shippingAddress}</p>
                </div>

                <div className="p-3 border rounded-lg bg-muted/20 space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <FileText className="size-3.5 text-primary" /> Ghi chú từ khách hàng:
                  </span>
                  <p className="text-muted-foreground italic">{order.customerNote || "Không có ghi chú"}</p>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="border-t pt-3 space-y-1.5 text-xs text-right">
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
                    <span>Giảm giá (Discount):</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-foreground pt-2 border-t">
                  <span>Tổng thanh toán:</span>
                  <span className="text-primary text-base">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              {/* Cancel Action Button */}
              {order.currentStatus === "Pending" && (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 flex items-center justify-between text-xs">
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
                    className="font-bold shrink-0 ml-2"
                  >
                    {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn ngay"}
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Write Review Modal triggered from item list */}
      {reviewItemTarget && (
        <WriteOrderReviewModal
          open={reviewItemTarget !== null}
          onClose={() => setReviewItemTarget(null)}
          orderId={order?.orderId || orderId || ""}
          orderCode={order?.orderCode || ""}
          productId={reviewItemTarget.productId}
          productName={reviewItemTarget.productName}
          imageUrl={reviewItemTarget.imageUrl}
        />
      )}
    </>
  );
}
