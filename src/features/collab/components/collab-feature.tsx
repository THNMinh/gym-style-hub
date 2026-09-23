import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Trophy, Flame, ChevronRight, Layers } from "lucide-react";
import { getProducts } from "@/entities/catalog/services";
import { ProductCard } from "@/features/catalog/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Import images for David Laid
import davidLaid1 from "@/assets/480888496_18485244358019954_6787991780232839178_n.jpg";
import davidLaid2 from "@/assets/656361427_18570917998019954_3572175908195572548_n.jpg";
import davidLaid3 from "@/assets/images-CBUM_Ecom_PDPImage_USP_26306745.webp";

// Import images for Carlos
import carlos1 from "@/assets/670292074_18517931122074603_6659174516242365726_n.jpg";
import carlos2 from "@/assets/656728495_18058087049458882_3714926439682386043_n.jpg";
import carlos3 from "@/assets/654392030_18125584102508219_8418104243361551618_n.jpg";

// Import images for Cbum
import cbum1 from "@/assets/image (8).jpg";
import cbum2 from "@/assets/image (2).avif";
import cbum3 from "@/assets/683840238_18593184271015250_2717140156731965527_n.jpg";

interface AthleteCollab {
  id: "david-laid" | "carlos" | "cbum";
  name: string;
  searchTerm: string;
  badge: string;
  subtitle: string;
  quote: string;
  description: string;
  images: [string, string, string];
  lookTitles: [string, string, string];
}

const ATHLETES: AthleteCollab[] = [
  {
    id: "david-laid",
    name: "David Laid",
    searchTerm: "David Laid",
    badge: "Creative Director of Lifting",
    subtitle: "GYMKITTEN × DAVID LAID",
    quote: "Aesthetics isn't just how you look. It's the standard you set in the dark.",
    description:
      "Tái định nghĩa phong cách thể hình hoàng kim với phom dáng cắt xẻ táo bạo, chất vải co giãn định hình cơ bắp tối ưu cùng nét phong trần bụi bặm.",
    images: [davidLaid1, davidLaid2, davidLaid3],
    lookTitles: ["Heavy Duty Lift", "Signature Silhouette", "The Classic Drop"],
  },
  {
    id: "carlos",
    name: "Carlos",
    searchTerm: "Carlos",
    badge: "Elite High-Performance",
    subtitle: "GYMKITTEN × CARLOS",
    quote: "Discipline beats motivation every single day. Train like everything is on the line.",
    description:
      "Bộ sưu tập đề cao sự cơ động bùng nổ, tối ưu khả năng thoát mồ hôi và nâng cao hiệu suất tối đa cho những buổi tập cường độ cao nhất.",
    images: [carlos1, carlos2, carlos3],
    lookTitles: ["Explosive Movement", "Engineered Ventilation", "Raw Intensity"],
  },
  {
    id: "cbum",
    name: "Cbum",
    searchTerm: "Cbum",
    badge: "5x Classic Physique Champ",
    subtitle: "GYMKITTEN × CHRIS BUMSTEAD",
    quote: "Champions aren't made when everybody is watching. They are forged in the quiet grind.",
    description:
      "Mang hơi thở đẳng cấp của nhà vô địch thể hình thế giới. Từng đường kim mũi chỉ phục vụ cho những buổi nâng tạ nặng nhọc và khắc nghiệt.",
    images: [cbum1, cbum2, cbum3],
    lookTitles: ["Golden Era Classic", "Champion Standard", "Relentless Focus"],
  },
];

