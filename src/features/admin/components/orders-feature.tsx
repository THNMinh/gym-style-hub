import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Truck, CheckCircle2, RefreshCw, Clock } from "lucide-react";
import { getAdminOrdersApi, shipOrderApi } from "@/entities/admin/services";
import { formatPrice } from "@/shared/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "./admin-pagination";

export function OrdersFeature() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders", page],
    queryFn: () => getAdminOrdersApi(page, 15),
  });

  const orders = data?.items || [];

  const shipMutation = useMutation({
    mutationFn: shipOrderApi,
    onSuccess: (resData) => {
      toast.success(`Đã giao đơn hàng thành công! Trạng thái: ${resData.status}`);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err: Error) => toast.error(`Lỗi giao hàng: ${err.message}`),
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý & Xử lý Đơn hàng (Order Fulfillment)</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Xác nhận giao hàng cho đơn vị vận chuyển (`PUT /api/admin/orders/{`{orderId}`}/ship`)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="size-4" /> Làm mới
        </Button>
      </div>

      {/* Orders Table */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4">Mã Đơn Hàng</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Địa chỉ giao hàng</th>
                <th className="py-3.5 px-4">Tổng tiền</th>
                <th className="py-3.5 px-4">Thanh toán</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : !orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Chưa có đơn hàng nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const canShip = order.currentStatus === "Pending" || order.currentStatus === "Processing";
                  return (
                    <tr key={order.orderId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-primary">
                        {order.orderCode}
                      </td>
                      <td className="py-3.5 px-4 font-medium">{order.userEmail}</td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs truncate">
                        {order.shippingAddress}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">
                            {order.paymentMethod}
                          </Badge>
                          <Badge
                            className={`text-[10px] font-bold ${
                              order.paymentStatus === "Paid"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          className={`text-xs font-bold uppercase tracking-wider ${
                            order.currentStatus === "Shipped"
                              ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                              : order.currentStatus === "Completed"
                              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                          }`}
                        >
                          {order.currentStatus === "Shipped" && <Truck className="size-3 inline mr-1" />}
                          {order.currentStatus === "Pending" && <Clock className="size-3 inline mr-1" />}
                          {order.currentStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canShip ? (
                          <Button
                            size="sm"
                            disabled={shipMutation.isPending}
                            onClick={() => shipMutation.mutate(order.orderId)}
                            className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
                          >
                            <Truck className="size-3.5" /> Mark as Shipped
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center justify-end gap-1 font-medium">
                            <CheckCircle2 className="size-3.5 text-emerald-600" /> Đã xuất kho
                          </span>
                        )}
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
    </div>
  );
}
