import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/app/(admin)/admin/layout";
import { ReviewsFeature } from "@/features/admin/components/reviews-feature";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [{ title: "Kiểm duyệt Đánh giá — GYMKITTEN CMS" }],
  }),
  component: () => (
    <AdminLayout>
      <ReviewsFeature />
    </AdminLayout>
  ),
});
