import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/app/(admin)/admin/layout";
import { FinanceFeature } from "@/features/admin/components/finance-feature";

export const Route = createFileRoute("/admin/finance")({
  head: () => ({
    meta: [{ title: "Báo cáo Tài chính — GYMKITTEN CMS" }],
  }),
  component: () => (
    <AdminLayout>
      <FinanceFeature />
    </AdminLayout>
  ),
});
