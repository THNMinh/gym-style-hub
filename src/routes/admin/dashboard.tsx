import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/app/(admin)/admin/layout";
import { DashboardFeature } from "@/features/admin/components/dashboard-feature";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{ title: "Admin Dashboard — GYMKITTEN CMS" }],
  }),
  component: () => (
    <AdminLayout>
      <DashboardFeature />
    </AdminLayout>
  ),
});
