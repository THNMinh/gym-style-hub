import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/app/(admin)/admin/layout";
import { SystemLogsFeature } from "@/features/admin/components/system-logs-feature";

export const Route = createFileRoute("/admin/system-logs")({
  head: () => ({
    meta: [{ title: "Nhật ký Hệ thống (Audit Logs) — GYMKITTEN CMS" }],
  }),
  component: () => (
    <AdminLayout>
      <SystemLogsFeature />
    </AdminLayout>
  ),
});
