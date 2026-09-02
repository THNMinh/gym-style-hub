import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyOrdersApi, cancelMyOrderApi } from "@/entities/order/services";
import { getAddresses } from "@/entities/identity/services";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/entities/order/types";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/features/auth/store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { AuthFeature } from "@/features/auth/components/auth-feature";
import { OrderTrackingModal } from "@/features/order/components/order-tracking-modal";
import { WriteOrderReviewModal } from "@/features/order/components/write-order-review-modal";
import { AdminPagination } from "@/features/admin/components/admin-pagination";
import { toast } from "sonner";
import { Package, Truck, Clock, XCircle, CheckCircle2, Eye, ShoppingBag, Star } from "lucide-react";

export function AccountFeature() {
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Filter & Pagination state for My Orders
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  // Tracking & Review Modal State
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [writeReviewTarget, setWriteReviewTarget] = useState<{
    orderId: string;
    orderCode?: string;
    productId: string;
    productName: string;
    imageUrl?: string | null;
  } | null>(null);

  // Fetch My Orders API
  const myOrdersQuery = useQuery({
    queryKey: ["my-orders", statusFilter, page],
    queryFn: () => getMyOrdersApi(statusFilter || undefined, page, 10),
    enabled: !!user,
  });

  // Addresses Query
  const addresses = useQuery({ queryKey: ["addresses"], queryFn: getAddresses, enabled: !!user });

  // Cancel Order Mutation
  const cancelMutation = useMutation({
    mutationFn: cancelMyOrderApi,
    onSuccess: (data) => {
      toast.success(data.message || "Đã hủy đơn hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (err: Error) => toast.error(`Không thể hủy đơn: ${err.message}`),
  });

  if (!hydrated) return <div className="min-h-[50vh]" />;
  if (!user) return <AuthFeature />;

  const ordersData = myOrdersQuery.data;
  const orderList = ordersData?.items || [];

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "pending") {
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 px-3 py-1 text-xs font-bold gap-1">
          <Clock className="size-3.5" /> Chờ xác nhận
        </Badge>
      );
    }
    if (s === "processing") {
      return (
        <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 px-3 py-1 text-xs font-bold gap-1">
          <Package className="size-3.5" /> Đang đóng gói
        </Badge>
      );
    }
    if (s === "shipped" || s === "shipping") {
      return (
        <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 px-3 py-1 text-xs font-bold gap-1">
          <Truck className="size-3.5" /> Đang giao hàng
        </Badge>
      );
    }
    if (s === "delivered" || s === "completed") {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-3 py-1 text-xs font-bold gap-1">
          <CheckCircle2 className="size-3.5" /> Đã giao hàng
        </Badge>
      );
    }
    if (s === "cancelled") {
      return (
        <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 px-3 py-1 text-xs font-bold gap-1">
          <XCircle className="size-3.5" /> Đã hủy đơn
        </Badge>
      );
    }
    return <Badge variant="outline" className="px-3 py-1 text-xs font-bold">{ORDER_STATUS_LABEL[status] || status}</Badge>;
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 lg:px-8">
      {/* User Info Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
        <div>
          <p className="eyebrow text-muted-foreground">Tài khoản cá nhân</p>
          <h1 className="mt-2 text-3xl font-extrabold text-foreground">{user.fullName ?? user.email}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Đăng xuất
        </Button>
      </div>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="orders">Đơn hàng của tôi</TabsTrigger>
          <TabsTrigger value="addresses">Địa chỉ nhận hàng</TabsTrigger>
          <TabsTrigger value="profile">Hồ sơ cá nhân</TabsTrigger>
        </TabsList>

        {/* Tab 1: Orders Management & Tracking (Shopee Style Design) */}
        <TabsContent value="orders" className="mt-6 space-y-6">
          {/* Shopee Filter Navigation Pills */}
          <div className="flex flex-wrap gap-2 pb-2 border-b">
            {[
              { label: "Tất cả đơn", value: "" },
              { label: "Chờ xác nhận", value: "Pending" },
              { label: "Đang đóng gói", value: "Processing" },
              { label: "Đang giao", value: "Shipped" },
              { label: "Đã giao", value: "Delivered" },
              { label: "Đã hủy", value: "Cancelled" },
            ].map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={statusFilter === tab.value ? "default" : "outline"}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`h-9 px-4 text-xs font-bold rounded-full transition-all ${
                  statusFilter === tab.value
                    ? "bg-primary text-primary-foreground shadow"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Orders List Cards (Shopee Order Layout) */}
          {myOrdersQuery.isLoading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">Đang nạp danh sách đơn hàng...</div>
          ) : !orderList || orderList.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground border border-dashed rounded-xl bg-background">
              Không có đơn hàng nào khớp với trạng thái đã chọn.
            </div>
          ) : (
            <div className="space-y-6">
              {orderList.map((order) => {
                const s = (order.currentStatus || "").toLowerCase();
                const isPending = s === "pending";
                const isDelivered = s === "delivered" || s === "completed";
                const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

                return (
                  <article
                    key={order.orderId}
                    className="border border-border/80 rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Card Header (Shop Brand + Order Status) */}
                    <div className="px-6 py-4 bg-muted/20 border-b flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          GK
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-foreground text-sm">GymKitten Official Store</span>
                            <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                              #{order.orderCode}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Ngày đặt: {formatDate(order.createdAt)} · {PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.currentStatus)}
                      </div>
                    </div>

                    {/* Card Body — Product Items List (Shopee Style Layout) */}
                    <div className="px-6 py-4 divide-y divide-border/60">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                          <div key={item.orderItemId} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
                            <div className="size-20 rounded-lg bg-muted border overflow-hidden shrink-0">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-bold bg-muted/50">
                                  <ShoppingBag className="size-6 text-muted-foreground/60" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <h4 className="font-bold text-sm text-foreground line-clamp-1">{item.productName}</h4>
                              <p className="text-xs text-muted-foreground">
                                Phân loại hàng: <span className="font-mono font-medium">{item.sku}</span>
                              </p>
                              <p className="text-xs font-semibold text-muted-foreground">Số lượng: x{item.quantity}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-sm font-bold text-foreground">{formatPrice(item.unitPrice)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Mặt hàng trong đơn: <strong>{order.totalItems} sản phẩm</strong></span>
                          <span className="font-bold text-foreground">{formatPrice(order.totalAmount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer — Financial Total & Shopee Action Buttons */}
                    <div className="px-6 py-4 bg-muted/10 border-t flex flex-wrap items-center justify-between gap-4">
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <span>Trạng thái thanh toán: </span>
                        <strong className={order.paymentStatus === "Paid" ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                          {order.paymentStatus === "Paid"
                            ? `Đã thanh toán (${PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod})`
                            : order.paymentMethod === "COD"
                            ? "Thanh toán khi nhận hàng (COD)"
                            : `Chưa thanh toán (${PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod})`}
                        </strong>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right mr-2">
                          <span className="text-xs text-muted-foreground mr-2">Thành tiền:</span>
                          <span className="text-xl font-black text-primary">{formatPrice(order.totalAmount)}</span>
                        </div>

                        {/* Red/Orange Shopee Review Button when Order Delivered */}
                        {isDelivered && firstItem && (
                          <Button
                            size="sm"
                            onClick={() =>
                              setWriteReviewTarget({
                                orderId: order.orderId,
                                orderCode: order.orderCode,
                                productId: firstItem.productId || firstItem.variantId,
                                productName: firstItem.productName,
                                imageUrl: firstItem.imageUrl,
                              })
                            }
                            className="h-10 px-5 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md rounded-md gap-1.5 transition-all"
                          >
                            <Star className="size-4 fill-current" /> Đánh Giá
                          </Button>
                        )}

                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={cancelMutation.isPending}
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn hủy đơn hàng #${order.orderCode}?`)) {
                                cancelMutation.mutate(order.orderId);
                              }
                            }}
                            className="h-10 px-4 text-xs font-bold border-destructive text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            Hủy đơn hàng
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTrackingOrderId(order.orderId)}
                          className="h-10 px-5 text-xs font-bold border-border text-foreground hover:bg-muted shadow-sm rounded-md gap-2"
                        >
                          <Eye className="size-4 text-primary" /> Xem Chi Tiết & Timeline
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Pagination Bar */}
              <AdminPagination
                page={page}
                pageSize={10}
                totalCount={ordersData?.totalCount || orderList.length}
                totalPages={ordersData?.totalPages || 1}
                onPageChange={setPage}
              />
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Addresses */}
        <TabsContent value="addresses" className="mt-6 grid gap-4 md:grid-cols-2">
          {(addresses.data ?? []).map((address) => (
            <div key={address.addressId} className="border border-border/80 rounded-xl p-5 text-sm bg-background shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground">{address.receiverName}</p>
                {address.isDefault && <Badge variant="secondary" className="text-[10px]">Mặc định</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{address.phoneNumber}</p>
              <p className="mt-3 text-xs leading-relaxed text-foreground">
                {address.addressLine1}, {address.ward}, {address.district}, {address.city}
              </p>
            </div>
          ))}
        </TabsContent>

        {/* Tab 3: Profile */}
        <TabsContent value="profile" className="mt-6 space-y-3 text-xs border rounded-xl p-6 bg-background shadow-sm">
          <p>
            <span className="text-muted-foreground font-semibold">Họ tên:</span> <span className="font-bold text-foreground">{user.fullName ?? "—"}</span>
          </p>
          <p>
            <span className="text-muted-foreground font-semibold">Email:</span> <span className="font-bold text-foreground">{user.email}</span>
          </p>
          <p>
            <span className="text-muted-foreground font-semibold">Điện thoại:</span> <span className="font-bold text-foreground">{user.phone ?? "—"}</span>
          </p>
          <p>
            <span className="text-muted-foreground font-semibold">Vai trò hệ thống:</span> <Badge variant="outline">{user.role}</Badge>
          </p>
        </TabsContent>
      </Tabs>

      {/* Shopee Style Order Tracking Modal */}
      <OrderTrackingModal
        orderId={trackingOrderId}
        open={trackingOrderId !== null}
        onClose={() => setTrackingOrderId(null)}
      />

      {/* Write Review Modal triggered from Delivered Order Card */}
      {writeReviewTarget && (
        <WriteOrderReviewModal
          open={writeReviewTarget !== null}
          onClose={() => setWriteReviewTarget(null)}
          orderId={writeReviewTarget.orderId}
          orderCode={writeReviewTarget.orderCode}
          productId={writeReviewTarget.productId}
          productName={writeReviewTarget.productName}
          imageUrl={writeReviewTarget.imageUrl}
        />
      )}
    </div>
  );
}
