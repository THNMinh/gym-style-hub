import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Sparkles, X } from "lucide-react";
import { getProducts } from "@/entities/catalog/services";
import type { ProductListQuery, Gender } from "@/entities/catalog/types";
import { ProductCard } from "@/features/catalog/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import sale50BannerImg from "@/assets/image.png";
import powerMenImg from "@/assets/image (7).jpg";
import apexWomenImg from "@/assets/487034346_18503854933015250_5768974117798830766_n.jpg";
import cosyLuxeImg from "@/assets/image (6).jpg";
import shortsImg from "@/assets/image (1).jpg";
import everydayImg from "@/assets/image (3).jpg";
import muscleFitImg from "@/assets/image.jpg";
import pinkImg from "@/assets/image (4).jpg";
import devantImg from "@/assets/26864080_1920x.jpg";

interface FilterCardConfig {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge?: string;
  filterLabel: string;
  query: Partial<ProductListQuery>;
}

export function FeaturedFeature() {
  const [selectedGender, setSelectedGender] = useState<"Women" | "Men">("Men");
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

  // Danh sách 4 thẻ cho Men
  const menCards: FilterCardConfig[] = useMemo(
    () => [
      {
        id: "men-power",
        title: "POWER COLLECTION",
        subtitle: "Built for raw strength, heavy lifts, and uncompromised durability.",
        image: powerMenImg,
        badge: "Power Series",
        filterLabel: "Dòng sản phẩm Power cho nam",
        query: { gender: "Men", search: "power" },
      },
      {
        id: "men-shorts",
        title: "New Shorts Just Landed",
        subtitle: "All new styles for lifting, running and recovery.",
        image: shortsImg,
        badge: "Shorts Nam",
        filterLabel: "Quần Shorts nam mới nhất",
        query: { gender: "Men", search: "Shorts" },
      },
      {
        id: "men-devant",
        title: "Devant",
        subtitle: "Premium performance streetwear engineered for strength and mobility.",
        image: devantImg,
        badge: "Devant Series",
        filterLabel: "Dòng sản phẩm Devant",
        query: { search: "devant" },
      },
      {
        id: "men-muscle",
        title: "Muscle Fit Shirts",
        subtitle:
          "If there's one thing we do best, it's muscle-accentuating fits, and that means muscle shirts too.",
        image: muscleFitImg,
        badge: "Muscle Fit",
        filterLabel: "Áo Muscle Fit tôn dáng cho nam",
        query: { gender: "Men", fitTypes: ["Muscle fit"] },
      },
    ],
    [],
  );

  // Danh sách 4 thẻ cho Women
  const womenCards: FilterCardConfig[] = useMemo(
    () => [
      {
        id: "women-apex",
        title: "APEX SEAMLESS",
        subtitle: "High-intensity performance with targeted heat-mapping ventilation.",
        image: apexWomenImg,
        badge: "Apex Series",
        filterLabel: "Dòng sản phẩm Apex cho nữ",
        query: { gender: "Women", search: "apex" },
      },
      {
        id: "women-everyday",
        title: "Everyday",
        subtitle: "Elevate your cozy season style with rich, earthy tones and cozy fabrics.",
        image: everydayImg,
        badge: "Everyday Series",
        filterLabel: "Bộ sưu tập EveryDay cho nữ",
        query: { search: "EveryDay" },
      },
      {
        id: "women-pink",
        title: "Get 'Em In Pink",
        subtitle: "The sets you love. Even more loveable in pink.",
        image: pinkImg,
        badge: "Sắc Hồng",
        filterLabel: "Trang phục nữ tông màu Hồng",
        query: { gender: "Women", colors: ["pink"] },
      },
      {
        id: "women-cosy",
        title: "COSY LUXE",
        subtitle: "Ultra-plush premium fabrics designed for rest days and effortless style.",
        image: cosyLuxeImg,
        badge: "Cosy Luxe",
        filterLabel: "Bộ sưu tập Cosy Luxe cho nữ",
        query: { gender: "Women", search: "cosy" },
      },
    ],
    [],
  );

  const activeCards = selectedGender === "Men" ? menCards : womenCards;
  const currentCard = activeCards.find((c) => c.id === activeFilterId);

  const productQueryArgs: ProductListQuery = useMemo(() => {
    const base: ProductListQuery = {
      page: 1,
      pageSize: 24,
      sort: "rating",
    };

    if (activeFilterId === "sale-50-banner") {
      return {
        ...base,
        gender: selectedGender as Gender,
        minDiscountPercent: 50,
      };
    }

    if (currentCard) {
      return {
        ...base,
        ...currentCard.query,
      };
    }

    // Mặc định lọc theo giới tính đang chọn
    return {
      ...base,
      gender: selectedGender as Gender,
    };
  }, [activeFilterId, currentCard, selectedGender]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["featured-products", productQueryArgs],
    queryFn: () => getProducts(productQueryArgs),
  });

  const products = data?.items ?? [];

  const handleCardClick = (cardId: string) => {
    setActiveFilterId((prev) => (prev === cardId ? null : cardId));
  };

  const handleGenderChange = (gender: "Women" | "Men") => {
    setSelectedGender(gender);
    setActiveFilterId(null);
  };

  const isSale50Active = activeFilterId === "sale-50-banner";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header Section */}
      <section className="mx-auto max-w-[1600px] px-4 pt-8 md:pt-12 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              <span>Tuyển chọn đặc biệt</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight md:text-4xl lg:text-5xl">
              POPULAR RIGHT NOW
            </h1>
          </div>

          {/* Gender Tabs */}
          <div className="inline-flex items-center rounded-none border border-border p-1">
            <button
              type="button"
              onClick={() => handleGenderChange("Women")}
              className={`px-5 py-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
                selectedGender === "Women"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Women
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange("Men")}
              className={`px-5 py-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
                selectedGender === "Men"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Men
            </button>
          </div>
        </div>

        {/* Big Gymshark-Style 50% Sale Promo Banner */}
        <div
          onClick={() => setActiveFilterId((prev) => (prev === "sale-50-banner" ? null : "sale-50-banner"))}
          className={`group relative mt-8 cursor-pointer overflow-hidden border transition-all duration-300 ${
            isSale50Active
              ? "border-foreground ring-2 ring-foreground ring-offset-2"
              : "border-border hover:border-foreground/60"
          }`}
        >
          <div className="relative aspect-[16/7] sm:aspect-[21/8] lg:aspect-[28/8] w-full overflow-hidden bg-muted">
            <img
              src={sale50BannerImg}
              alt="Gymshark 50% Sale Banner"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              loading="eager"
            />
            {/* Subtle Gradient Overlay with Gymshark Typography */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-5 sm:p-8 md:p-10 text-white">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-1">
                  UP TO 50% OFF
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-white/90 font-bold">
                  LIMITED TIME ONLY • LAST CHANCE STYLES
                </span>
              </div>
              <div className="mt-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
                    LAST CHANCE SALE
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-white/80 max-w-xl line-clamp-2">
                    Nâng cấp đồ tập với các sản phẩm đang được giảm giá từ 50% trở lên. Số lượng có hạn!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isSale50Active ? "default" : "secondary"}
                    size="sm"
                    className="font-extrabold uppercase tracking-wider text-xs pointer-events-none"
                  >
                    {isSale50Active ? "Đang lọc giảm giá 50%+" : "Khám phá ngay →"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Interactive Banner Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activeCards.map((card) => {
            const isSelected = activeFilterId === card.id;
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`group flex cursor-pointer flex-col overflow-hidden border transition-all duration-300 ${
                  isSelected
                    ? "border-foreground ring-2 ring-foreground ring-offset-2"
                    : "border-border hover:border-foreground/50"
                }`}
              >
                {/* Image aspect ratio container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {card.badge && (
                    <Badge
                      variant={isSelected ? "default" : "secondary"}
                      className="absolute left-3 top-3 uppercase font-bold tracking-wider text-[10px]"
                    >
                      {card.badge}
                    </Badge>
                  )}
                  {isSelected && (
                    <div className="absolute inset-x-0 bottom-0 bg-foreground/90 py-1 text-center text-xs font-bold uppercase tracking-wider text-background">
                      Đang lọc danh mục này
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="font-display text-sm font-extrabold uppercase leading-tight tracking-tight md:text-base">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/50 text-[11px] font-bold uppercase tracking-wider">
                    <span className={isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}>
                      {isSelected ? "Bấm để bỏ chọn" : "Khám phá ngay →"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Filter Bar & Products Grid */}
      <section className="mx-auto max-w-[1600px] px-4 pt-12 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Filter className="size-4 text-muted-foreground" />
            <h2 className="font-display text-lg font-bold uppercase tracking-tight md:text-xl">
              {isSale50Active
                ? "Sản phẩm giảm giá từ 50% trở lên"
                : currentCard
                  ? currentCard.filterLabel
                  : `Tất cả sản phẩm nổi bật (${selectedGender})`}
            </h2>
            <Badge variant="outline" className="font-semibold">
              {data?.totalCount ?? 0} sản phẩm
            </Badge>
          </div>

          {activeFilterId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilterId(null)}
              className="gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              Xóa bộ lọc nhanh
            </Button>
          )}
        </div>

        {/* Product Grid */}
        {isPending ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-sm text-destructive">Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-20 text-center">
            <Sparkles className="mx-auto size-8 text-muted-foreground/60" />
            <h3 className="mt-3 font-display text-lg font-bold uppercase">Chưa có sản phẩm phù hợp</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Không tìm thấy sản phẩm nào với tiêu chí lọc hiện tại.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveFilterId(null)}
              className="mt-5 font-bold uppercase tracking-wider text-xs"
            >
              Xem tất cả sản phẩm {selectedGender}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => {
              const preferredColor =
                currentCard?.query?.colors?.[0] ||
                (currentCard?.id === "women-pink" ? "pink" : undefined);

              return (
                <ProductCard
                  key={`${product.productId}-${currentCard?.id ?? "all"}`}
                  product={product}
                  selectedColor={preferredColor}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
