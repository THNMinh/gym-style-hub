import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/app/(admin)/admin/layout";
import { CouponsFeature } from "@/features/admin/components/coupons-feature";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({
    meta: [{ title: "Quản lý Mã Giảm Giá — GYMKITTEN CMS" }],
  }),
  component: () => (
    <AdminLayout>
      <CouponsFeature />
    </AdminLayout>
  ),
});
