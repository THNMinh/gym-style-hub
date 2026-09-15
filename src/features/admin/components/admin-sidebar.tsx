import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  DollarSign,
  Layers,
  Store,
  LogOut,
  Dumbbell,
  Star,
  Ticket,
  Users,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Tổng quan (Dashboard)", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Quản lý Người dùng", href: "/admin/users", icon: Users },
  { name: "Quản lý Đơn hàng", href: "/admin/orders", icon: ShoppingBag },
  { name: "Quản lý Tồn kho", href: "/admin/inventory", icon: Package },
  { name: "Báo cáo Tài chính", href: "/admin/finance", icon: DollarSign },
  { name: "Quản lý Catalog & Sản phẩm", href: "/admin/catalog", icon: Layers },
  { name: "Kiểm duyệt Đánh giá", href: "/admin/reviews", icon: Star },
  { name: "Quản lý Mã Giảm Giá", href: "/admin/coupons", icon: Ticket },
  { name: "Nhật ký System Logs", href: "/admin/system-logs", icon: ShieldAlert },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth", search: {} as never });
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <Link to="/admin/dashboard" className="h-16 flex items-center px-6 border-b border-slate-800 gap-3 hover:bg-slate-800/50 transition-colors">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black">
          <Dumbbell className="size-5" />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-wider text-white">GYMKITTEN</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Admin CMS Portal
          </p>
        </div>
      </Link>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Quản trị hệ thống
        </div>
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "size-4 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-primary-foreground" : "text-slate-400 group-hover:text-white",
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Quick Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Store className="size-4 text-slate-400" />
          <span>Về trang bán hàng (Client)</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
        >
          <LogOut className="size-4" />
          <span>Đăng xuất Admin</span>
        </button>
      </div>
    </aside>
  );
}
