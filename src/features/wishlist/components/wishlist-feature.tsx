import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getProductsByIds } from "@/entities/catalog/services";
import { useWishlistStore } from "../store";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/shared/hooks/use-hydrated";

export function WishlistFeature() {
  const hydrated = useHydrated();
  const productIds = useWishlistStore((s) => s.productIds);

  const query = useQuery({
    queryKey: ["wishlist", productIds],
    queryFn: () => getProductsByIds(productIds),
    enabled: hydrated && productIds.length > 0,
  });

  if (!hydrated) return <div className="min-h-[50vh]" />;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 lg:px-8">
      <h1 className="text-4xl">Yêu thích</h1>
      {productIds.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">Bạn chưa lưu sản phẩm nào.</p>
          <Button asChild className="mt-6">
            <Link to="/products" search={{}}>
              Khám phá sản phẩm
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10">
          <ProductGrid products={query.data ?? []} />
        </div>
      )}
    </div>
  );
}
