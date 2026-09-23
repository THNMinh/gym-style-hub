import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, Star, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductVariant } from "@/entities/catalog/types";
import { discountPercent, formatPrice } from "@/shared/lib/format";
import { useWishlistStore } from "@/features/wishlist/store";
import { toggleWishlistApi } from "@/features/wishlist/services";
import { useAuthStore } from "@/features/auth/store";
import { useCartStore } from "@/features/cart/store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const STANDARD_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

interface ProductCardProps {
  product: Product;
  selectedColor?: string | string[];
}

export function ProductCard({ product, selectedColor }: ProductCardProps) {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const queryClient = useQueryClient();
  const wishlist = useWishlistStore((s) => s.productIds);
  const addId = useWishlistStore((s) => s.addId);
  const removeId = useWishlistStore((s) => s.removeId);
  const addItemToCart = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null);

  // Available unique colors in product variants
  const colorMap = useMemo(() => {
    const map = new Map<string, { hex: string | null; variant: ProductVariant }>();
    (product.variants || []).forEach((v) => {
      if (!map.has(v.colorName)) {
        map.set(v.colorName, { hex: v.colorHex, variant: v });
      }
    });
    return map;
  }, [product.variants]);

  const defaultColorName = useMemo(() => {
    let targets: string[] = [];
    if (selectedColor) {
      if (Array.isArray(selectedColor)) {
        targets = selectedColor.map((s) => s.trim().toLowerCase()).filter(Boolean);
      } else {
        targets = selectedColor.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      }
    } else if (product.name.toLowerCase().includes("devant")) {
      // Tự động ưu tiên màu Violet hoặc Royal Blue cho dòng sản phẩm Devant
      targets = ["violet", "royal blue", "blue", "purple"];
    }

    if (targets.length > 0) {
      // 1. Khớp chính xác tên màu
      for (const target of targets) {
        for (const name of colorMap.keys()) {
          if (name.toLowerCase() === target) return name;
        }
      }

      // 2. Khớp chuỗi chứa từ khóa (ví dụ "violet" trong "Violet", "royal blue" trong "Royal Blue")
      for (const target of targets) {
        for (const name of colorMap.keys()) {
          const lower = name.toLowerCase();
          if (lower.includes(target) || target.includes(lower)) {
            return name;
          }
        }
      }

      // 3. Khớp các từ đồng nghĩa hoặc tiếng Việt
      for (const target of targets) {
        if (target.includes("pink") || target.includes("hồng")) {
          for (const name of colorMap.keys()) {
            const lower = name.toLowerCase();
            if (
              lower.includes("pink") ||
              lower.includes("hồng") ||
              lower.includes("magenta") ||
              lower.includes("rose")
            ) {
              return name;
            }
          }
        }
        if (target.includes("violet") || target.includes("purple") || target.includes("tím")) {
          for (const name of colorMap.keys()) {
            const lower = name.toLowerCase();
            if (
              lower.includes("violet") ||
              lower.includes("purple") ||
              lower.includes("tím") ||
              lower.includes("lilac")
            ) {
              return name;
            }
          }
        }
        if (target.includes("royal blue") || target.includes("blue") || target.includes("xanh")) {
          for (const name of colorMap.keys()) {
            const lower = name.toLowerCase();
            if (
              lower.includes("royal blue") ||
              lower.includes("blue") ||
              lower.includes("cobalt") ||
              lower.includes("navy")
            ) {
              return name;
            }
          }
        }
      }
    }

    return colorMap.keys().next().value || "";
  }, [selectedColor, colorMap, product.name]);

  const [activeColor, setActiveColor] = useState<string>(defaultColorName || (typeof selectedColor === "string" ? selectedColor : "") || "");
  const currentColorName = activeColor || defaultColorName;

  // Sắp xếp các chấm màu: ưu tiên đưa màu mặc định (được ưu tiên như Violet, Royal Blue, Pink...) lên đầu tiên ở trước
  const sortedColorEntries = useMemo(() => {
    const entries = Array.from(colorMap.entries());
    if (!defaultColorName) return entries;
    const defLower = defaultColorName.toLowerCase();
    return [...entries].sort((a, b) => {
      const aMatch = a[0].toLowerCase() === defLower;
      const bMatch = b[0].toLowerCase() === defLower;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [colorMap, defaultColorName]);

  // Tự động đồng bộ màu đang chọn khi defaultColorName thay đổi (ví dụ khi user bấm vào bộ lọc màu Get 'Em In Pink hoặc Devant)
  useEffect(() => {
    if (defaultColorName) {
      setActiveColor(defaultColorName);
    }
  }, [defaultColorName]);

  // Variants filtered by active color
  const activeColorVariants = useMemo(() => {
    if (!currentColorName) return product.variants || [];
    const matched = (product.variants || []).filter(
      (v) => v.colorName.toLowerCase() === currentColorName.toLowerCase(),
    );
    return matched.length > 0 ? matched : product.variants || [];
  }, [product.variants, currentColorName]);

  // Find image for active color variant
  const activeImages = useMemo(() => {
    if (!currentColorName) return product.images || [];

    // 1. Kiểm tra nếu có variant nào thuộc màu này có ảnh riêng (variant.imageUrl)
    const variantWithImg = activeColorVariants.find((v) => v.imageUrl);
    const variantImgUrl = variantWithImg?.imageUrl;

    // 2. Lọc ảnh từ danh sách product.images theo variantId
    const matchedVariantIds = new Set(activeColorVariants.map((v) => v.variantId));
    const variantImgs = (product.images || []).filter(
      (img) => img.variantId && matchedVariantIds.has(img.variantId),
    );
    if (variantImgs.length > 0) return variantImgs;

    // 3. Nếu không có ảnh theo variantId trong product.images, kiểm tra ảnh khớp URL
    if (variantImgUrl) {
      const imgMatch = (product.images || []).filter((img) => img.imageUrl === variantImgUrl);
      if (imgMatch.length > 0) return imgMatch;

      return [
        {
          imageId: `${product.productId}-${currentColorName}`,
          productId: product.productId,
          variantId: variantWithImg?.variantId ?? null,
          imageUrl: variantImgUrl,
          displayOrder: 1,
          isPrimary: true,
        },
      ];
    }

    return product.images || [];
  }, [product.images, activeColorVariants, currentColorName, product.productId]);

  const primaryImage = activeImages[0]?.imageUrl || product.images?.[0]?.imageUrl || "";
  const secondaryImage =
    activeImages[1]?.imageUrl || product.images?.[1]?.imageUrl || primaryImage;

  // Price range or single price
  const price = useMemo(() => {
    const list = activeColorVariants.length > 0 ? activeColorVariants : product.variants || [];
    if (list.length === 0) return 0;
    return Math.min(...list.map((v) => v.price));
  }, [activeColorVariants, product.variants]);

  const originalPrice = activeColorVariants[0]?.originalPrice ?? product.variants[0]?.originalPrice ?? null;
  const off = discountPercent(price, originalPrice);
  const liked = hydrated && wishlist.includes(product.productId);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      if (res.isAdded) addId(product.productId);
      else removeId(product.productId);
      toast.success(res.message || (res.isAdded ? "Đã thêm vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích"));
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    } catch {
      if (wasLiked) addId(product.productId);
      else removeId(product.productId);
    }
  };

  const handleQuickAddToCart = async (e: React.MouseEvent, variant: ProductVariant) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", {
        action: {
          label: "Đăng nhập",
          onClick: () => navigate({ to: "/auth", search: { redirect: window.location.pathname + window.location.search } }),
        },
      });
      return;
    }

    // Chặn người dùng spam click nhiều lần liên tục làm tốn request/bandwidth
    if (addingVariantId) return;

    try {
      setAddingVariantId(variant.variantId);
      // Cooldown delay (650ms) để người dùng thấy rõ hiệu ứng loading ô size và ngăn chặn spam nút giống Gymshark
      const cooldownTimer = new Promise((resolve) => setTimeout(resolve, 650));
      await Promise.all([
        addItemToCart(product, variant, 1),
        cooldownTimer,
      ]);
      toast.success(`Đã thêm Size ${variant.size} (${variant.colorName}) vào giỏ hàng!`, {
        description: `${product.name} — ${formatPrice(variant.price)}`,
      });
    } catch (err: any) {
      toast.error(err?.message || "Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
    } finally {
      setAddingVariantId(null);
    }
  };

  // Map of available sizes for active color
  const sizeAvailabilityMap = useMemo(() => {
    const map = new Map<string, ProductVariant>();
    activeColorVariants.forEach((v) => {
      map.set(v.size.toUpperCase(), v);
    });
    return map;
  }, [activeColorVariants]);

  // Determine grid sizes to display (either standard XXS-XXL or product's sizes)
  const displaySizes = useMemo(() => {
    const existingSizes = Array.from(sizeAvailabilityMap.keys());
    const hasNonStandard = existingSizes.some((s) => !STANDARD_SIZES.includes(s));
    if (hasNonStandard && existingSizes.length > 0) {
      return existingSizes;
    }
    return STANDARD_SIZES;
  }, [sizeAvailabilityMap]);

  const isInactive = product.isActive === false;
  const hasAnyStock = (product.variants || []).some((v) => v.available > 0);

  return (
    <article className="group relative flex flex-col h-full select-none">
      {/* Image & Quick-Size Overlay Container */}
      <div className={cn(
        "relative aspect-[3/4] w-full overflow-hidden bg-muted rounded-lg shadow-xs transition-opacity duration-300",
        (isInactive || !hasAnyStock) && "opacity-75 grayscale-[20%]"
      )}>
        <Link
          to="/products/$slug"
          params={{ slug: product.productId }}
          className="block h-full w-full relative overflow-hidden"
        >
          {/* Primary Base Image */}
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-opacity duration-500 ease-in-out group-hover:opacity-0"
          />

          {/* Secondary Hover Image (Flip Animation) */}
          <img
            src={secondaryImage}
            alt={`${product.name} back view`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label="Thêm vào yêu thích"
          onClick={handleToggleWishlist}
          className="absolute right-2.5 top-2.5 z-20 grid size-8 place-items-center rounded-full bg-background/80 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-background shadow-xs text-foreground"
        >
          <Heart className={cn("size-4 transition-colors", liked && "fill-rose-500 text-rose-500")} />
        </button>

        {/* Badge */}
        {isInactive ? (
          <span className="absolute left-2.5 top-2.5 z-20 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xs shadow-xs">
            Tạm ngưng bán
          </span>
        ) : !hasAnyStock ? (
          <span className="absolute left-2.5 top-2.5 z-20 bg-amber-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white rounded-xs shadow-xs">
            Hết hàng
          </span>
        ) : off ? (
          <span className="absolute left-2.5 top-2.5 z-20 bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white rounded-xs shadow-xs">
            -{off}%
          </span>
        ) : product.badges?.[0] ? (
          <span className="absolute left-2.5 top-2.5 z-20 bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground rounded-xs shadow-xs">
            {product.badges[0]}
          </span>
        ) : null}

        {/* Hover Quick-Size Grid Overlay */}
        {!isInactive && (
          <div className="absolute inset-x-2 bottom-2 z-20 hidden group-hover:flex flex-col bg-background/95 backdrop-blur-md p-2 rounded-md shadow-xl border border-border/80 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 animate-in fade-in-50 slide-in-from-bottom-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground text-center mb-1.5 flex items-center justify-center gap-1">
              <ShoppingBag className="size-3 text-muted-foreground" /> CHỌN SIZE NHANH
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-1 text-center">
              {displaySizes.map((sz) => {
                const matchedVariant = sizeAvailabilityMap.get(sz.toUpperCase());
                const isAvailable = matchedVariant && matchedVariant.available > 0;

                if (isAvailable && matchedVariant) {
                  const isCurrentlyAdding = addingVariantId === matchedVariant.variantId;
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!!addingVariantId}
                      onClick={(e) => handleQuickAddToCart(e, matchedVariant)}
                      className={cn(
                        "h-8 flex items-center justify-center rounded border border-border/80 bg-background text-xs font-bold text-foreground transition-all duration-150 hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white active:scale-95 shadow-2xs",
                        isCurrentlyAdding && "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white cursor-wait",
                        addingVariantId && !isCurrentlyAdding && "opacity-40 cursor-not-allowed pointer-events-none",
                      )}
                      title={isCurrentlyAdding ? "Đang thêm vào giỏ..." : `Thêm Size ${sz} (${matchedVariant.colorName}) vào giỏ`}
                    >
                      {isCurrentlyAdding ? (
                        <span className="size-3.5 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" />
                      ) : (
                        sz
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={sz}
                    type="button"
                    disabled
                    className="h-8 relative overflow-hidden flex items-center justify-center rounded border border-border/40 bg-muted/40 text-xs font-semibold text-muted-foreground/40 opacity-50 cursor-not-allowed before:absolute before:inset-0 before:m-auto before:h-[1px] before:w-full before:bg-muted-foreground/50 before:rotate-[25deg]"
                    title={`Size ${sz} tạm hết hàng`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Card Info Details */}
      <div className="mt-3 flex-1 flex flex-col justify-between space-y-1.5 text-left">
        <div>
          <Link to="/products/$slug" params={{ slug: product.productId }} className="block group-hover:text-primary transition-colors">
            <h3 className="text-sm font-bold tracking-tight text-foreground line-clamp-1">{product.name}</h3>
          </Link>

          {/* Subtitle FitType & Color Name (e.g. Regular · Energy Pink) */}
          <p className="text-xs font-medium text-muted-foreground mt-0.5">
            {product.fitType || "Regular"} {currentColorName ? `· ${currentColorName}` : ""}
          </p>
        </div>

        <div className="space-y-1 pt-1">
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-extrabold text-foreground", off && "text-rose-600 dark:text-rose-400")}>
              {formatPrice(price)}
            </span>
            {originalPrice ? (
              <span className="text-xs text-muted-foreground line-through font-medium">{formatPrice(originalPrice)}</span>
            ) : null}
          </div>

          {/* Overall Rating & Review Summary */}
          <div className="flex items-center gap-1.5 text-xs">
            {product.reviewCount > 0 ? (
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="size-3.5 fill-current" />
                <span>{product.ratingAverage.toFixed(1)}</span>
                <span className="text-[11px] font-normal text-muted-foreground">({product.reviewCount})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground/80">
                <Star className="size-3 text-amber-400/80" />
                <span>Mới</span>
              </div>
            )}
          </div>

          {/* Color Swatches */}
          {colorMap.size > 1 && (
            <div className="flex items-center gap-1.5 pt-1.5">
              {sortedColorEntries.map(([cName, { hex }]) => (
                <button
                  key={cName}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveColor(cName);
                  }}
                  title={cName}
                  className={cn(
                    "size-4 rounded-full border transition-all duration-150 relative flex items-center justify-center",
                    currentColorName === cName
                      ? "ring-2 ring-primary ring-offset-1 border-primary scale-110"
                      : "border-border/80 hover:scale-110"
                  )}
                  style={{ backgroundColor: hex || "#111111" }}
                >
                  {currentColorName === cName && (
                    <span className={cn("size-1.5 rounded-full", hex === "#ffffff" ? "bg-black" : "bg-white")} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
