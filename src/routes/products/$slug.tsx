import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailFeature } from "@/features/catalog/components/product-detail-feature";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${name} — GYMSHARK VN` },
        { name: "description", content: `Chi tiết sản phẩm ${name}: chất liệu, size, đánh giá và hướng dẫn chọn size.` },
        { property: "og:title", content: `${name} — GYMSHARK VN` },
        { property: "og:description", content: `Chi tiết sản phẩm ${name}.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  return <ProductDetailFeature slug={slug} />;
}
