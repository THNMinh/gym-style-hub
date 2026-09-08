import { useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMyWishlist, mapWishlistItemToProduct } from "../services";
import { getProductsByIds } from "@/entities/catalog/services";
import { useWishlistStore } from "../store";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { useAuthStore } from "@/features/auth/store";

export function WishlistFeature() {
  const hydrated = useHydrated();
  const setProductIds = useWishlistStore((s) => s.setProductIds);
  const user = useAuthStore((s) => s.user);

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => getMyWishlist(1, 100),
    enabled: hydrated && !!user,
  });

  const productIds = useMemo(
    () => query.data?.items.map((item) => item.productId) ?? [],
    [query.data],
  );

  const fullProductsQuery = useQuery({
    queryKey: ["wishlist-full-products", productIds],
    queryFn: () => getProductsByIds(productIds),
    enabled: productIds.length > 0,
  });

  useEffect(() => {
    if (query.data?.items) {
      setProductIds(query.data.items.map((item) => item.productId));
    }
  }, [query.data, setProductIds]);

  if (!hydrated) return <div className="min-h-[50vh]" />;

  if (!user) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-12 lg:px-8">
        <h1 className="text-4xl">Yêu thích</h1>
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">Vui lòng đăng nhập để dùng danh sách yêu thích.</p>
          <Button asChild className="mt-6">
            <Link to="/auth">Đăng nhập</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fallbackProducts = (query.data?.items ?? []).map(mapWishlistItemToProduct);
  const products =
    fullProductsQuery.data && fullProductsQuery.data.length > 0
      ? fullProductsQuery.data
      : fallbackProducts;

  const isLoading = query.isLoading || (productIds.length > 0 && fullProductsQuery.isLoading);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 lg:px-8">
      <h1 className="text-4xl">Yêu thích</h1>
      {isLoading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Đang tải danh sách yêu thích...</div>
      ) : products.length === 0 ? (
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
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
