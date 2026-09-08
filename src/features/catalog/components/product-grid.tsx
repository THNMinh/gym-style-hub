import { useMemo } from "react";
import type { Product } from "@/entities/catalog/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  selectedColors?: string[];
}

export function ProductGrid({ products, selectedColors = [] }: ProductGridProps) {
  // If color filters are active, flatten products into color-variant cards
  const cardsToRender = useMemo(() => {
    if (!selectedColors || selectedColors.length === 0) {
      return products.map((p) => ({ product: p, selectedColor: undefined, key: p.productId }));
    }

    const list: { product: Product; selectedColor?: string; key: string }[] = [];

    products.forEach((p) => {
      // Find matching unique color names in product variants
      const matchingColors = [
        ...new Set(
          (p.variants || [])
            .filter((v) =>
              selectedColors.some(
                (sc) => sc.trim().toLowerCase() === v.colorName.trim().toLowerCase()
              )
            )
            .map((v) => v.colorName)
        ),
      ];

      if (matchingColors.length > 0) {
        matchingColors.forEach((color) => {
          list.push({
            product: p,
            selectedColor: color,
            key: `${p.productId}-${color}`,
          });
        });
      } else {
        list.push({
          product: p,
          selectedColor: undefined,
          key: p.productId,
        });
      }
    });

    return list;
  }, [products, selectedColors]);

  if (cardsToRender.length === 0) {
    return (
      <div className="col-span-full py-24 text-center">
        <h2 className="text-xl font-extrabold text-foreground">Không tìm thấy sản phẩm phù hợp</h2>
        <p className="mt-2 text-sm text-muted-foreground">Thử bỏ bớt bộ lọc hoặc chọn màu sắc/kích cỡ khác.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
      {cardsToRender.map((item) => (
        <ProductCard
          key={item.key}
          product={item.product}
          selectedColor={item.selectedColor}
        />
      ))}
    </div>
  );
}
