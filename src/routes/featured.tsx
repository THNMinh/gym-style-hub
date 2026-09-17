import { createFileRoute } from "@tanstack/react-router";
import { FeaturedFeature } from "@/features/featured/components/featured-feature";

export const Route = createFileRoute("/featured")({
  head: () => ({
    meta: [
      { title: "Sản phẩm nổi bật (Popular Right Now) — GYMSHARK VN" },
      { name: "description", content: "Bộ sưu tập sản phẩm gym-wear nổi bật, bán chạy nhất và phong cách xu hướng hiện nay." },
      { property: "og:title", content: "Sản phẩm nổi bật — GYMSHARK VN" },
      { property: "og:description", content: "Khám phá các sản phẩm tập gym hot nhất hiện nay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeaturedFeature,
});
