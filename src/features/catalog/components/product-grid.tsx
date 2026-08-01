import type { Product } from "@/entities/catalog/types";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="col-span-full py-24 text-center">
        <h2 className="text-xl">Không tìm thấy sản phẩm</h2>
        <p className="mt-2 text-sm text-muted-foreground">Thử bỏ bớt bộ lọc hoặc đổi từ khoá.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
}
