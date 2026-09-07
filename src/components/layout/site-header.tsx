import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore, cartCount } from "@/features/cart/store";
import { useWishlistStore } from "@/features/wishlist/store";
import { getMyWishlist } from "@/features/wishlist/services";
import { useAuthStore } from "@/features/auth/store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

import { NotificationBell } from "@/features/notification/components/notification-bell";

const NAV = [
  { label: "Nam", gender: "Men" },
  { label: "Nữ", gender: "Women" },
  { label: "Unisex", gender: "Unisex" },
  { label: "Tất cả", gender: "All" },
] as const;

function CountBadge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
      {value}
    </span>
  );
}

export function SiteHeader() {
  const hydrated = useHydrated();
  const lines = useCartStore((s) => s.lines);
  const wishlist = useWishlistStore((s) => s.productIds);
  const setProductIds = useWishlistStore((s) => s.setProductIds);
  const clearWishlist = useWishlistStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const wishlistQuery = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => getMyWishlist(1, 100),
    enabled: hydrated && !!user,
  });

  useEffect(() => {
    if (wishlistQuery.data?.items) {
      setProductIds(wishlistQuery.data.items.map((i) => i.productId));
    }
  }, [wishlistQuery.data, setProductIds]);

  useEffect(() => {
    if (hydrated && !user) {
      clearWishlist();
    }
  }, [clearWishlist, hydrated, user]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 lg:px-8">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="lg:hidden" aria-label="Mở menu">
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetTitle className="text-lg">Danh mục</SheetTitle>
            <nav className="mt-6 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.gender}
                  to="/products"
                  search={{ gender: item.gender }}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-3 font-display text-lg font-extrabold uppercase"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="font-display text-2xl font-extrabold uppercase tracking-tight">
          Gymkitten
        </Link>

        <nav className="ml-6 hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.gender}
              to="/products"
              search={{ gender: item.gender }}
              className="eyebrow transition-colors hover:text-muted-foreground"
              activeProps={{ className: "underline underline-offset-8" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          className="ml-auto hidden w-72 items-center gap-2 border border-input px-3 md:flex"
          onSubmit={(event) => {
            event.preventDefault();
            window.location.href = `/products?q=${encodeURIComponent(search)}`;
          }}
        >
          <Search className="size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm sản phẩm"
            className="h-9 border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </form>

        <div className="ml-auto flex items-center gap-4 md:ml-4">
          <Link to="/account" aria-label="Tài khoản" className="relative">
            <User className="size-5" />
            {hydrated && user ? (
              <span className="absolute -bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 bg-primary" />
            ) : null}
          </Link>
          <NotificationBell />
          <Link to="/wishlist" aria-label="Yêu thích" className="relative">
            <Heart className="size-5" />
            <CountBadge value={hydrated && user ? wishlist.length : 0} />
          </Link>
          <Link to="/cart" aria-label="Giỏ hàng" className="relative">
            <ShoppingBag className="size-5" />
            <CountBadge value={hydrated ? cartCount(lines) : 0} />
          </Link>
        </div>
      </div>
    </header>
  );
}
