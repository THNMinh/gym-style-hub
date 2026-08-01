import { createFileRoute } from "@tanstack/react-router";
import { CartFeature } from "@/features/cart/components/cart-feature";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Giỏ hàng — GYMSHARK VN" },
      { name: "description", content: "Xem lại sản phẩm trong giỏ hàng của bạn trước khi thanh toán." },
      { property: "og:title", content: "Giỏ hàng — GYMSHARK VN" },
      { property: "og:description", content: "Xem lại sản phẩm trong giỏ hàng của bạn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartFeature,
});
