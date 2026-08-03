import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/entities/catalog/services";
import { ProductDetailFeature } from "@/features/catalog/components/product-detail-feature";

export const Route = createFileRoute("/products/$slug")({
  head: () => ({
    meta: [
      { title: "Chi tiết sản phẩm — GYMSHARK VN" },
      {
        name: "description",
        content: "Chi tiết sản phẩm: hình ảnh, thông tin và hướng dẫn chọn mua.",
      },
      { property: "og:title", content: "Chi tiết sản phẩm — GYMSHARK VN" },
      { property: "og:description", content: "Xem thông tin chi tiết sản phẩm." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug: productId } = Route.useParams();
  const query = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
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
