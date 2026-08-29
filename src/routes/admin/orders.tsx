import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/app/(admin)/admin/layout";
import { OrdersFeature } from "@/features/admin/components/orders-feature";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [{ title: "Quản lý Đơn hàng — GYMKITTEN CMS" }],
  }),
  component: () => (
    <AdminLayout>
      <OrdersFeature />
    </AdminLayout>
  ),
});
