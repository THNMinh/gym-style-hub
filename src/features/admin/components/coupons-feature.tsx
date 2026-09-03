import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Edit3,
  Trash2,
  Ticket,
  RefreshCw,
  Tag,
  Calendar,
  Coins,
  Ban,
  Search,
  Filter,
} from "lucide-react";
import {
  getAdminCouponsApi,
  createAdminCouponApi,
  updateAdminCouponApi,
  deleteAdminCouponApi,
} from "@/entities/coupon/services";
import type { CouponItemDto, CreateCouponPayload } from "@/entities/coupon/types";
import { DISCOUNT_TYPE_LABEL } from "@/entities/coupon/types";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPagination } from "@/features/admin/components/admin-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function CouponsFeature() {
  const queryClient = useQueryClient();

  // Filter & Pagination State
  const [searchCode, setSearchCode] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Dialog State
  const [openModal, setOpenModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItemDto | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"Percentage" | "FixedAmount">("Percentage");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(300000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | "">(50000);
  const [usageLimit, setUsageLimit] = useState<number | "">(100);
  const [startDate, setStartDate] = useState<string>("2026-09-01");
  const [endDate, setEndDate] = useState<string>("2026-12-31");
  const [isActive, setIsActive] = useState(true);

  // Fetch Coupons Query with Pagination & Filters
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-coupons", searchCode, filterType, filterStatus, page, pageSize],
    queryFn: () =>
      getAdminCouponsApi({
        code: searchCode.trim() || undefined,
        discountType: filterType || undefined,
        isActive:
          filterStatus === "active"
            ? true
            : filterStatus === "inactive"
            ? false
            : undefined,
        page,
        pageSize,
      }),
  });

  const coupons = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("Percentage");
    setDiscountValue(10);
    setMinOrderValue(300000);
    setMaxDiscountAmount(50000);
    setUsageLimit(100);
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setIsActive(true);
    setOpenModal(true);
  };

  const handleOpenEditModal = (coupon: CouponItemDto) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    const type = coupon.discountType?.toLowerCase().includes("fixed") ? "FixedAmount" : "Percentage";
    setDiscountType(type);
    setDiscountValue(coupon.discountValue);
    setMinOrderValue(coupon.minOrderValue);
    setMaxDiscountAmount(type === "FixedAmount" ? "" : coupon.maxDiscountAmount ?? "");
    setUsageLimit(coupon.usageLimit ?? "");
    setStartDate(
      coupon.startDate
        ? coupon.startDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
    setEndDate(
      coupon.endDate
        ? coupon.endDate.slice(0, 10)
        : new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    );
    setIsActive(coupon.isActive);
    setOpenModal(true);
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: CreateCouponPayload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        maxDiscountAmount:
          discountType === "FixedAmount" || maxDiscountAmount === ""
            ? null
            : Number(maxDiscountAmount),
        usageLimit: usageLimit === "" ? null : Number(usageLimit),
        startDate: startDate ? `${startDate}T00:00:00Z` : null,
        endDate: endDate ? `${endDate}T23:59:59Z` : null,
        isActive,
      };

      if (editingCoupon) {
        return updateAdminCouponApi(editingCoupon.couponId, payload);
      }
      return createAdminCouponApi(payload);
    },
    onSuccess: () => {
      toast.success(
        editingCoupon ? "Cập nhật mã giảm giá thành công!" : "Tạo mã giảm giá mới thành công!"
      );
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setOpenModal(false);
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAdminCouponApi,
    onSuccess: () => {
      toast.success("Xóa mềm mã giảm giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Ticket className="size-7 text-primary" /> Quản lý Mã Giảm Giá & Voucher
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Tìm kiếm, lọc và thiết lập các mã voucher khuyến mãi theo phần trăm (%) hoặc tiền cố định (VND).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 h-9">
            <RefreshCw className="size-3.5" /> Làm mới
          </Button>
          <Button size="sm" onClick={handleOpenCreateModal} className="gap-1.5 h-9 font-bold px-4 shadow-sm">
            <Plus className="size-4" /> Tạo Mã Giảm Giá Mới
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border border-border/80 shadow-sm rounded-xl">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo Mã Coupon (VD: GYM)..."
              value={searchCode}
              onChange={(e) => {
                setSearchCode(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs uppercase"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground flex-shrink-0" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold"
            >
              <option value="">Tất cả loại giảm giá</option>
              <option value="Percentage">Giảm theo Phần trăm (%)</option>
              <option value="FixedAmount">Giảm Tiền cố định (VND)</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đang tạm dừng</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Coupons Table Card */}
      <Card className="border border-border/80 shadow-md overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 border-b border-border text-xs uppercase font-bold text-muted-foreground">
              <tr>
                <th className="py-4 px-5">Mã Coupon (Code)</th>
                <th className="py-4 px-5">Loại Khuyến Mãi</th>
                <th className="py-4 px-5">Mức Giảm</th>
                <th className="py-4 px-5">Đơn Tối Thiểu</th>
                <th className="py-4 px-5">Giảm Tối Đa</th>
                <th className="py-4 px-5 text-center">Đã Dùng / Giới Hạn</th>
                <th className="py-4 px-5">Thời Gian Áp Dụng</th>
                <th className="py-4 px-5 text-center">Trạng Thái</th>
                <th className="py-4 px-5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    Đang nạp danh sách mã giảm giá...
                  </td>
                </tr>
              ) : !coupons || coupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    Không tìm thấy mã giảm giá nào phù hợp.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const isFixed = c.discountType?.toLowerCase().includes("fixed");
                  return (
                    <tr key={c.couponId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-5 font-mono font-black text-base text-primary">
                        {c.code}
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                          {DISCOUNT_TYPE_LABEL[c.discountType] || c.discountType}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 font-bold text-foreground">
                        {isFixed ? formatPrice(c.discountValue) : `${c.discountValue}%`}
                      </td>
                      <td className="py-4 px-5 text-xs font-semibold text-muted-foreground">
                        {formatPrice(c.minOrderValue)}
                      </td>
                      <td className="py-4 px-5 text-xs font-semibold text-muted-foreground">
                        {isFixed ? (
                          <span className="text-muted-foreground/60 italic font-normal">N/A (Giảm cố định)</span>
                        ) : c.maxDiscountAmount ? (
                          formatPrice(c.maxDiscountAmount)
                        ) : (
                          "Không giới hạn"
                        )}
                      </td>
                      <td className="py-4 px-5 text-center text-xs font-mono font-bold">
                        {c.usedCount ?? 0} / {c.usageLimit ?? "∞"}
                      </td>
                      <td className="py-4 px-5 text-[11px] text-muted-foreground font-mono leading-tight">
                        <div>Từ: {c.startDate ? formatDate(c.startDate) : "N/A"}</div>
                        <div>Đến: {c.endDate ? formatDate(c.endDate) : "N/A"}</div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        {c.isActive ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-2 py-0.5 font-bold">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-xs px-2 py-0.5">
                            Tạm dừng
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(c)}
                          className="h-8 px-3 text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        >
                          <Edit3 className="size-3.5 mr-1" /> Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa mềm mã ${c.code}?`)) {
                              deleteMutation.mutate(c.couponId);
                            }
                          }}
                          className="h-8 px-3 text-xs text-destructive hover:bg-destructive/10 font-bold"
                        >
                          <Trash2 className="size-3.5 mr-1" /> Xóa
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Card>

      {/* Modal Dialog Form Create / Edit Coupon */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-2xl sm:max-w-3xl p-6 sm:p-8 rounded-2xl border border-border shadow-2xl">
          <DialogHeader className="pb-4 border-b border-border/80">
            <DialogTitle className="font-extrabold text-xl flex items-center gap-2.5 text-primary">
              <Ticket className="size-6" />
              {editingCoupon ? `Cập nhật Mã Giảm Giá #${editingCoupon.code}` : "Tạo Mã Giảm Giá Mới"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Điền các thông số chi tiết của voucher khuyến mãi. Khách hàng sẽ nhập mã này khi tiến hành Checkout.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="space-y-6 pt-4"
          >
            {/* Section 1: Mã & Loại Giảm */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Tag className="size-3.5 text-primary" /> 1. Định danh & Loại khuyến mãi
              </span>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="coupon-code" className="text-xs font-bold text-foreground">
                    Mã Khuyến Mãi (Code) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="coupon-code"
                    placeholder="Ví dụ: GYMKITTEN10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="h-10 font-mono uppercase font-black text-sm tracking-wider"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">Mã in hoa ngắn gọn dễ nhớ cho khách hàng.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount-type" className="text-xs font-bold text-foreground">
                    Loại Giảm Giá <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="discount-type"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Percentage">Giảm theo Phần trăm (%)</option>
                    <option value="FixedAmount">Giảm Tiền cố định (VND)</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    {discountType === "Percentage"
                      ? "Giảm % tổng tiền đơn hàng (VD: 10%, 20%)."
                      : "Trừ trực tiếp số tiền cố định (VD: 50.000đ, 100.000đ)."}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Mức Giảm & Điều Kiện */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <span className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Coins className="size-3.5 text-primary" /> 2. Mức giảm & Điều kiện áp dụng
              </span>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="discount-value" className="text-xs font-bold text-foreground">
                    {discountType === "Percentage" ? "Mức giảm (%)" : "Số tiền giảm (VND)"}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="discount-value"
                      type="number"
                      placeholder={discountType === "Percentage" ? "10" : "50000"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="h-10 text-sm font-bold pr-8"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                      {discountType === "Percentage" ? "%" : "đ"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-order" className="text-xs font-bold text-foreground">
                    Giá trị đơn tối thiểu (VND) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="min-order"
                    type="number"
                    placeholder="300000"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="h-10 text-sm font-medium"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">Ví dụ: Chỉ áp dụng cho đơn từ 300k trở lên.</p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="max-discount"
                    className={`text-xs font-bold ${
                      discountType === "FixedAmount" ? "text-muted-foreground opacity-60" : "text-foreground"
                    }`}
                  >
                    Giảm tối đa (VND)
                  </Label>
                  <div className="relative">
                    <Input
                      id="max-discount"
                      type="number"
                      placeholder={discountType === "FixedAmount" ? "Không áp dụng" : "50000 (Để trống = ∞)"}
                      value={discountType === "FixedAmount" ? "" : maxDiscountAmount}
                      onChange={(e) =>
                        setMaxDiscountAmount(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      disabled={discountType === "FixedAmount"}
                      className={`h-10 text-sm font-medium transition-all ${
                        discountType === "FixedAmount"
                          ? "bg-muted/60 opacity-50 cursor-not-allowed border-dashed select-none"
                          : ""
                      }`}
                    />
                    {discountType === "FixedAmount" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                        <Ban className="size-3" /> N/A
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {discountType === "FixedAmount"
                      ? "Đã làm mờ: Mã tiền cố định không cần mốc giảm tối đa."
                      : "Giới hạn số tiền giảm tối đa đối với mã phần trăm."}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Giới Hạn & Thời Gian */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <span className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" /> 3. Thời gian hiệu lực & Lượt sử dụng
              </span>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="usage-limit" className="text-xs font-bold text-foreground">
                    Tổng lượt dùng tối đa
                  </Label>
                  <Input
                    id="usage-limit"
                    type="number"
                    placeholder="100 (Để trống = Không giới hạn)"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-10 text-sm font-medium"
                  />
                  <p className="text-[11px] text-muted-foreground">Tự động khóa mã khi đủ lượt.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-xs font-bold text-foreground">
                    Ngày bắt đầu <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 text-sm font-semibold cursor-pointer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="end-date" className="text-xs font-bold text-foreground">
                      Ngày hết hạn <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          const base = startDate ? new Date(startDate) : new Date();
                          base.setDate(base.getDate() + 7);
                          setEndDate(base.toISOString().slice(0, 10));
                        }}
                        className="text-primary hover:underline font-bold bg-primary/10 px-1.5 py-0.5 rounded"
                      >
                        +7 ngày
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const base = startDate ? new Date(startDate) : new Date();
                          base.setDate(base.getDate() + 30);
                          setEndDate(base.toISOString().slice(0, 10));
                        }}
                        className="text-primary hover:underline font-bold bg-primary/10 px-1.5 py-0.5 rounded"
                      >
                        +30 ngày
                      </button>
                    </div>
                  </div>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 text-sm font-semibold cursor-pointer"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Checkbox Trạng Thái */}
            <div className="flex items-center gap-3 pt-3 border-t border-border/60">
              <input
                id="is-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <Label htmlFor="is-active" className="text-sm font-bold cursor-pointer text-foreground flex items-center gap-1.5">
                Kích hoạt mã ngay sau khi lưu (IsActive)
              </Label>
            </div>

            <DialogFooter className="pt-4 border-t border-border/80 flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setOpenModal(false)} className="h-11 px-6 font-bold">
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={saveMutation.isPending} className="h-11 px-8 font-extrabold text-sm shadow-md">
                {saveMutation.isPending ? "Đang lưu..." : editingCoupon ? "Cập Nhật Mã Giảm Giá" : "Tạo Mã Giảm Giá"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
