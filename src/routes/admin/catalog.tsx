import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/app/(admin)/admin/layout";
import { CatalogFeature } from "@/features/admin/components/catalog-feature";

export const Route = createFileRoute("/admin/catalog")({
  head: () => ({
    meta: [{ title: "Quản lý Catalog — GYMKITTEN CMS" }],
  }),
  component: () => (
    <AdminLayout>
      <CatalogFeature />
    </AdminLayout>
  ),
});
