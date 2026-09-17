import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, RefreshCw, CheckCircle2, XCircle, Clock, CreditCard, Wallet, Truck } from "lucide-react";
import { getFinanceTransactionsApi } from "@/entities/admin/services";
import { formatPrice } from "@/shared/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { AdminPagination } from "./admin-pagination";

export function FinanceFeature() {
  const [gateway, setGateway] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-finance", gateway, status, page],
    queryFn: () => getFinanceTransactionsApi({ gateway, status, page, pageSize: 20 }),
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Báo cáo Tài chính & Giao dịch (Finance)</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Lịch sử giao dịch và đối soát các cổng thanh toán.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="size-4" /> Làm mới
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="border border-border/80 shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Cổng thanh toán:</span>
            <div className="flex gap-1.5">
              {[
                { label: "Tất cả", value: "" },
                { label: "MoMo", value: "MoMo" },
                { label: "COD", value: "COD" },
              ].map((item) => (
                <Button
                  key={item.label}
                  type="button"
                  size="sm"
                  variant={gateway === item.value ? "default" : "outline"}
                  onClick={() => setGateway(item.value)}
                  className="h-8 text-xs font-semibold"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Trạng thái:</span>
            <div className="flex gap-1.5">
              {[
                { label: "Tất cả", value: "" },
                { label: "Thành công", value: "Success" },
                { label: "Thất bại", value: "Failed" },
                { label: "Đang chờ", value: "Pending" },
              ].map((item) => (
                <Button
                  key={item.label}
                  type="button"
                  size="sm"
                  variant={status === item.value ? "default" : "outline"}
                  onClick={() => setStatus(item.value)}
                  className="h-8 text-xs font-semibold"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Data Table */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4">Mã Đơn / Transaction ID</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Cổng thanh toán</th>
                <th className="py-3.5 px-4 text-right">Số tiền</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Đang nạp báo cáo tài chính...
                  </td>
                </tr>
              ) : !data?.items || data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Không có giao dịch thanh toán nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr key={item.transactionId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-xs text-primary">
                        {item.orderCode}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {item.transactionId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{item.userEmail}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="font-bold gap-1 text-xs">
                        {item.gateway === "VnPay" && <CreditCard className="size-3.5 text-blue-600" />}
                        {item.gateway === "MoMo" && <Wallet className="size-3.5 text-pink-600" />}
                        {item.gateway === "COD" && <Truck className="size-3.5 text-amber-600" />}
                        {item.gateway}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-foreground">
                      {formatPrice(item.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        className={`text-xs font-bold ${
                          item.status === "Success"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : item.status === "Failed"
                            ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
                            : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                        }`}
                      >
                        {item.status === "Success" && <CheckCircle2 className="size-3.5 inline mr-1" />}
                        {item.status === "Failed" && <XCircle className="size-3.5 inline mr-1" />}
                        {item.status === "Pending" && <Clock className="size-3.5 inline mr-1" />}
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-muted-foreground font-mono">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          pageSize={20}
          totalCount={data?.totalCount || 0}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
