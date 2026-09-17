import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Search,
  RotateCcw,
  RefreshCw,
  Shield,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit3,
  Lock,
  ShoppingBag,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import {
  getAdminUsersApi,
  getAdminUserByIdApi,
  createAdminUserApi,
  updateAdminUserApi,
} from "@/entities/admin/services";
import type {
  AdminUserItemDto,
  AdminUserDetailsResponse,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from "@/entities/admin/types";
import { useAuthStore } from "@/features/auth/store";
import { formatDateTime, formatDate, formatPrice } from "@/shared/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PasswordInput } from "@/components/ui/password-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminPagination } from "@/features/admin/components/admin-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function UsersFeature() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals State
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  // Selected User State
  const [selectedUser, setSelectedUser] = useState<AdminUserItemDto | null>(null);
  const [selectedUserIdForDetail, setSelectedUserIdForDetail] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState<CreateAdminUserPayload>({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "Customer",
    isActive: true,
  });

  // Update Form State (STRICTLY NO PASSWORD)
  const [updateForm, setUpdateForm] = useState<UpdateAdminUserPayload>({
    fullName: "",
    phone: "",
    role: "Customer",
    isActive: true,
    isEmailVerified: true,
  });

  // Query: Get Users List
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-users", searchTerm, roleFilter, statusFilter, page],
    queryFn: () =>
      getAdminUsersApi({
        searchTerm: searchTerm.trim() || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter === "" ? undefined : statusFilter === "true",
        page,
        pageSize,
      }),
  });

  // Query: Get User Details by ID
  const { data: userDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["admin-user-detail", selectedUserIdForDetail],
    queryFn: () =>
      selectedUserIdForDetail ? getAdminUserByIdApi(selectedUserIdForDetail) : Promise.resolve(null),
    enabled: !!selectedUserIdForDetail,
  });

  // Mutation: Create User
  const createMutation = useMutation({
    mutationFn: createAdminUserApi,
    onSuccess: (newUser) => {
      toast.success(`Đã tạo tài khoản "${newUser.email}" thành công!`);
      setOpenCreateModal(false);
      resetCreateForm();
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Lỗi khi tạo người dùng.");
    },
  });

  // Mutation: Update User
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminUserPayload }) =>
      updateAdminUserApi(id, payload),
    onSuccess: (updated) => {
      toast.success(`Đã cập nhật thông tin "${updated.email}" thành công!`);
      setOpenUpdateModal(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", updated.userId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Lỗi khi cập nhật người dùng.");
    },
  });

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const resetCreateForm = () => {
    setCreateForm({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      role: "Customer",
      isActive: true,
    });
  };

  const handleOpenUpdate = (user: AdminUserItemDto) => {
    setSelectedUser(user);
    setUpdateForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    });
    setOpenUpdateModal(true);
  };

  const handleOpenDetail = (user: AdminUserItemDto) => {
    setSelectedUser(user);
    setSelectedUserIdForDetail(user.userId);
    setOpenDetailModal(true);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Đã sao chép User ID!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Get Initials for Avatar
  const getInitials = (name?: string | null, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      const first = parts[0]?.charAt(0) || "";
      const last = parts[parts.length - 1]?.charAt(0) || "";
      if (first && last) return `${first}${last}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : "GK";
  };

  // Quick stats calculation
  const totalCount = data?.totalCount ?? 0;
  const items = data?.items ?? [];
  const adminCount = items.filter((u) => u.role.toLowerCase() === "admin").length;
  const customerCount = items.filter((u) => u.role.toLowerCase() === "customer").length;
  const activeCount = items.filter((u) => u.isActive).length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/60 p-6 rounded-2xl border border-border shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-5" />
            </div>
            Quản lý Người dùng & Tài khoản
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Quản trị hồ sơ khách hàng, phân quyền Admin, kiểm soát bảo mật và theo dõi hành trình mua sắm.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            id="btn-refresh-users"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Làm mới
          </Button>

          <Button
            id="btn-open-create-user"
            size="sm"
            onClick={() => {
              resetCreateForm();
              setOpenCreateModal(true);
            }}
            className="h-10 text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <UserPlus className="size-4" />
            + Thêm người dùng mới
          </Button>
        </div>
      </div>

      {/* 2. Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/80 bg-card/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tổng người dùng
              </div>
              <div className="text-xl font-black text-foreground">{totalCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Shield className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quản trị viên (Admin)
              </div>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400">
                {adminCount}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Khách hàng (Customer)
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {customerCount}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Đang hoạt động
              </div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {activeCount}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filter & Search Controls */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="input-search-users"
                placeholder="Tìm kiếm theo email, họ tên, số điện thoại..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-10 text-sm bg-background"
              />
            </div>

            {/* Role Filter */}
            <div className="w-full md:w-48">
              <select
                id="select-filter-role"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Tất cả vai trò</option>
                <option value="Customer">Khách hàng (Customer)</option>
                <option value="Admin">Quản trị viên (Admin)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                id="select-filter-status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 px-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Đã vô hiệu hóa</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(searchTerm || roleFilter || statusFilter) && (
              <Button
                id="btn-reset-filters"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 text-xs text-muted-foreground hover:text-foreground gap-1 shrink-0"
              >
                <RotateCcw className="size-3.5" /> Xóa bộ lọc
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. Users Data Table */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4">Người dùng</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Xác thực Email</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4" colSpan={7}>
                      <div className="h-6 bg-muted rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 text-muted-foreground/50" />
                      <p className="font-semibold text-sm">Không tìm thấy người dùng nào phù hợp</p>
                      <p className="text-xs">Hãy thử thay đổi từ khóa tìm kiếm hoặc điều kiện lọc</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((user) => {
                  const isCurrentLoggedUser = currentUser?.email === user.email;
                  return (
                    <tr
                      key={user.userId}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 border border-border shrink-0">
                            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName || user.email} />}
                            <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                              {getInitials(user.fullName, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-bold text-foreground text-sm flex items-center gap-1.5 truncate">
                              <span>{user.fullName || "Chưa cập nhật tên"}</span>
                              {isCurrentLoggedUser && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-primary text-primary font-bold">
                                  Bạn
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="size-3 shrink-0 text-muted-foreground/70" />
                              <span>{user.email}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(user.userId, user.userId)}
                              className="text-[10px] font-mono text-muted-foreground/70 hover:text-foreground flex items-center gap-1 mt-0.5"
                              title="Nhấp để copy User ID"
                            >
                              <span>ID: {user.userId.slice(0, 8)}...</span>
                              {copiedId === user.userId ? (
                                <Check className="size-2.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-2.5 opacity-60 group-hover:opacity-100" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-xs font-medium text-foreground">
                        {user.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone className="size-3 text-muted-foreground" />
                            <span>{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">Chưa có SĐT</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {user.role.toLowerCase() === "admin" ? (
                          <Badge className="bg-purple-600/15 text-purple-700 dark:text-purple-400 border border-purple-500/30 gap-1 font-bold text-xs">
                            <Shield className="size-3" /> Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20 gap-1 font-medium text-xs">
                            <Users className="size-3 text-slate-500" /> Customer
                          </Badge>
                        )}
                      </td>

                      {/* Email Verification */}
                      <td className="py-3.5 px-4">
                        {user.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-3.5 text-emerald-500" /> Đã xác thực
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <AlertCircle className="size-3.5 text-amber-500" /> Chưa xác thực
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {user.isActive ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold text-[11px]">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-semibold text-[11px]">
                            Vô hiệu hóa
                          </Badge>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground font-medium">
                        {formatDateTime(user.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            id={`btn-view-user-${user.userId}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(user)}
                            className="size-8 p-0 text-muted-foreground hover:text-foreground"
                            title="Xem chi tiết người dùng"
                          >
                            <Eye className="size-4" />
                          </Button>

                          <Button
                            id={`btn-edit-user-${user.userId}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenUpdate(user)}
                            className="size-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit3 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <AdminPagination
          page={page}
          pageSize={pageSize}
          totalCount={data?.totalCount ?? 0}
          totalPages={data?.totalPages ?? 1}
          onPageChange={setPage}
        />
      </Card>

      {/* 5. Create User Dialog */}
      <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <UserPlus className="size-5 text-primary" /> Thêm người dùng mới
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tạo tài khoản người dùng hoặc quản trị viên mới trên hệ thống GymKitten.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!createForm.email || !createForm.password) {
                toast.error("Vui lòng điền đầy đủ Email và Mật khẩu!");
                return;
              }
              createMutation.mutate(createForm);
            }}
            className="space-y-4 pt-2"
          >
            <div className="space-y-1.5">
              <Label htmlFor="create-email" className="text-xs font-bold">
                Địa chỉ Email <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="create-email"
                type="email"
                placeholder="example@gymkitten.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-password" className="text-xs font-bold">
                Mật khẩu ban đầu <span className="text-rose-500">*</span>
              </Label>
              <PasswordInput
                id="create-password"
                placeholder="Tối thiểu 6 ký tự..."
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                required
                minLength={6}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-fullname" className="text-xs font-bold">
                  Họ và tên
                </Label>
                <Input
                  id="create-fullname"
                  placeholder="Nguyễn Văn A"
                  value={createForm.fullName || ""}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-phone" className="text-xs font-bold">
                  Số điện thoại
                </Label>
                <Input
                  id="create-phone"
                  placeholder="0912345678"
                  value={createForm.phone || ""}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-role" className="text-xs font-bold">
                Vai trò người dùng <span className="text-rose-500">*</span>
              </Label>
              <select
                id="create-role"
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full h-10 px-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Customer">Khách hàng (Customer)</option>
                <option value="Admin">Quản trị viên (Admin - Full quyền)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <div className="text-xs font-bold text-foreground">Kích hoạt tài khoản ngay</div>
                <div className="text-[11px] text-muted-foreground">Người dùng có thể đăng nhập ngay lập tức</div>
              </div>
              <Switch
                id="create-isactive"
                checked={createForm.isActive}
                onCheckedChange={(checked) => setCreateForm({ ...createForm, isActive: checked })}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenCreateModal(false)}
                className="text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="text-xs font-bold bg-primary text-primary-foreground"
              >
                {createMutation.isPending ? "Đang tạo..." : "Xác nhận tạo tài khoản"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Update User Dialog (STRICTLY NO PASSWORD) */}
      <Dialog open={openUpdateModal} onOpenChange={setOpenUpdateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <Edit3 className="size-5 text-blue-500" /> Cập nhật người dùng
            </DialogTitle>
            <DialogDescription className="text-xs">
              Chỉnh sửa thông tin hồ sơ và vai trò người dùng trong hệ thống.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  id: selectedUser.userId,
                  payload: updateForm,
                });
              }}
              className="space-y-4 pt-2"
            >
              {/* Security info banner: Password is not allowed here */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs">
                <Lock className="size-4 shrink-0 mt-0.5 text-blue-500" />
                <div>
                  <strong>Bảo mật tài khoản:</strong> Mật khẩu không thể thay đổi tại màn hình này. Người dùng tự đổi mật khẩu qua tính năng Quên mật khẩu hoặc Đổi mật khẩu cá nhân.
                </div>
              </div>

              {/* Email (Read only) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground">Địa chỉ Email (Cố định)</Label>
                <div className="relative">
                  <Input
                    value={selectedUser.email}
                    disabled
                    className="bg-muted/50 text-muted-foreground text-sm cursor-not-allowed pl-8"
                  />
                  <Lock className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="update-fullname" className="text-xs font-bold">
                    Họ và tên
                  </Label>
                  <Input
                    id="update-fullname"
                    value={updateForm.fullName || ""}
                    onChange={(e) => setUpdateForm({ ...updateForm, fullName: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="update-phone" className="text-xs font-bold">
                    Số điện thoại
                  </Label>
                  <Input
                    id="update-phone"
                    value={updateForm.phone || ""}
                    onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="update-role" className="text-xs font-bold">
                  Vai trò người dùng
                </Label>
                <select
                  id="update-role"
                  value={updateForm.role}
                  disabled={currentUser?.email === selectedUser.email}
                  onChange={(e) => setUpdateForm({ ...updateForm, role: e.target.value })}
                  className="w-full h-10 px-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="Customer">Khách hàng (Customer)</option>
                  <option value="Admin">Quản trị viên (Admin)</option>
                </select>
                {currentUser?.email === selectedUser.email && (
                  <p className="text-[10px] text-amber-500 italic">
                    * Bạn không thể tự thay đổi vai trò Admin của chính mình.
                  </p>
                )}
              </div>

              {/* Switches: IsActive & IsEmailVerified */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div>
                    <div className="text-xs font-bold text-foreground">Trạng thái hoạt động</div>
                    <div className="text-[11px] text-muted-foreground">Bật để cho phép đăng nhập</div>
                  </div>
                  <Switch
                    id="update-isactive"
                    disabled={currentUser?.email === selectedUser.email}
                    checked={updateForm.isActive}
                    onCheckedChange={(checked) => setUpdateForm({ ...updateForm, isActive: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div>
                    <div className="text-xs font-bold text-foreground">Đã xác thực Email</div>
                    <div className="text-[11px] text-muted-foreground">Đánh dấu email đã được xác minh</div>
                  </div>
                  <Switch
                    id="update-isverified"
                    checked={updateForm.isEmailVerified}
                    onCheckedChange={(checked) => setUpdateForm({ ...updateForm, isEmailVerified: checked })}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenUpdateModal(false)}
                  className="text-xs"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 7. User Details Dialog */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black">
              <Eye className="size-5 text-primary" /> Chi tiết Người dùng
            </DialogTitle>
            <DialogDescription className="text-xs">
              Hồ sơ tổng quan, sổ địa chỉ nhận hàng và 10 đơn hàng gần nhất của khách hàng.
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <RefreshCw className="size-6 animate-spin text-primary" />
              <p className="text-xs font-semibold">Đang tải dữ liệu chi tiết người dùng...</p>
            </div>
          ) : userDetail ? (
            <div className="space-y-6 pt-2">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3.5">
                  <Avatar className="size-14 border-2 border-primary/20">
                    {userDetail.avatarUrl && <AvatarImage src={userDetail.avatarUrl} alt={userDetail.fullName || userDetail.email} />}
                    <AvatarFallback className="text-base font-black bg-primary/10 text-primary">
                      {getInitials(userDetail.fullName, userDetail.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      {userDetail.fullName || "Chưa đặt họ tên"}
                      {userDetail.role.toLowerCase() === "admin" ? (
                        <Badge className="bg-purple-600/15 text-purple-700 dark:text-purple-400 border-purple-500/30 text-[10px]">
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Customer
                        </Badge>
                      )}
                    </h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Mail className="size-3 text-muted-foreground" /> {userDetail.email}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Phone className="size-3 text-muted-foreground" /> {userDetail.phone || "Chưa có số điện thoại"}
                    </div>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-border sm:pl-4">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase">Trạng thái</div>
                  <div className="mt-1">
                    {userDetail.isActive ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                        Đang hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30">
                        Đã khóa
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Spend & Order Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <ShoppingBag className="size-3.5 text-blue-500" /> Tổng đơn hàng
                  </div>
                  <div className="text-lg font-black text-foreground mt-1">
                    {userDetail.totalOrders} đơn
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <DollarSign className="size-3.5 text-emerald-500" /> Tổng chi tiêu
                  </div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatPrice(userDetail.totalSpent)}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="size-3.5 text-amber-500" /> Ngày đăng ký
                  </div>
                  <div className="text-xs font-bold text-foreground mt-1">
                    {formatDate(userDetail.createdAt)}
                  </div>
                </div>
              </div>

              {/* Tabs: Sổ Địa chỉ & Đơn hàng gần nhất */}
              <Tabs defaultValue="addresses" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="addresses" className="text-xs font-bold gap-1.5">
                    <MapPin className="size-3.5" /> Sổ địa chỉ ({userDetail.addresses.length})
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="text-xs font-bold gap-1.5">
                    <ShoppingBag className="size-3.5" /> Đơn hàng gần nhất ({userDetail.recentOrders.length})
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Sổ địa chỉ */}
                <TabsContent value="addresses" className="space-y-3 pt-2">
                  {userDetail.addresses.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                      Khách hàng chưa lưu địa chỉ nhận hàng nào.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userDetail.addresses.map((addr) => (
                        <div
                          key={addr.addressId}
                          className="p-3 rounded-lg border border-border bg-background text-xs space-y-1 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">
                              {addr.receiverName} — {addr.phoneNumber}
                            </span>
                            {addr.isDefault && (
                              <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">
                                Mặc định
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            {addr.addressLine1}, {addr.ward}, {addr.district}, {addr.city}
                          </p>
                          <div className="text-[10px] text-muted-foreground/70 uppercase">
                            Loại địa chỉ: {addr.addressType || "Nhà riêng"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Đơn hàng gần nhất */}
                <TabsContent value="orders" className="space-y-3 pt-2">
                  {userDetail.recentOrders.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                      Khách hàng chưa thực hiện đơn đặt hàng nào.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-border rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                          <tr>
                            <th className="p-2.5">Mã đơn</th>
                            <th className="p-2.5">Ngày đặt</th>
                            <th className="p-2.5">Tổng tiền</th>
                            <th className="p-2.5">Trạng thái</th>
                            <th className="p-2.5">Thanh toán</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {userDetail.recentOrders.map((ord) => (
                            <tr key={ord.orderId} className="hover:bg-muted/30">
                              <td className="p-2.5 font-mono font-bold text-primary">
                                #{ord.orderCode}
                              </td>
                              <td className="p-2.5 text-muted-foreground">
                                {formatDate(ord.createdAt)}
                              </td>
                              <td className="p-2.5 font-bold text-foreground">
                                {formatPrice(ord.totalAmount)}
                              </td>
                              <td className="p-2.5">
                                <Badge variant="outline" className="text-[10px] font-semibold">
                                  {ord.currentStatus}
                                </Badge>
                              </td>
                              <td className="p-2.5 text-[11px] text-muted-foreground">
                                {ord.paymentMethod} ({ord.paymentStatus})
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-rose-500 font-semibold">
              Không thể tải chi tiết người dùng này.
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDetailModal(false)}
              className="text-xs"
            >
              Đóng cửa sổ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
