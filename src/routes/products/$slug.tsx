import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "@/entities/catalog/services";
import { ProductDetailFeature } from "@/features/catalog/components/product-detail-feature";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ");
    return {
      meta: [
        { title: `${name} — GYMSHARK VN` },
        {
          name: "description",
          content: `Chi tiết sản phẩm ${name}: chất liệu, size, đánh giá và hướng dẫn chọn size.`,
        },
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
  const query = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
  });

  if (query.isPending) {
    return <div className="mx-auto max-w-[1600px] px-4 py-20 text-sm text-muted-foreground">Đang tải...</div>;
  }

  if (!query.data) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-20">
        <h1 className="text-3xl">Không tìm thấy sản phẩm</h1>
      </div>
    );
  }

  return <ProductDetailFeature product={query.data} />;
}
