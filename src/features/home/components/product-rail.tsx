import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/entities/catalog/services";
import type { Gender } from "@/entities/catalog/types";
import { ProductCard } from "@/features/catalog/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductRail({
  title,
  gender,
  sort = "featured",
  limit = 4,
}: {
  title: string;
  gender?: Gender | "All";
  sort?: "featured" | "newest" | "rating";
  limit?: number;
}) {
  const query = useQuery({
    queryKey: ["rail", title, gender, sort],
    queryFn: () => getProducts({ gender, sort }),
  });

  const products = (query.data ?? []).slice(0, limit);

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-14 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-2xl md:text-3xl">{title}</h2>
        <Link
          to="/products"
          search={gender ? { gender } : {}}
          className="eyebrow underline underline-offset-4"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {query.isPending
          ? Array.from({ length: limit }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          : products.map((product) => <ProductCard key={product.productId} product={product} />)}
      </div>
    </section>
  );
}
