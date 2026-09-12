import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Search, Plus, Edit3, RefreshCw, Package, AlertTriangle } from "lucide-react";
import {
  getInventoryApi,
  restockInventoryApi,
  adjustInventoryApi,
} from "@/entities/admin/services";
import type { InventoryItem } from "@/entities/admin/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AdminPagination } from "./admin-pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InventoryTransactionsTab } from "./inventory-transactions-tab";
import { History } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Zod Schemas for Restock and Adjust Stock Modals
const restockSchema = z.object({
  variantId: z.string().min(1, "Vui lòng chọn biến thể"),
  quantity: z.number({ invalid_type_error: "Vui lòng nhập số hợp lệ" }).min(1, "Số lượng thêm ít nhất là 1"),
  referenceId: z.string().optional(),
});

const adjustSchema = z.object({
  variantId: z.string().min(1, "Vui lòng chọn biến thể"),
  newQuantity: z.number({ invalid_type_error: "Vui lòng nhập số hợp lệ" }).min(0, "Số lượng không âm"),
  note: z.string().optional(),
});

type RestockFormValues = z.infer<typeof restockSchema>;
type AdjustFormValues = z.infer<typeof adjustSchema>;

export function InventoryFeature() {
  const queryClient = useQueryClient();
  const [skuFilter, setSkuFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modals state
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

  // Fetch Inventory Data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-inventory", skuFilter, nameFilter, page],
    queryFn: () => getInventoryApi({ sku: skuFilter, productName: nameFilter, page, pageSize: 20 }),
  });

  // Restock Mutation
  const restockMutation = useMutation({
    mutationFn: restockInventoryApi,
    onSuccess: () => {
      toast.success("Bổ sung kho (Restock) thành công!");
      setRestockItem(null);
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  // Adjust Stock Mutation
  const adjustMutation = useMutation({
    mutationFn: adjustInventoryApi,
    onSuccess: () => {
      toast.success("Điều chỉnh kho thành công!");
      setAdjustItem(null);
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  // Form Hooks
  const restockForm = useForm<RestockFormValues>({
    resolver: zodResolver(restockSchema),
  });

  const adjustForm = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema),
  });

  const handleOpenRestock = (item: InventoryItem) => {
    setRestockItem(item);
    restockForm.reset({ variantId: item.variantId, quantity: 10, referenceId: "" });
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustItem(item);
    adjustForm.reset({ variantId: item.variantId, newQuantity: item.quantityOnHand, note: "" });
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Tồn kho (Inventory)</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Theo dõi SKU, tồn kho thực tế (`QuantityOnHand`), giữ đơn (`QuantityReserved`) và khả dụng (`AvailableStock`).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="size-4" /> Làm mới
        </Button>
      </div>

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="stock" className="flex items-center gap-2 font-bold text-xs">
            <Package className="size-4" /> Bảng Tồn kho (OnHand/Available)
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2 font-bold text-xs">
            <History className="size-4" /> Nhật ký Biến động Kho
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-6">
          {/* Filter Cards */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Search className="size-4 text-muted-foreground" /> Bộ lọc tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Lọc theo SKU (VD: GK-HOODIE)..."
                  value={skuFilter}
                  onChange={(e) => setSkuFilter(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Lọc theo Tên sản phẩm..."
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="border border-border/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase font-bold text-muted-foreground">
                  <tr>
                    <th className="py-3.5 px-4">SKU</th>
                    <th className="py-3.5 px-4">Sản phẩm</th>
                    <th className="py-3.5 px-4">Biến thể</th>
                    <th className="py-3.5 px-4 text-center">Kho thực tế (OnHand)</th>
                    <th className="py-3.5 px-4 text-center">Đã giữ đơn (Reserved)</th>
                    <th className="py-3.5 px-4 text-center">Khả dụng (Available)</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        Đang tải dữ liệu tồn kho...
                      </td>
                    </tr>
                  ) : !data?.items || data.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        Không tìm thấy sản phẩm tồn kho nào khớp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    data.items.map((item) => (
                      <tr key={item.variantId} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-primary">
                          {item.sku}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">{item.productName}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Badge variant="outline" className="font-normal flex items-center gap-1.5 px-2 py-0.5">
                              {item.colorHex && (
                                <span
                                  className="size-3 rounded-full border border-black/20 shrink-0 shadow-xs"
                                  style={{ backgroundColor: item.colorHex }}
                                  title={`Mã màu: ${item.colorHex}`}
                                />
                              )}
                              <span>{item.color}</span>
                            </Badge>
                            <Badge variant="secondary" className="font-bold">
                              {item.size}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">{item.quantityOnHand}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-amber-600">
                          {item.quantityReserved}
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-emerald-600">
                          {item.availableStock}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenRestock(item)}
                            className="h-8 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          >
                            <Plus className="size-3.5 mr-1" /> Restock
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenAdjust(item)}
                            className="h-8 text-xs font-medium text-slate-600 hover:text-foreground"
                          >
                            <Edit3 className="size-3.5 mr-1" /> Sửa
                          </Button>
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
        </TabsContent>

        <TabsContent value="transactions">
          <InventoryTransactionsTab />
        </TabsContent>
      </Tabs>

      {/* Restock Modal */}
      <Dialog open={restockItem !== null} onOpenChange={(open) => !open && setRestockItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Package className="size-5 text-emerald-600" /> Bổ sung kho (Restock)
            </DialogTitle>
            <DialogDescription>
              Nhập thêm số lượng cho biến thể: <strong className="text-foreground">{restockItem?.sku}</strong>
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={restockForm.handleSubmit((values) =>
              restockMutation.mutate({
                variantId: values.variantId,
                quantity: Number(values.quantity),
                referenceId: values.referenceId,
              })
            )}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor="quantity">Số lượng thêm mới (*)</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                {...restockForm.register("quantity", { valueAsNumber: true })}
              />
              {restockForm.formState.errors.quantity && (
                <p className="text-xs text-destructive">
                  {restockForm.formState.errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceId">Mã đợt nhập / Reference ID (Tùy chọn)</Label>
              <Input id="referenceId" placeholder="VD: RESTOCK-BATCH-001" {...restockForm.register("referenceId")} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setRestockItem(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={restockMutation.isPending} className="font-bold">
                {restockMutation.isPending ? "Đang xử lý..." : "Xác nhận nhập kho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Modal */}
      <Dialog open={adjustItem !== null} onOpenChange={(open) => !open && setAdjustItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Edit3 className="size-5 text-amber-600" /> Điều chỉnh số lượng thực tế
            </DialogTitle>
            <DialogDescription>
              Sửa số lượng `QuantityOnHand` thực tế cho SKU: <strong className="text-foreground">{adjustItem?.sku}</strong>
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={adjustForm.handleSubmit((values) =>
              adjustMutation.mutate({
                variantId: values.variantId,
                newQuantity: Number(values.newQuantity),
                note: values.note,
              })
            )}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor="newQuantity">Số lượng thực tế mới (newQuantity) (*)</Label>
              <Input
                id="newQuantity"
                type="number"
                min={0}
                {...adjustForm.register("newQuantity", { valueAsNumber: true })}
              />
              {adjustForm.formState.errors.newQuantity && (
                <p className="text-xs text-destructive">
                  {adjustForm.formState.errors.newQuantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjust-note">Ghi chú điều chỉnh (*)</Label>
              <Textarea id="adjust-note" placeholder="VD: Kiểm kê kho định kỳ" rows={3} {...adjustForm.register("note")} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAdjustItem(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={adjustMutation.isPending} className="font-bold">
                {adjustMutation.isPending ? "Đang xử lý..." : "Lưu điều chỉnh kho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
