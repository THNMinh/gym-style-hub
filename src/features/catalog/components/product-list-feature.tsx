import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/entities/catalog/services";
import type { Gender } from "@/entities/catalog/types";
import { ProductGrid } from "./product-grid";
import { CatalogFilterBar, EMPTY_FILTERS, type CatalogFilters } from "./catalog-filter-bar";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductListFeature({
  initialGender = "All",
  search,
}: {
  initialGender?: Gender | "All";
  search?: string;
}) {
  const [filters, setFilters] = useState<CatalogFilters>({
    ...EMPTY_FILTERS,
    gender: initialGender,
  });

  const query = useQuery({
    queryKey: ["products", filters, search],
    queryFn: () =>
      getProducts({
        gender: filters.gender,
        colors: filters.colors,
        sizes: filters.sizes,
        fitTypes: filters.fitTypes,
        sort: filters.sort,
        ...(filters.categorySlug ? { categorySlug: filters.categorySlug } : {}),
        ...(search ? { search } : {}),
      }),
  });

  const products = useMemo(() => query.data ?? [], [query.data]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 lg:px-8">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl">
          {search ? `Kết quả cho "${search}"` : "Tất cả sản phẩm"}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Bộ sưu tập đồ tập hiệu năng cao: seamless, oversized và training essentials.
        </p>
      </header>

      <CatalogFilterBar
        filters={filters}
        total={products.length}
        onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
      />

      <div className="mt-10">
        {query.isPending ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
