import { createFileRoute } from "@tanstack/react-router";
import { AccountFeature } from "@/features/account/components/account-feature";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Tài khoản & Đơn hàng — GYMSHARK VN" },
      { name: "description", content: "Quản lý hồ sơ, địa chỉ và theo dõi trạng thái đơn hàng." },
      { property: "og:title", content: "Tài khoản & Đơn hàng — GYMSHARK VN" },
      { property: "og:description", content: "Quản lý hồ sơ và đơn hàng của bạn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountFeature,
});
