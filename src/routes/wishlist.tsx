import { createFileRoute } from "@tanstack/react-router";
import { WishlistFeature } from "@/features/wishlist/components/wishlist-feature";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Yêu thích — GYMSHARK VN" },
      { name: "description", content: "Danh sách sản phẩm gym-wear bạn đã lưu lại." },
      { property: "og:title", content: "Yêu thích — GYMSHARK VN" },
      { property: "og:description", content: "Danh sách sản phẩm bạn đã lưu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WishlistFeature,
});
