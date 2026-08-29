import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/app/(admin)/admin/layout";
import { InventoryFeature } from "@/features/admin/components/inventory-feature";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [{ title: "Quản lý Tồn kho — GYMKITTEN CMS" }],
  }),
  component: () => (
    <AdminLayout>
      <InventoryFeature />
    </AdminLayout>
  ),
});
