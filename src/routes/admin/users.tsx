import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/app/(admin)/admin/layout";
import { UsersFeature } from "@/features/admin/components/users-feature";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [{ title: "Quản lý Người dùng & Tài khoản — GYMKITTEN CMS" }],
  }),
  component: () => (
    <AdminLayout>
      <UsersFeature />
    </AdminLayout>
  ),
});
