import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Truck,
  CheckCircle2,
  RefreshCw,
  Clock,
  Search,
  Edit3,
  Eye,
  Package,
  XCircle,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  getAdminOrdersApi,
  shipOrderApi,
  updateOrderStatusAdminApi,
} from "@/entities/admin/services";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/entities/order/types";
import { formatPrice } from "@/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminPagination } from "./admin-pagination";
import { OrderTrackingModal } from "@/features/order/components/order-tracking-modal";

export function OrdersFeature() {
  const queryClient = useQueryClient();

  // Filters & Pagination State
  const [orderCodeSearch, setOrderCodeSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Modals state
  const [updateOrder, setUpdateOrder] = useState<any | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Update Status Form State
  const [newStatus, setNewStatus] = useState("Shipped");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  // Admin Orders Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders", orderCodeSearch, statusFilter, startDate, endDate, page],
    queryFn: () =>
      getAdminOrdersApi({
        orderCode: orderCodeSearch || undefined,
        status: statusFilter || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        page,
        pageSize: 15,
      }),
  });

  const orders = data?.items || [];

  // Quick Ship Mutation
  const shipMutation = useMutation({
    mutationFn: shipOrderApi,
    onSuccess: (resData) => {
      toast.success(`Đã cập nhật trạng thái đơn hàng: ${resData.status || "Shipped"}`);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err: Error) => toast.error(`Lỗi giao hàng: ${err.message}`),
  });

  // Admin Update Status & Insert Timeline Event Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: any }) =>
      updateOrderStatusAdminApi(orderId, payload),
    onSuccess: (resData) => {
      toast.success(resData.message || "Cập nhật trạng thái & Timeline thành công!");
      setUpdateOrder(null);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err: Error) => toast.error(`Lỗi cập nhật: ${err.message}`),
  });

  const handleOpenUpdateModal = (order: any) => {
    setUpdateOrder(order);
    const nextStatus = order.currentStatus === "Pending" ? "Processing" : "Shipped";
    setNewStatus(nextStatus);
    setEventTitle(
      nextStatus === "Processing"
        ? "Đơn hàng đang chuẩn bị đóng gói"
        : nextStatus === "Shipped"
        ? "Đã giao cho đơn vị vận chuyển Viettel Post"
        : "Cập nhật hành trình bưu cục"
    );
    setEventDesc("Đơn hàng đang được bộ phận vận hành xử lý theo quy trình.");
    setEventLocation("Tổng kho GymKitten Q12, TP. Hồ Chí Minh");
  };

  const handleStatusChangeInModal = (statusVal: string) => {
    setNewStatus(statusVal);
    if (statusVal === "Processing") {
      setEventTitle("Đơn hàng đang chuẩn bị đóng gói");
      setEventDesc("Kho hàng đang tiến hành phân loại và đóng gói sản phẩm.");
    } else if (statusVal === "Shipped") {
      setEventTitle("Đã giao cho đơn vị vận chuyển Viettel Post");
      setEventDesc("Bưu tá đã nhận hàng và đang di chuyển tới trạm phân phối.");
    } else if (statusVal === "Delivered") {
      setEventTitle("Giao hàng thành công");
      setEventDesc("Khách hàng đã ký nhận đơn hàng và thanh toán đầy đủ.");
    } else if (statusVal === "Cancelled") {
      setEventTitle("Hủy đơn hàng bởi Quản trị viên");
      setEventDesc("Đơn hàng đã hủy. Số lượng tồn kho dự trữ được giải phóng.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1"><Clock className="size-3" /> Pending</Badge>;
      case "Processing":
        return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 gap-1"><Package className="size-3" /> Processing</Badge>;
      case "Shipped":
        return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 gap-1"><Truck className="size-3" /> Shipped</Badge>;
      case "Delivered":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1"><CheckCircle2 className="size-3" /> Delivered</Badge>;
      case "Cancelled":
        return <Badge className="bg-red-500/15 text-red-600 border-red-500/30 gap-1"><XCircle className="size-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{ORDER_STATUS_LABEL[status] || status}</Badge>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Đơn hàng & Tracking Hành trình</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Tra cứu đơn hàng, Cập nhật Trạng thái & Chèn thông tin vị trí Bưu cục vào Timeline giao hàng (`PUT /api/admin/orders/status`)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="size-4" /> Làm mới
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Search className="size-4 text-primary" /> Bộ lọc đơn hàng nâng cao
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">Mã đơn hàng (OrderCode)</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="GK-260831..."
                value={orderCodeSearch}
                onChange={(e) => setOrderCodeSearch(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Trạng thái đơn</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="Pending">Chờ xác nhận (Pending)</option>
              <option value="Processing">Đang đóng gói (Processing)</option>
              <option value="Shipped">Đang giao (Shipped)</option>
              <option value="Delivered">Đã giao thành công (Delivered)</option>
              <option value="Cancelled">Đã hủy (Cancelled)</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Từ ngày</Label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Đến ngày</Label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Mã Đơn Hàng</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Khách hàng</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tổng tiền</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Thanh toán</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Trạng thái</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap min-w-[280px]">Thao tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : !orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Chưa có đơn hàng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  return (
                    <tr key={order.orderId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-extrabold text-xs text-primary whitespace-nowrap">
                        {order.orderCode}
                      </td>
                      <td className="py-3.5 px-4 font-medium whitespace-nowrap">{order.userEmail || order.customerEmail || "N/A"}</td>
                      <td className="py-3.5 px-4 font-bold text-foreground whitespace-nowrap">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">
                            {PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod}
                          </Badge>
                          <Badge
                            className={`text-[10px] font-bold ${
                              order.paymentStatus === "Paid"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {order.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(order.currentStatus)}
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end gap-1.5 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTrackingOrderId(order.orderId)}
                              className="h-8 px-2.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Xem chi tiết đơn hàng & timeline"
                            >
                              <Eye className="size-3.5 mr-1" /> Chi tiết đơn
                            </Button>
                            {order.currentStatus?.toLowerCase() !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenUpdateModal(order)}
                                className="h-8 px-2.5 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              >
                                <Edit3 className="size-3.5 mr-1" /> Cập nhật
                              </Button>
                            )}
                          </div>
                          {order.currentStatus?.toLowerCase() === "cancelled" ? (
                            <span className="text-[11px] font-bold text-destructive/80 italic bg-destructive/10 px-2.5 py-1 rounded-md">
                              Đã hủy bởi khách
                            </span>
                          ) : order.currentStatus?.toLowerCase() === "shipped" ? (
                            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-2 py-1 rounded-md flex items-center justify-center gap-1">
                              <CheckCircle2 className="size-3" /> Đã xuất kho
                            </span>
                          ) : order.currentStatus?.toLowerCase() === "delivered" || order.currentStatus?.toLowerCase() === "completed" ? (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md flex items-center justify-center gap-1">
                              <CheckCircle2 className="size-3" /> Đã hoàn tất
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              disabled={shipMutation.isPending}
                              onClick={() => shipMutation.mutate(order.orderId)}
                              className="h-8 px-2.5 w-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white justify-center gap-1 shadow-xs"
                              title="Xuất kho giao hàng ngay"
                            >
                              <Truck className="size-3.5" /> Ship Đơn
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          pageSize={15}
          totalCount={data?.totalCount || orders.length}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
        />
      </Card>

      {/* Admin Update Status & Timeline Modal */}
      <Dialog open={updateOrder !== null} onOpenChange={(open) => !open && setUpdateOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2 text-amber-600">
              <Edit3 className="size-5" /> Cập nhật Trạng thái & Bưu cục — Đơn #{updateOrder?.orderCode}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Thay đổi trạng thái đơn và chèn sự kiện lịch sử vào Shopee/Lazada Timeline (`PUT /api/admin/orders/status`)
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!updateOrder) return;
              updateStatusMutation.mutate({
                orderId: updateOrder.orderId,
                payload: {
                  status: newStatus,
                  title: eventTitle,
                  description: eventDesc,
                  location: eventLocation,
                },
              });
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor="admin-status" className="text-xs font-bold">Chuyển Trạng thái đơn (*)</Label>
              <select
                id="admin-status"
                value={newStatus}
                onChange={(e) => handleStatusChangeInModal(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-bold"
              >
                <option value="Processing">Processing (Chuẩn bị / Đóng gói)</option>
                <option value="Shipped">Shipped (Đang giao hàng)</option>
                <option value="Delivered">Delivered (Đã giao thành công)</option>
                <option value="Cancelled">Cancelled (Hủy đơn hàng)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-title" className="text-xs font-bold">Tiêu đề sự kiện Timeline (*)</Label>
              <Input
                id="event-title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="VD: Đơn hàng đã xuất kho Tân Bình"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-desc" className="text-xs font-bold">Mô tả chi tiết sự kiện</Label>
              <Textarea
                id="event-desc"
                rows={2}
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                placeholder="VD: Bưu tá Viettel Post đã tiếp nhận gói hàng."
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-location" className="text-xs font-bold">Vị trí / Bưu cục (Location)</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-purple-600" />
                <Input
                  id="event-location"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="VD: Bưu cục Tân Bình, TP.HCM"
                  className="pl-8 h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setUpdateOrder(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={updateStatusMutation.isPending} className="font-bold">
                {updateStatusMutation.isPending ? "Đang lưu..." : "Cập nhật & Thêm Timeline"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tracking Modal for Admin */}
      <OrderTrackingModal
        orderId={trackingOrderId}
        open={trackingOrderId !== null}
        onClose={() => setTrackingOrderId(null)}
      />
    </div>
  );
}
