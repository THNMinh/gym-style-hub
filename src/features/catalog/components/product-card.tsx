import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/entities/catalog/types";
import { discountPercent, formatPrice } from "@/shared/lib/format";
import { Rating } from "@/shared/ui/rating";
import { useWishlistStore } from "@/features/wishlist/store";
import { useAuthStore } from "@/features/auth/store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const wishlist = useWishlistStore((s) => s.productIds);
  const toggle = useWishlistStore((s) => s.toggle);
  const user = useAuthStore((s) => s.user);

  const price = Math.min(...product.variants.map((v) => v.price));
  const original = product.variants[0]?.originalPrice ?? null;
  const off = discountPercent(price, original);
  const colors = [...new Map(product.variants.map((v) => [v.colorName, v.colorHex])).entries()];
  const liked = hydrated && wishlist.includes(product.productId);

  return (
    <article className="group relative">
      <Link
        to="/products/$slug"
        params={{ slug: product.productId }}
        className="block overflow-hidden bg-muted"
      >
        <img
          src={product.images[0]?.imageUrl}
          alt={product.name}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <button
        type="button"
        aria-label="Thêm vào yêu thích"
        onClick={() => {
          if (!user) {
            toast.error("Vui lòng đăng nhập để thêm vào wishlist");
            return;
          }
          toggle(product.productId);
        }}
        className="absolute right-3 top-3 grid size-9 place-items-center bg-background/85 backdrop-blur transition-colors hover:bg-background"
      >
        <Heart className={cn("size-4", liked && "fill-current")} />
      </button>

      {product.badges.length > 0 ? (
        <span className="absolute left-3 top-3 bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          {product.badges[0]}
        </span>
      ) : null}

      <div className="mt-3 space-y-1.5">
        <Link to="/products/$slug" params={{ slug: product.productId }} className="block">
          <h3 className="text-sm font-bold tracking-tight">{product.name}</h3>
        </Link>
        <p className="text-xs text-muted-foreground">{product.fitType}</p>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold", off && "text-sale")}>{formatPrice(price)}</span>
          {original ? (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(original)}</span>
          ) : null}
          {off ? <span className="text-xs font-bold text-sale">-{off}%</span> : null}
        </div>
        <Rating value={product.ratingAverage} count={product.reviewCount} />
        <div className="flex gap-1.5 pt-1">
          {colors.map(([name, hex]) => (
            <span
              key={name}
              title={name}
              className="size-3.5 rounded-full border border-border"
              style={{ backgroundColor: hex ?? undefined }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
