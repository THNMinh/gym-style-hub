import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyOrdersApi, cancelMyOrderApi } from "@/entities/order/services";
import {
  getMyAddressesApi,
  createAddressApi,
  updateAddressApi,
  setDefaultAddressApi,
  deleteAddressApi,
  changePassword,
} from "@/entities/identity/services";
import type { UserAddress, CreateAddressPayload } from "@/entities/identity/types";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/entities/order/types";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { AuthFeature } from "@/features/auth/components/auth-feature";
import { OrderTrackingModal } from "@/features/order/components/order-tracking-modal";
import { WriteOrderReviewModal } from "@/features/order/components/write-order-review-modal";
import { AdminPagination } from "@/features/admin/components/admin-pagination";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  Package,
  Truck,
  Clock,
  XCircle,
  CheckCircle2,
  Eye,
  ShoppingBag,
  Star,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Check,
  Lock,
  KeyRound,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function AccountFeature() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Filter & Pagination state for My Orders
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  // Address Modal State
  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // Address Form State
  const [receiverName, setReceiverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Office">("Home");
  const [isDefault, setIsDefault] = useState(false);

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
  const addressesQuery = useQuery({
    queryKey: ["user-addresses"],
    queryFn: getMyAddressesApi,
    enabled: !!user,
  });

  // Cancel Order Mutation
  const cancelMutation = useMutation({
    mutationFn: cancelMyOrderApi,
    onSuccess: (data) => {
      toast.success(data.message || "Đã hủy đơn hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  // Change Password State & Mutation
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!currentPassword) throw new Error("Vui lòng nhập mật khẩu hiện tại.");
      if (newPassword.length < 8) throw new Error("Mật khẩu mới phải có ít nhất 8 ký tự.");
      if (newPassword !== confirmNewPassword) throw new Error("Xác nhận mật khẩu mới chưa khớp.");
      return changePassword({ currentPassword, newPassword });
    },
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (err: any) => {
      const errCode = err?.code || err?.data?.errors?.[0]?.code;
      if (errCode === "Auth.WrongPassword") {
        toast.error("Mật khẩu hiện tại không chính xác.");
      } else {
        toast.error(err?.message || "Đổi mật khẩu thất bại.");
      }
    },
  });

  // Address CRUD Mutations
  const handleOpenCreateAddress = () => {
    setEditingAddress(null);
    setReceiverName(user?.fullName || "");
    setPhoneNumber(user?.phone || "");
    setAddressLine1("");
    setWard("");
    setDistrict("");
    setCity("");
    setAddressType("Home");
    setIsDefault((addressesQuery.data || []).length === 0);
    setOpenAddressModal(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddress(addr);
    setReceiverName(addr.receiverName);
    setPhoneNumber(addr.phoneNumber);
    setAddressLine1(addr.addressLine1);
    setWard(addr.ward || "");
    setDistrict(addr.district || "");
    setCity(addr.city || "");
    setAddressType(addr.addressType === "Office" ? "Office" : "Home");
    setIsDefault(addr.isDefault);
    setOpenAddressModal(true);
  };

  const saveAddressMutation = useMutation({
    mutationFn: async () => {
      const payload: CreateAddressPayload = {
        receiverName: receiverName.trim(),
        phoneNumber: phoneNumber.trim(),
        addressLine1: addressLine1.trim(),
        ward: ward.trim(),
        district: district.trim(),
        city: city.trim(),
        isDefault,
        addressType,
      };

      if (editingAddress) {
        return updateAddressApi(editingAddress.addressId, payload);
      }
      return createAddressApi(payload);
    },
    onSuccess: () => {
      toast.success(editingAddress ? "Đã cập nhật địa chỉ!" : "Đã thêm địa chỉ mới!");
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
      setOpenAddressModal(false);
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: setDefaultAddressApi,
    onSuccess: () => {
      toast.success("Đã đặt làm địa chỉ mặc định!");
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddressApi,
    onSuccess: () => {
      toast.success("Đã xóa địa chỉ!");
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
    onError: (err: Error) => toast.error(`Lỗi: ${err.message}`),
  });

  if (!hydrated) {
    return <div className="min-h-[50vh] flex items-center justify-center" />;
  }

  if (!user) {
    return <AuthFeature />;
  }

  const orderItems = myOrdersQuery.data?.items || [];
  const totalCount = myOrdersQuery.data?.totalCount || 0;
  const totalPages = myOrdersQuery.data?.totalPages || 1;

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-10 lg:px-8 space-y-8">
      {/* User Header Profile Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-border/80 rounded-2xl p-6 bg-card shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl border border-primary/20">
            {(user.fullName?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {user.fullName ?? "Tài khoản GymKitten"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] font-bold">
                {user.role}
              </Badge>
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                Đã xác thực email
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(user.role === "Admin" || user.role?.toLowerCase() === "admin") && (
            <Button
              size="sm"
              onClick={() => navigate({ to: "/admin/dashboard" })}
              className="font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Shield className="size-4" /> Quản trị Admin CMS
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => logout()} className="font-bold text-destructive hover:bg-destructive/10">
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md h-11 bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="orders" className="text-xs font-bold rounded-lg flex items-center gap-1.5">
            <Package className="size-4" /> Đơn hàng của tôi
          </TabsTrigger>
          <TabsTrigger value="addresses" className="text-xs font-bold rounded-lg flex items-center gap-1.5">
            <MapPin className="size-4" /> Sổ địa chỉ
          </TabsTrigger>
          <TabsTrigger value="profile" className="text-xs font-bold rounded-lg flex items-center gap-1.5">
            Tài khoản
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Orders (Shopee Card Design) */}
        <TabsContent value="orders" className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border">
            {[
              { key: "", label: "Tất cả đơn" },
              { key: "Pending", label: "Chờ xác nhận" },
              { key: "Processing", label: "Đang xử lý" },
              { key: "Shipped", label: "Đang giao" },
              { key: "Delivered", label: "Đã giao" },
              { key: "Cancelled", label: "Đã hủy" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                  statusFilter === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {myOrdersQuery.isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Đang nạp danh sách đơn hàng...
            </div>
          ) : orderItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="size-12 mx-auto text-muted-foreground/40" />
              <p className="text-sm font-bold text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {orderItems.map((order) => {
                const firstItem = order.items?.[0];
                const isDelivered =
                  order.currentStatus?.toLowerCase() === "delivered" ||
                  order.currentStatus?.toLowerCase() === "completed";
                const isPending = order.currentStatus?.toLowerCase() === "pending";
                const isProcessing = order.currentStatus?.toLowerCase() === "processing";
                const canCancel = isPending || isProcessing;

                return (
                  <div
                    key={order.orderId}
                    className="border border-border/80 rounded-2xl bg-card shadow-sm overflow-hidden hover:border-primary/40 transition-colors"
                  >
                    <div className="bg-muted/40 p-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <span className="font-mono text-primary text-sm">{order.orderCode}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-semibold text-[11px]">
                          {ORDER_STATUS_LABEL[order.currentStatus] || order.currentStatus}
                        </Badge>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px]">
                          {PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod} (
                          {order.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"})
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {order.items?.map((item) => (
                        <div key={item.orderItemId} className="flex gap-4 items-center text-sm">
                          <div className="size-16 rounded-lg bg-muted border overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-xs text-muted-foreground font-bold">
                                GK
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-foreground truncate">{item.productName}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                              SKU: {item.sku} | Số lượng: x{item.quantity}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-foreground">{formatPrice(item.unitPrice)}</p>
                            <p className="text-xs text-muted-foreground">
                              Tổng: {formatPrice(item.totalPrice)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted/20 p-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Thành tiền đơn hàng: </span>
                        <span className="text-lg font-black text-primary ml-1">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTrackingOrderId(order.orderId)}
                          className="h-9 text-xs font-bold gap-1"
                        >
                          <Eye className="size-3.5" /> Xem Chi Tiết & Timeline
                        </Button>

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
                            className="h-9 text-xs font-black bg-amber-500 hover:bg-amber-600 text-white gap-1 shadow-sm"
                          >
                            <Star className="size-3.5 fill-current" /> Đánh Giá Sản Phẩm
                          </Button>
                        )}

                        {canCancel && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={cancelMutation.isPending}
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn hủy đơn hàng ${order.orderCode}?`)) {
                                cancelMutation.mutate(order.orderId);
                              }
                            }}
                            className="h-9 text-xs font-bold gap-1"
                          >
                            <XCircle className="size-3.5" /> Hủy Đơn
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <AdminPagination
                page={page}
                pageSize={10}
                totalCount={totalCount}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Sổ Địa Chỉ (Real User Addresses APIs) */}
        <TabsContent value="addresses" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> Sổ Địa Chỉ Nhận Hàng Của Bạn
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Lưu danh sách địa chỉ nhận hàng để tự động chọn nhanh 1-Click khi thanh toán Checkout.
              </p>
            </div>

            <Button size="sm" onClick={handleOpenCreateAddress} className="font-bold gap-1.5">
              <Plus className="size-4" /> Thêm Địa Chỉ Mới
            </Button>
          </div>

          {addressesQuery.isLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Đang nạp sổ địa chỉ...
            </div>
          ) : !addressesQuery.data || addressesQuery.data.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl space-y-3">
              <MapPin className="size-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-bold text-muted-foreground">Bạn chưa có địa chỉ nhận hàng nào trong sổ.</p>
              <Button size="sm" onClick={handleOpenCreateAddress} className="font-bold">
                Thêm Địa Chỉ Đầu Tiên
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {addressesQuery.data.map((address) => (
                <div
                  key={address.addressId}
                  className={`border rounded-2xl p-5 text-sm bg-card shadow-sm space-y-3 transition-all ${
                    address.isDefault ? "border-primary/60 ring-1 ring-primary/30" : "border-border/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span className="text-base">{address.receiverName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {address.addressType === "Office" ? "Văn phòng" : "Nhà riêng"}
                      </Badge>
                    </div>

                    {address.isDefault && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                        <Check className="size-3 mr-1" /> Mặc định
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground font-mono">{address.phoneNumber}</p>

                  <p className="text-xs leading-relaxed text-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40">
                    {address.addressLine1}, {address.ward}, {address.district}, {address.city}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-border/60">
                    {!address.isDefault ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={setDefaultAddressMutation.isPending}
                        onClick={() => setDefaultAddressMutation.mutate(address.addressId)}
                        className="h-8 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10"
                      >
                        Thiết lập mặc định
                      </Button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold">✓ Địa chỉ mặc định</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditAddress(address)}
                        className="h-8 px-2.5 text-xs text-amber-600 hover:text-amber-700 font-bold"
                      >
                        <Edit3 className="size-3.5 mr-1" /> Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deleteAddressMutation.isPending}
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa địa chỉ của ${address.receiverName}?`)) {
                            deleteAddressMutation.mutate(address.addressId);
                          }
                        }}
                        className="h-8 px-2.5 text-xs text-destructive font-bold"
                      >
                        <Trash2 className="size-3.5 mr-1" /> Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Profile & Security */}
        <TabsContent value="profile" className="mt-6 space-y-6 text-xs max-w-xl">
          <div className="border rounded-2xl p-6 bg-card shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground pb-2 border-b border-border">Thông Tin Cá Nhân</h3>
            <div className="space-y-3">
              <p className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-semibold">Họ và tên:</span>{" "}
                <span className="font-bold text-foreground">{user.fullName ?? "—"}</span>
              </p>
              <p className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-semibold">Email:</span>{" "}
                <span className="font-bold text-foreground">{user.email}</span>
              </p>
              <p className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground font-semibold">Số điện thoại:</span>{" "}
                <span className="font-bold text-foreground">{user.phone ?? "—"}</span>
              </p>
              <p className="flex justify-between py-1">
                <span className="text-muted-foreground font-semibold">Vai trò hệ thống:</span>{" "}
                <Badge variant="outline">{user.role}</Badge>
              </p>
            </div>
          </div>

          <div className="border rounded-2xl p-6 bg-card shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <KeyRound className="size-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">Bảo Mật & Đổi Mật Khẩu</h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                changePasswordMutation.mutate();
              }}
              className="space-y-3.5"
            >
              <div className="space-y-1.5">
                <Label htmlFor="curr-pass" className="text-xs font-semibold">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground z-10 pointer-events-none" />
                  <PasswordInput
                    id="curr-pass"
                    required
                    placeholder="Nhập mật khẩu đang sử dụng"
                    className="pl-8 text-xs font-medium"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-pass" className="text-xs font-semibold">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground z-10 pointer-events-none" />
                  <PasswordInput
                    id="new-pass"
                    required
                    minLength={8}
                    placeholder="Tối thiểu 8 ký tự, gồm chữ hoa, thường và số"
                    className="pl-8 text-xs font-medium"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-new-pass" className="text-xs font-semibold">
                  Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground z-10 pointer-events-none" />
                  <PasswordInput
                    id="confirm-new-pass"
                    required
                    minLength={8}
                    placeholder="Nhập lại mật khẩu mới để xác nhận"
                    className="pl-8 text-xs font-medium"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full text-xs font-bold mt-2"
              >
                {changePasswordMutation.isPending ? "Đang xử lý..." : "Cập Nhật Mật Khẩu"}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Dialog Form Create / Edit Address */}
      <Dialog open={openAddressModal} onOpenChange={setOpenAddressModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg flex items-center gap-2 text-primary">
              <MapPin className="size-5" />
              {editingAddress ? "Chỉnh Sửa Địa Chỉ Nhận Hàng" : "Thêm Địa Chỉ Nhận Hàng Mới"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Nhập chính xác người nhận và thông tin giao hàng để tự động điền khi thanh toán.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveAddressMutation.mutate();
            }}
            className="space-y-4 py-2"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="addr-name" className="text-xs font-bold">Tên người nhận (*)</Label>
                <Input
                  id="addr-name"
                  placeholder="Nguyễn Văn A"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-phone" className="text-xs font-bold">Số điện thoại (*)</Label>
                <Input
                  id="addr-phone"
                  placeholder="0901234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-xs font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addr-line1" className="text-xs font-bold">Địa chỉ chi tiết (Số nhà, tên đường) (*)</Label>
              <Input
                id="addr-line1"
                placeholder="123 Đường Nguyễn Trãi"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr-ward" className="text-xs font-bold">Phường / Xã (*)</Label>
                <Input
                  id="addr-ward"
                  placeholder="Phường Bến Nghé"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-district" className="text-xs font-bold">Quận / Huyện (*)</Label>
                <Input
                  id="addr-district"
                  placeholder="Quận 1"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-city" className="text-xs font-bold">Tỉnh / TP (*)</Label>
                <Input
                  id="addr-city"
                  placeholder="TP. Hồ Chí Minh"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="addr-type" className="text-xs font-bold">Loại địa chỉ</Label>
                <select
                  id="addr-type"
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold"
                >
                  <option value="Home">Nhà riêng</option>
                  <option value="Office">Văn phòng / Công ty</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  id="addr-default"
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <Label htmlFor="addr-default" className="text-xs font-bold cursor-pointer">
                  Đặt làm địa chỉ mặc định
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setOpenAddressModal(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={saveAddressMutation.isPending} className="font-bold">
                {saveAddressMutation.isPending ? "Đang lưu..." : editingAddress ? "Cập Nhật Địa Chỉ" : "Lưu Địa Chỉ Mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Shopee Style Order Tracking Modal */}
      <OrderTrackingModal
        orderId={trackingOrderId}
        open={trackingOrderId !== null}
        onClose={() => setTrackingOrderId(null)}
      />

      {/* Write Review Modal */}
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
