import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Heart, Minus, Plus, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/entities/catalog/types";
import { getRelatedProducts } from "@/entities/catalog/services";
import { discountPercent, formatPrice } from "@/shared/lib/format";
import { Rating } from "@/shared/ui/rating";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  const navigate = useNavigate();
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

  const [selectedColor, setSelectedColor] = useState<string | null>(() => colors[0]?.[0] || null);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomImageIndex, setZoomImageIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!selectedColor && colors[0]?.[0]) {
      setSelectedColor(colors[0][0]);
    }
  }, [colors, selectedColor]);

  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Lọc hình ảnh theo chuẩn Gymshark:
  // - Nếu chưa chọn màu (null): Hiển thị ảnh sản phẩm gốc (!variantId) hoặc ảnh primary.
  // - Khi click chọn màu: Chỉ hiển thị ảnh thuộc về variant/màu đó.
  const imageList = useMemo(() => {
    if (!product.images.length) {
      return [
        {
          imageId: `${product.productId}-placeholder`,
          productId: product.productId,
          variantId: null,
          imageUrl: "https://placehold.co/900x1200?text=No+Image",
          displayOrder: 1,
          isPrimary: true,
        },
      ];
    }

    if (selectedColor) {
      const colorVariantIds = new Set(
        product.variants.filter((v) => v.colorName === selectedColor).map((v) => v.variantId),
      );
      const variantImages = product.images.filter(
        (img) => img.variantId && colorVariantIds.has(img.variantId),
      );
      if (variantImages.length > 0) return variantImages;
    }

    const generalImages = product.images.filter((img) => !img.variantId);
    return generalImages.length > 0 ? generalImages : product.images;
  }, [product.images, product.variants, selectedColor, product.productId]);

  useEffect(() => {
    setActiveImage(0);
    if (galleryScrollRef.current) {
      galleryScrollRef.current.scrollTop = 0;
      setScrollProgress(0);
    }
  }, [selectedColor]);

  // Cuộn container ảnh nội bộ của gallery
  const handleGalleryScroll = () => {
    if (!galleryScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = galleryScrollRef.current;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(scrollTop / maxScroll);
    }
  };

  const scrollGallery = (direction: "up" | "down") => {
    if (!galleryScrollRef.current) return;
    const scrollAmount = galleryScrollRef.current.clientHeight * 0.7;
    galleryScrollRef.current.scrollBy({
      top: direction === "up" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const sizesForColor = useMemo(
    () => (selectedColor ? product.variants.filter((v) => v.colorName === selectedColor) : []),
    [product.variants, selectedColor],
  );
  const selectedVariant = sizesForColor.find((v) => v.size === size) ?? null;
  const fallbackVariant = product.variants[0] ?? null;
  const price =
    selectedVariant?.price ??
    (selectedColor ? sizesForColor[0]?.price : null) ??
    fallbackVariant?.price ??
    null;
  const original =
    selectedVariant?.originalPrice ??
    (selectedColor ? sizesForColor[0]?.originalPrice : null) ??
    fallbackVariant?.originalPrice ??
    null;
  const off = price != null ? discountPercent(price, original) : 0;
  const liked = hydrated && wishlist.includes(product.productId);

  const related = useQuery({
    queryKey: ["related", product.productId],
    queryFn: () => getRelatedProducts(product),
  });

  async function handleAdd() {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", {
        action: {
          label: "Đăng nhập",
          onClick: () => navigate({ to: "/auth", search: { redirect: window.location.pathname } }),
        },
      });
      return;
    }
    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sản phẩm");
      return;
    }
    if (!selectedVariant) {
      toast.error("Vui lòng chọn size");
      return;
    }
    if (selectedVariant.available <= 0) {
      toast.error("Size này đã hết hàng");
      return;
    }

    if (isAdding) return;

    try {
      setIsAdding(true);
      await addItem(product, selectedVariant, quantity);
      toast.success(`Đã thêm ${product.name} (${selectedColor} / ${selectedVariant.size}) vào giỏ`);
    } catch (err: any) {
      toast.error(err?.message || "Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
    } finally {
      setIsAdding(false);
    }
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

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
        {/* Left Column: Gymshark Local Scrollable Image Gallery Container */}
        <div className="relative group/gallery">
          {/* Gymshark Anchored Mini Scrollbar Control (Desktop) */}
          {imageList.length > 2 && (
            <div className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-2 bg-background/85 backdrop-blur-md p-2 rounded-full border border-border shadow-md transition-opacity">
              <button
                type="button"
                aria-label="Cuộn lên"
                onClick={() => scrollGallery("up")}
                disabled={scrollProgress <= 0.02}
                className="p-1 rounded-full hover:bg-accent disabled:opacity-30 transition-colors"
              >
                <ChevronUp className="size-4" />
              </button>
              <div className="w-1.5 h-20 bg-muted rounded-full relative overflow-hidden">
                <div
                  className="w-full bg-primary rounded-full transition-all duration-200"
                  style={{
                    height: "30%",
                    transform: `translateY(${scrollProgress * 230}%)`,
                  }}
                />
              </div>
              <button
                type="button"
                aria-label="Cuộn xuống"
                onClick={() => scrollGallery("down")}
                disabled={scrollProgress >= 0.98}
                className="p-1 rounded-full hover:bg-accent disabled:opacity-30 transition-colors"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          )}

          {/* Desktop/Tablet Bounded Scrollable 2-Column Grid (Gymshark Stack) */}
          <div
            ref={galleryScrollRef}
            onScroll={handleGalleryScroll}
            className="hidden md:grid md:grid-cols-2 gap-3 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-none rounded-xl pr-1"
          >
            {imageList.map((image, index) => (
              <div
                key={image.imageId}
                id={`product-image-${index}`}
                onClick={() => setZoomImageIndex(index)}
                className={cn(
                  "group/img relative bg-muted overflow-hidden cursor-zoom-in rounded-sm",
                  imageList.length === 1 && "col-span-2",
                  index === 0 && imageList.length % 2 !== 0 && "col-span-2",
                )}
              >
                <img
                  src={image.imageUrl}
                  alt={`${product.name} ${index + 1}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover/img:scale-[1.03]"
                />
                {/* Gymshark '+' Zoom Icon Overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="size-10 rounded-full bg-background/90 text-foreground flex items-center justify-center shadow-lg transform scale-90 group-hover/img:scale-100 transition-transform">
                    <Plus className="size-5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Horizontal Snap Slider */}
          <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-3 -mx-4 px-4">
            {imageList.map((image, index) => (
              <div
                key={image.imageId}
                onClick={() => setZoomImageIndex(index)}
                className="w-[85vw] flex-shrink-0 snap-center bg-muted overflow-hidden rounded-sm cursor-zoom-in"
              >
                <img
                  src={image.imageUrl}
                  alt={`${product.name} ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
            ))}
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
                Màu:{" "}
                <span className="text-muted-foreground">
                  {selectedColor ?? "Chọn màu sản phẩm"}
                </span>
              </p>
              <div className="mt-3 flex gap-3">
                {colors.map(([name, hex]) => (
                  <button
                    key={name}
                    type="button"
                    aria-label={name}
                    onClick={() => {
                      setSelectedColor(name);
                      setSize(null);
                    }}
                    className={cn(
                      "size-9 rounded-full border-2 transition-transform hover:scale-105",
                      selectedColor === name ? "border-primary ring-2 ring-primary/30" : "border-border",
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
                <SizeGuideDialog productId={product.productId} rows={product.sizeGuide} />
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
              className="h-11 flex-1 text-sm font-bold"
              onClick={handleAdd}
              disabled={!hasVariantData || isAdding}
            >
              {isAdding ? "Đang thêm vào giỏ..." : "Thêm vào giỏ"}
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

      {/* Gymshark Image Zoom Lightbox Modal */}
      <Dialog open={zoomImageIndex !== null} onOpenChange={(open) => !open && setZoomImageIndex(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[92vh] p-0 bg-black/95 border-none flex items-center justify-center overflow-hidden">
          {zoomImageIndex !== null && imageList[zoomImageIndex] && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={imageList[zoomImageIndex].imageUrl}
                alt={product.name}
                className="max-h-[85vh] max-w-[85vw] object-contain transition-transform duration-300 select-none"
              />

              {/* Prev Button */}
              {imageList.length > 1 && (
                <button
                  type="button"
                  aria-label="Ảnh trước"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomImageIndex((prev) =>
                      prev !== null ? (prev > 0 ? prev - 1 : imageList.length - 1) : 0,
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center backdrop-blur transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-6" />
                </button>
              )}

              {/* Next Button */}
              {imageList.length > 1 && (
                <button
                  type="button"
                  aria-label="Ảnh tiếp"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomImageIndex((prev) =>
                      prev !== null ? (prev < imageList.length - 1 ? prev + 1 : 0) : 0,
                    );
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 size-11 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center backdrop-blur transition-colors cursor-pointer"
                >
                  <ChevronRight className="size-6" />
                </button>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-xs font-bold uppercase tracking-wider bg-black/60 px-4 py-1.5 rounded-full backdrop-blur">
                {zoomImageIndex + 1} / {imageList.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
