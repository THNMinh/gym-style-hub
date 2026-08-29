import { Link } from "@tanstack/react-router";
import {
  ShoppingBag,
  AlertTriangle,
  DollarSign,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/shared/lib/format";

export function DashboardFeature() {
  const kpiData = [
    {
      title: "Tổng doanh thu",
      value: formatPrice(128500000),
      change: "+18.2% so với tháng trước",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40",
    },
    {
      title: "Đơn hàng đang xử lý",
      value: "14 đơn",
      change: "4 đơn chờ giao hàng (Ship)",
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-950/40",
    },
    {
      title: "Cảnh báo tồn kho thấp",
      value: "3 biến thể",
      change: "Cần nhập bổ sung kho ngay",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-950/40",
    },
    {
      title: "Tổng sản phẩm Catalog",
      value: "42 sản phẩm",
      change: "8 danh mục sản phẩm",
      icon: Layers,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-950/40",
    },
  ];

  const quickLinks = [
    {
      title: "Quản lý & Xử lý Đơn hàng",
      description: "Xem các đơn hàng mới, bấm 'Xác nhận giao hàng' (Ship Order).",
      href: "/admin/orders",
      badge: "Orders",
      icon: Truck,
    },
    {
      title: "Quản lý Tồn kho Biến thể",
      description: "Tra cứu SKU, Nhập kho (Restock) và Điều chỉnh số lượng thực tế.",
      href: "/admin/inventory",
      badge: "Inventory",
      icon: AlertTriangle,
    },
    {
      title: "Báo cáo Tài chính & Giao dịch",
      description: "Lịch sử giao dịch thanh toán VnPay, MoMo, COD theo khoảng thời gian.",
      href: "/admin/finance",
      badge: "Finance",
      icon: DollarSign,
    },
    {
      title: "Quản lý Catalog & Hình ảnh",
      description: "Thêm/Sửa/Xóa sản phẩm, biến thể Màu/Size và upload ảnh sản phẩm.",
      href: "/admin/catalog",
      badge: "Catalog",
      icon: Layers,
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top KPI Banner */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border border-border/80 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.title}
                  </span>
                  <div className={`p-2.5 rounded-xl ${item.color}`}>
                    <Icon className="size-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-extrabold tracking-tight text-foreground">
                    {item.value}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <TrendingUp className="size-3 text-emerald-600" /> {item.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Access Modules */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground">Phân hệ Quản trị Hệ thống</h2>
          <p className="text-xs text-muted-foreground">Truy cập nhanh các tính năng vận hành CMS GymKitten</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {quickLinks.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title} className="border border-border/80 hover:border-primary/50 transition-all shadow-sm group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {module.badge}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold mt-3 group-hover:text-primary transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm" className="w-full font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={module.href}>
                      Truy cập quản lý <ArrowRight className="ml-1.5 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="size-4 text-primary" /> Lịch sử vận hành gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-semibold text-foreground">Xác nhận giao hàng đơn #GK-ORD-20260820-003</p>
                <p className="text-muted-foreground">Chuyển trạng thái sang Shipped</p>
              </div>
              <span className="text-muted-foreground font-mono">10 phút trước</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-semibold text-foreground">Bổ sung kho SKU: GK-HOODIE-ONYX-V1-M</p>
                <p className="text-muted-foreground">Thêm 50 sản phẩm vào kho</p>
              </div>
              <span className="text-muted-foreground font-mono">1 giờ trước</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Thanh toán MoMo thành công cho đơn #GK-ORD-20260820-001</p>
                <p className="text-muted-foreground">Số tiền: 1.085.000 ₫</p>
              </div>
              <span className="text-muted-foreground font-mono">3 giờ trước</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
