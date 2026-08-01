import { createFileRoute } from "@tanstack/react-router";
import { AuthFeature } from "@/features/auth/components/auth-feature";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — GYMSHARK VN" },
      { name: "description", content: "Đăng nhập hoặc tạo tài khoản để theo dõi đơn hàng." },
      { property: "og:title", content: "Đăng nhập — GYMSHARK VN" },
      { property: "og:description", content: "Đăng nhập hoặc tạo tài khoản." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthFeature,
});
