import { createFileRoute } from "@tanstack/react-router";
import { CheckoutFeature } from "@/features/checkout/components/checkout-feature";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Thanh toán — GYMSHARK VN" },
      { name: "description", content: "Hoàn tất đơn hàng với giao hàng nhanh trên toàn quốc." },
      { property: "og:title", content: "Thanh toán — GYMSHARK VN" },
      { property: "og:description", content: "Hoàn tất đơn hàng của bạn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutFeature,
});
