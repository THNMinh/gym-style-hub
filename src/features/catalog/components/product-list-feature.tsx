import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/entities/catalog/services";
import type { Gender } from "@/entities/catalog/types";
import { ProductGrid } from "./product-grid";
import { CatalogFilterBar, EMPTY_FILTERS, type CatalogFilters } from "./catalog-filter-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function ProductListFeature({
  initialGender = "All",
  search,
}: {
  initialGender?: Gender | "All";
  search?: string;
}) {
  const PAGE_SIZE = 12;
  const [filters, setFilters] = useState<CatalogFilters>({
    ...EMPTY_FILTERS,
    gender: initialGender,
  });
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["products", filters, search, page],
    queryFn: () =>
      getProducts({
        gender: filters.gender,
        colors: filters.colors,
        sizes: filters.sizes,
        fitTypes: filters.fitTypes,
        sort: filters.sort,
        page,
        pageSize: PAGE_SIZE,
        ...(filters.minPrice != null ? { minPrice: filters.minPrice } : {}),
        ...(filters.maxPrice != null ? { maxPrice: filters.maxPrice } : {}),
        ...(filters.categorySlug ? { categorySlug: filters.categorySlug } : {}),
        ...(search ? { search } : {}),
      }),
    placeholderData: (previous) => previous,
  });

  const products = useMemo(() => query.data?.items ?? [], [query.data]);
  const total = query.data?.totalCount ?? 0;
  const totalPages = query.data?.totalPages ?? 1;

  function handleFilterChange(next: Partial<CatalogFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  }

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
        total={total}
        onChange={handleFilterChange}
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
          <ProductGrid products={products} selectedColors={filters.colors} />
        )}
      </div>

      {!query.isPending && totalPages > 1 ? (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trước
          </Button>
          <p className="text-sm text-muted-foreground">
            Trang {page}/{totalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Sau
          </Button>
        </div>
      ) : null}
    </div>
  );
}
