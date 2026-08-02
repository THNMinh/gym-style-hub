import { createFileRoute } from "@tanstack/react-router";
import { ProductListFeature } from "@/features/catalog/components/product-list-feature";

type ProductSearch = {
  gender?: string;
  category?: string;
  q?: string;
  sort?: string;
};

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    ...(typeof search["gender"] === "string" ? { gender: search["gender"] } : {}),
    ...(typeof search["category"] === "string" ? { category: search["category"] } : {}),
    ...(typeof search["q"] === "string" ? { q: search["q"] } : {}),
    ...(typeof search["sort"] === "string" ? { sort: search["sort"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Tất cả sản phẩm — GYMSHARK VN" },
      { name: "description", content: "Lọc theo giới tính, danh mục và giá để tìm bộ đồ tập phù hợp." },
      { property: "og:title", content: "Tất cả sản phẩm — GYMSHARK VN" },
      { property: "og:description", content: "Khám phá toàn bộ bộ sưu tập gym-wear." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const gender = search.gender;
  return (
    <ProductListFeature
      {...(gender === "Men" || gender === "Women" || gender === "Unisex" || gender === "All"
        ? { initialGender: gender }
        : {})}
      {...(search.q ? { search: search.q } : {})}
    />
  );
}