export function CollabFeature() {
  const [selectedAthleteId, setSelectedAthleteId] = useState<AthleteCollab["id"]>("david-laid");

  const activeAthlete = useMemo(
    () => ATHLETES.find((a) => a.id === selectedAthleteId) ?? ATHLETES[0],
    [selectedAthleteId],
  );

  const { data, isPending, isError } = useQuery({
    queryKey: ["collab-products", activeAthlete.searchTerm],
    queryFn: () =>
      getProducts({
        search: activeAthlete.searchTerm,
        pageSize: 24,
      }),
  });

  const products = data?.items ?? [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Banner / Hero Header */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1600px] px-4 py-8 md:py-12 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <Flame className="size-4" />
                <span>Special Collaboration Series</span>
              </div>
              <h1 className="mt-1 font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight">
                ATHLETE COLLABS
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-muted-foreground">
                Những bộ sưu tập giới hạn được đồng thiết kế cùng các biểu tượng thể hình hàng đầu thế giới. Tinh tế, bền bỉ và đậm chất biểu tượng.
              </p>
            </div>

            {/* Athlete Selector Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {ATHLETES.map((athlete) => {
                const isActive = athlete.id === selectedAthleteId;
                return (
                  <button
                    key={athlete.id}
                    type="button"
                    onClick={() => setSelectedAthleteId(athlete.id)}
                    className={`group relative flex items-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 border ${
                      isActive
                        ? "bg-foreground text-background border-foreground shadow-md ring-2 ring-foreground/20"
                        : "bg-background text-foreground border-border hover:border-foreground/60 hover:bg-muted"
                    }`}
                  >
                    <Trophy
                      className={`size-3.5 transition-colors ${
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    />
                    <span>{athlete.name}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Active Athlete Showcase: 3 Lookbook Background Images Mosaic */}
      <section className="mx-auto max-w-[1600px] px-4 pt-8 md:pt-10 lg:px-8">
        {/* Athlete Overview Box */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-l-4 border-primary bg-muted/40 p-4 sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-bold text-[10px] tracking-wider uppercase bg-background">
                {activeAthlete.badge}
              </Badge>
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                {activeAthlete.subtitle}
              </span>
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {activeAthlete.name} Collection
            </h2>
            <p className="mt-1 text-xs sm:text-sm italic text-muted-foreground">
              "{activeAthlete.quote}"
            </p>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-foreground/80">
            {activeAthlete.description}
          </p>
        </div>

        {/* 3 Images Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {activeAthlete.images.map((imageSrc, idx) => (
            <div
              key={`${activeAthlete.id}-img-${idx}`}
              className="group relative aspect-[3/4] w-full overflow-hidden border border-border bg-black"
            >
              <img
                src={imageSrc}
                alt={`${activeAthlete.name} collab shot ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="eager"
              />
              {/* Sleek Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/90 text-primary-foreground text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                    CAMPAIGN
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                    LOOK {idx + 1}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-base sm:text-lg font-black uppercase tracking-tight text-white drop-shadow-sm">
                  {activeAthlete.lookTitles[idx]}
                </h3>
                <p className="text-[11px] text-white/80 uppercase font-semibold tracking-wider">
                  {activeAthlete.name} Series
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collab Products Grid */}
      <section className="mx-auto max-w-[1600px] px-4 pt-12 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <Layers className="size-4 text-primary" />
            <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight">
              Sản phẩm dòng {activeAthlete.name}
            </h2>
            <Badge variant="outline" className="font-semibold">
              {data?.totalCount ?? 0} sản phẩm
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
            <span>Tìm kiếm theo:</span>
            <span className="font-bold text-foreground">"{activeAthlete.searchTerm}"</span>
          </div>
        </div>

        {/* Loading state */}
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
          <div className="rounded-lg border border-dashed border-border py-20 text-center px-4">
            <Sparkles className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-display text-lg font-bold uppercase">
              Chưa có sản phẩm mang tên "{activeAthlete.searchTerm}"
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Các sản phẩm trong đợt drop {activeAthlete.name} đang được chuẩn bị. Bạn có thể xem các dòng sản phẩm của vận động viên khác!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {ATHLETES.filter((a) => a.id !== activeAthlete.id).map((other) => (
                <Button
                  key={other.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAthleteId(other.id)}
                  className="font-bold uppercase tracking-wider text-xs gap-1.5"
                >
                  <span>Xem {other.name}</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
