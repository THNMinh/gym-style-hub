import { createFileRoute } from "@tanstack/react-router";
import { HomeHero } from "@/features/home/components/home-hero";
import { CategoryStrip } from "@/features/home/components/category-strip";
import { ProductRail } from "@/features/home/components/product-rail";
import { ValueProps } from "@/features/home/components/value-props";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GYMSHARK VN — Đồ tập gym hiệu năng cao" },
      { name: "description", content: "Bộ sưu tập quần áo tập gym seamless, thoáng khí và co giãn cho nam & nữ." },
      { property: "og:title", content: "GYMSHARK VN — Đồ tập gym hiệu năng cao" },
      { property: "og:description", content: "Bộ sưu tập quần áo tập gym seamless cho nam & nữ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <HomeHero />
      <CategoryStrip />
      <ProductRail title="Bán chạy nhất" sort="rating" />
      <ValueProps />
      <ProductRail title="Hàng mới về" sort="newest" />
    </>
  );
}
