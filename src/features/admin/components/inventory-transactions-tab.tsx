import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, RefreshCw, Filter, ArrowUpRight, ArrowDownRight, RotateCcw, Calendar } from "lucide-react";
import { getInventoryTransactionsApi } from "@/entities/admin/services";
import type { InventoryTransactionDto } from "@/entities/admin/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPagination } from "./admin-pagination";

export function TransactionTypeBadge({ type }: { type: string }) {
  switch (type) {
    case "Import":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 font-bold">
          <ArrowUpRight className="size-3 text-emerald-600" /> 📥 Nhập kho (Import)
        </Badge>
      );
    case "Export":
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1 font-bold">
          <ArrowDownRight className="size-3 text-rose-600" /> 📤 Xuất kho (Export)
        </Badge>
      );
    case "Reserve":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 font-bold">
          🔒 Giữ đơn (Reserve)
        </Badge>
      );
    case "Adjust":
      return (
        <Badge variant="outline" className="bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30 gap-1 font-bold">
          ⚖️ Kiểm kê (Adjust)
        </Badge>
      );
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
}

export function InventoryTransactionsTab() {
  const [skuFilter, setSkuFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-inventory-transactions", skuFilter, typeFilter, fromDate, toDate, page],
    queryFn: () =>
      getInventoryTransactionsApi({
        sku: skuFilter || undefined,
        type: typeFilter || undefined,
        fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate: toDate ? new Date(`${toDate}T23:59:59`).toISOString() : undefined,
        page,
        pageSize: 15,
      }),
  });

  const handleReset = () => {
    setSkuFilter("");
    setTypeFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Nhật ký Biến động Kho (Inventory Audit Trail)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lịch sử toàn bộ các giao dịch nhập kho, xuất kho, giữ đơn và điều chỉnh kiểm kê theo thời gian thực.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 text-xs">
          <RefreshCw className="size-3.5" /> Làm mới
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="size-3.5 text-primary" /> Bộ lọc giao dịch
            </span>
            {(skuFilter || typeFilter || fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3 mr-1" /> Xóa bộ lọc
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* SKU Filter */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm SKU (VD: GK-LEG)..."
                value={skuFilter}
                onChange={(e) => {
                  setSkuFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs h-9"
              />
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="">-- Tất cả loại biến động --</option>
                <option value="Import">📥 Nhập kho (Import)</option>
                <option value="Export">📤 Xuất kho (Export)</option>
                <option value="Reserve">🔒 Giữ đơn (Reserve)</option>
                <option value="Adjust">⚖️ Điều chỉnh (Adjust)</option>
              </select>
            </div>

            {/* From Date */}
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Từ ngày"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs h-9"
              />
            </div>

            {/* To Date */}
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Đến ngày"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 border-b border-border text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Mã SKU</th>
                <th className="py-3 px-4">Sản phẩm & Biến thể</th>
                <th className="py-3 px-4">Loại biến động</th>
                <th className="py-3 px-4 text-center">Thay đổi (+/-)</th>
                <th className="py-3 px-4">Tham chiếu / Ghi chú</th>
                <th className="py-3 px-4 text-right">Người thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                    Đang tải nhật ký biến động kho...
                  </td>
                </tr>
              ) : !data?.items || data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                    Không tìm thấy nhật ký biến động kho nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                data.items.map((item: InventoryTransactionDto) => {
                  const isPositive = item.quantityChange > 0;
                  const dateFormatted = new Date(item.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  return (
                    <tr key={item.transactionId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {dateFormatted}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-primary whitespace-nowrap">
                        {item.sku}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-xs text-foreground line-clamp-1">{item.productName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.colorName} · Size <strong className="text-foreground">{item.size}</strong>
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <TransactionTypeBadge type={item.type} />
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center font-extrabold text-xs px-2 py-0.5 rounded-full ${
                            isPositive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isPositive ? `+${item.quantityChange}` : item.quantityChange}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs truncate">
                        {item.referenceId || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded-md">
                          {item.performer || "system"}
                        </span>
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
          totalCount={data?.totalCount || 0}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
