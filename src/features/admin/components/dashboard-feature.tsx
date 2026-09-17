import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  AlertTriangle,
  DollarSign,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Truck,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/shared/lib/format";
import {
  getAdminOrdersApi,
  getInventoryApi,
  getProductsAdminApi,
  getCategoriesApi,
  getFinanceTransactionsApi,
} from "@/entities/admin/services";
import type { AdminOrderItem } from "@/entities/admin/types";
import { ORDER_STATUS_LABEL } from "@/entities/order/types";

export function DashboardFeature() {
  // Fetch Real Admin Orders Data
  const ordersQuery = useQuery({
    queryKey: ["admin-dashboard-orders"],
    queryFn: () => getAdminOrdersApi({ page: 1, pageSize: 100 }),
  });

  // Fetch Real Admin Inventory Data
  const inventoryQuery = useQuery({
    queryKey: ["admin-dashboard-inventory"],
    queryFn: () => getInventoryApi({ page: 1, pageSize: 100 }),
  });

  // Fetch Real Admin Catalog Products
  const productsQuery = useQuery({
    queryKey: ["admin-dashboard-products"],
    queryFn: () => getProductsAdminApi(1, 100),
  });

  // Fetch Real Categories
  const categoriesQuery = useQuery({
    queryKey: ["admin-dashboard-categories"],
    queryFn: getCategoriesApi,
  });

  // Fetch Real Finance Transactions
  const financeQuery = useQuery({
    queryKey: ["admin-dashboard-finance"],
    queryFn: () => getFinanceTransactionsApi({ page: 1, pageSize: 20 }),
  });

  const orders = ordersQuery.data?.items || [];
  const inventoryItems = inventoryQuery.data?.items || [];
  const products = productsQuery.data?.items || [];
  const categories = categoriesQuery.data || [];
  const transactions = financeQuery.data?.items || [];

  // KPI Calculations
  const totalRevenue = orders.reduce((sum: number, o: AdminOrderItem) => {
    return o.paymentStatus === "Paid" || o.currentStatus === "Delivered" || o.currentStatus === "Shipped"
      ? sum + (o.totalAmount || 0)
      : sum;
  }, 0);

  const processingOrdersCount = orders.filter(
    (o: AdminOrderItem) => o.currentStatus === "Pending" || o.currentStatus === "Processing"
  ).length;

  const shippedOrdersCount = orders.filter((o: AdminOrderItem) => o.currentStatus === "Shipped").length;

  const lowStockItems = inventoryItems.filter(
    (i) => (i.availableStock ?? i.quantityOnHand ?? 0) <= 15
  );

  const totalProductsCount = productsQuery.data?.totalCount || products.length;
  const totalCategoriesCount = categories.length;

  const kpiData = [
    {
      title: "Tổng doanh thu",
      value: formatPrice(totalRevenue),
      change: `${orders.length} tổng đơn hàng ghi nhận`,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40",
    },
    {
      title: "Đơn hàng đang xử lý",
      value: `${processingOrdersCount} đơn`,
      change: `${shippedOrdersCount} đơn đang trên đường giao (Ship)`,
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-950/40",
    },
    {
      title: "Cảnh báo tồn kho thấp",
      value: `${lowStockItems.length} biến thể`,
      change: lowStockItems.length > 0 ? "Cần nhập bổ sung kho ngay" : "Kho hàng ổn định",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-950/40",
    },
    {
      title: "Tổng sản phẩm Catalog",
      value: `${totalProductsCount} sản phẩm`,
      change: `${totalCategoriesCount} danh mục sản phẩm`,
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
      description: "Lịch sử giao dịch thanh toán MoMo, COD theo khoảng thời gian.",
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

  const isLoading =
    ordersQuery.isLoading ||
    inventoryQuery.isLoading ||
    productsQuery.isLoading ||
    categoriesQuery.isLoading;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tổng quan Quản trị (CMS Dashboard)</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Báo cáo tổng hợp số liệu thực tế về Doanh thu, Đơn hàng, Tồn kho và Catalog GymKitten
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            ordersQuery.refetch();
            inventoryQuery.refetch();
            productsQuery.refetch();
            categoriesQuery.refetch();
            financeQuery.refetch();
          }}
          className="gap-2 text-xs"
        >
          <RefreshCw className="size-3.5" /> Làm mới dữ liệu
        </Button>
      </div>

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
                    {isLoading ? "..." : item.value}
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

      {/* Live Recent Activities from DB */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="size-4 text-primary" /> Đơn hàng & Lịch sử vận hành gần đây (Live Data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-xs">
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Chưa có dữ liệu vận hành đơn hàng.</p>
            ) : (
              orders.slice(0, 5).map((ord: AdminOrderItem) => (
                <div key={ord.orderId} className="flex items-center justify-between border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground flex items-center gap-2">
                      <span>Đơn hàng #{ord.orderCode}</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {ORDER_STATUS_LABEL[ord.currentStatus] || ord.currentStatus}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Khách hàng: <strong className="text-foreground">{ord.userEmail || "N/A"}</strong> — Giá trị: <strong className="text-emerald-600">{formatPrice(ord.totalAmount)}</strong>
                    </p>
                  </div>
                  <span className="text-muted-foreground font-mono text-[11px] shrink-0 ml-4">
                    {formatDate(ord.createdAt || new Date().toISOString())}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
