import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/entities/catalog/types";
import { getRelatedProducts } from "@/entities/catalog/services";
import { discountPercent, formatPrice } from "@/shared/lib/format";
import { Rating } from "@/shared/ui/rating";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCartStore } from "@/features/cart/store";
import { useAuthStore } from "@/features/auth/store";
import { useWishlistStore } from "@/features/wishlist/store";
import { toggleWishlistApi } from "@/features/wishlist/services";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { SizeGuideDialog } from "./size-guide-dialog";
import { ProductReviews } from "./product-reviews";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

export function ProductDetailFeature({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const queryClient = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);
  const wishlist = useWishlistStore((s) => s.productIds);
  const addId = useWishlistStore((s) => s.addId);
  const removeId = useWishlistStore((s) => s.removeId);
  const user = useAuthStore((s) => s.user);

  const colors = useMemo(
    () => [...new Map(product.variants.map((v) => [v.colorName, v.colorHex])).entries()],
    [product],
  );
  const hasVariantData = product.variants.length > 0;
  const imageList =
    product.images.length > 0
      ? product.images
      : [
          {
            imageId: `${product.productId}-placeholder`,
            productId: product.productId,
            variantId: null,
            imageUrl: "https://placehold.co/900x1200?text=No+Image",
            displayOrder: 1,
            isPrimary: true,
          },
        ];
  const [color, setColor] = useState(colors[0]?.[0] ?? "");
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const sizesForColor = product.variants.filter((v) => v.colorName === color);
  const selectedVariant = sizesForColor.find((v) => v.size === size) ?? null;
  const fallbackVariant = product.variants[0] ?? null;
  const price = selectedVariant?.price ?? fallbackVariant?.price ?? null;
  const original = selectedVariant?.originalPrice ?? sizesForColor[0]?.originalPrice ?? null;
  const off = price != null ? discountPercent(price, original) : 0;
  const liked = hydrated && wishlist.includes(product.productId);

  const related = useQuery({
    queryKey: ["related", product.productId],
    queryFn: () => getRelatedProducts(product),
  });

  function handleAdd() {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn size");
      return;
    }
    if (selectedVariant.available <= 0) {
      toast.error("Size này đã hết hàng");
      return;
    }
    addItem(product, selectedVariant, quantity);
    toast.success(`Đã thêm ${product.name} (${color} / ${selectedVariant.size}) vào giỏ`);
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8">
      <nav className="eyebrow mb-6 text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Trang chủ
        </Link>
        <span className="px-2">/</span>
        <Link to="/products" search={{ gender: product.gender }} className="hover:text-foreground">
          {product.gender === "Men" ? "Nam" : product.gender === "Women" ? "Nữ" : "Unisex"}
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="grid gap-3 md:grid-cols-[88px_1fr]">
          <div className="order-2 flex gap-3 md:order-1 md:flex-col">
            {imageList.map((image, index) => (
              <button
                key={image.imageId}
                type="button"
                onClick={() => setActiveImage(index)}
                className={cn(
                  "w-20 overflow-hidden border",
                  index === activeImage ? "border-primary" : "border-transparent",
                )}
              >
                <img
                  src={image.imageUrl}
                  alt={`${product.name} ${index + 1}`}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover"
                />
              </button>
            ))}
          </div>
          <div className="order-1 bg-muted md:order-2">
            <img
              src={imageList[activeImage]?.imageUrl}
              alt={product.name}
              width={900}
              height={1200}
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:h-fit">
          <h1 className="text-3xl md:text-4xl">{product.name}</h1>
          <Rating value={product.ratingAverage} count={product.reviewCount} className="mt-3" />

          <div className="mt-4 flex items-center gap-3">
              {price != null ? (
                <span className={cn("text-2xl font-bold", off && "text-sale")}>{formatPrice(price)}</span>
              ) : (
                <span className="text-2xl font-bold">Liên hệ</span>
              )}
            {original ? (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(original)}
              </span>
            ) : null}
            {off ? (
              <span className="bg-sale px-2 py-1 text-xs font-bold text-sale-foreground">-{off}%</span>
            ) : null}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {hasVariantData ? (
            <div className="mt-8">
              <p className="eyebrow">
                Màu: <span className="text-muted-foreground">{color}</span>
              </p>
              <div className="mt-3 flex gap-3">
                {colors.map(([name, hex]) => (
                  <button
                    key={name}
                    type="button"
                    aria-label={name}
                    onClick={() => {
                      setColor(name);
                      setSize(null);
                    }}
                    className={cn(
                      "size-9 rounded-full border-2",
                      color === name ? "border-primary" : "border-border",
                    )}
                    style={{ backgroundColor: hex ?? undefined }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {hasVariantData ? (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Size</p>
                <SizeGuideDialog rows={product.sizeGuide} />
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {sizesForColor.map((variant) => {
                  const soldOut = variant.available <= 0;
                  return (
                    <button
                      key={variant.variantId}
                      type="button"
                      disabled={soldOut}
                      onClick={() => setSize(variant.size)}
                      className={cn(
                        "border py-3 text-sm font-semibold transition-colors",
                        size === variant.size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-accent",
                        soldOut && "cursor-not-allowed text-muted-foreground/50 line-through hover:bg-transparent",
                      )}
                    >
                      {variant.size}
                    </button>
                  );
                })}
              </div>
              {selectedVariant && selectedVariant.available > 0 && selectedVariant.available <= 8 ? (
                <p className="mt-2 text-xs text-sale">Chỉ còn {selectedVariant.available} sản phẩm</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Phiên bản API hiện tại chưa trả biến thể size/màu nên chưa thể thêm vào giỏ trực tiếp.
            </p>
          )}

          <div className="mt-8 flex items-center gap-3">
            {hasVariantData ? (
              <div className="flex items-center border border-border">
                <button
                  type="button"
                  aria-label="Giảm"
                  className="grid size-11 place-items-center"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  aria-label="Tăng"
                  className="grid size-11 place-items-center"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="size-4" />
                </button>
              </div>
            ) : null}
            <Button
              size="lg"
              className="h-11 flex-1 text-sm"
              onClick={handleAdd}
              disabled={!hasVariantData}
            >
              Thêm vào giỏ
            </Button>
            <button
              type="button"
              aria-label="Yêu thích"
              onClick={async () => {
                if (!user) {
                  toast.error("Vui lòng đăng nhập để dùng danh sách yêu thích");
                  return;
                }
                const wasLiked = liked;
                if (wasLiked) {
                  removeId(product.productId);
                } else {
                  addId(product.productId);
                }
                try {
                  const res = await toggleWishlistApi(product.productId);
                  if (res.isAdded) {
                    addId(product.productId);
                  } else {
                    removeId(product.productId);
                  }
                  toast.success(res.message || (res.isAdded ? "Đã thêm vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích"));
                  queryClient.invalidateQueries({ queryKey: ["wishlist"] });
                } catch (err) {
                  if (wasLiked) {
                    addId(product.productId);
                  } else {
                    removeId(product.productId);
                  }
                  toast.error(err instanceof Error ? err.message : "Không thể cập nhật danh sách yêu thích");
                }
              }}
              className="grid size-11 place-items-center border border-border"
            >
              <Heart className={cn("size-4", liked && "fill-current")} />
            </button>
          </div>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <Truck className="size-4" /> Miễn phí giao hàng cho đơn từ 1.200.000₫
            </li>
            <li className="flex items-center gap-3">
              <Undo2 className="size-4" /> Đổi trả miễn phí trong 30 ngày
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-4" /> Bảo hành đường may 12 tháng
            </li>
          </ul>

          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="detail">
              <AccordionTrigger>Chi tiết sản phẩm</AccordionTrigger>
              <AccordionContent className="space-y-1 text-sm text-muted-foreground">
                <p>Kiểu dáng: {product.fitType}</p>
                <p>Giới tính: {product.gender}</p>
                <p>SKU: {selectedVariant?.sku ?? sizesForColor[0]?.sku ?? "N/A"}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger>Hướng dẫn bảo quản</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Giặt máy ở 30°C với đồ cùng màu, không dùng chất tẩy, phơi khô tự nhiên.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Giao hàng & đổi trả</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Giao 2-4 ngày toàn quốc. Đổi trả miễn phí trong 30 ngày với sản phẩm còn tag.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="mt-16">
        <ProductReviews productId={product.productId} />
      </div>

      {related.data?.length ? (
        <section className="border-t border-border py-14">
          <h2 className="text-2xl">Có thể bạn cũng thích</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {related.data.map((item) => (
              <ProductCard key={item.productId} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
