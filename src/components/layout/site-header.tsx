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
  const openDrawer = useCartStore((s) => s.openDrawer);
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

  const fetchCart = useCartStore((s) => s.fetchCart);
  useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      await fetchCart();
      return true;
    },
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
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-4 lg:px-8">
        {/* Left Column: Menu Drawer (Mobile) & Navigation Links (Desktop) */}
        <div className="flex flex-1 items-center gap-6 min-w-0">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="lg:hidden" aria-label="Mở menu">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="text-lg">Danh mục</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                <Link
                  to="/featured"
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-3 font-display text-lg font-extrabold uppercase"
                >
                  Sản phẩm nổi bật
                </Link>
                <Link
                  to="/collab"
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-3 font-display text-lg font-extrabold uppercase flex items-center justify-between text-primary"
                >
                  <span>COLLAB</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 border border-primary/20">
                    Hot
                  </span>
                </Link>
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

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.gender}
                to="/products"
                search={{ gender: item.gender }}
                className="eyebrow text-xs font-bold tracking-wider transition-colors hover:text-muted-foreground"
                activeProps={{ className: "underline underline-offset-8" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/featured"
              className="eyebrow text-xs font-bold tracking-wider transition-colors hover:text-muted-foreground"
              activeProps={{ className: "underline underline-offset-8" }}
            >
              Nổi bật
            </Link>
            <Link
              to="/collab"
              className="eyebrow text-xs font-black tracking-wider transition-colors text-primary hover:text-primary/80"
              activeProps={{ className: "underline underline-offset-8" }}
            >
              COLLAB
            </Link>
          </nav>
        </div>

        {/* Center Column: GYMKITTEN Brand Logo Centered (Gymshark Style) */}
        <div className="flex flex-shrink-0 items-center justify-center">
          <Link
            to="/"
            className="font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-foreground hover:opacity-90 transition-opacity select-none"
          >
            GYMKITTEN
          </Link>
        </div>

        {/* Right Column: Search, Account, Notification, Wishlist, Cart */}
        <div className="flex flex-1 items-center justify-end gap-3 md:gap-4 min-w-0">
          <form
            className="hidden w-56 xl:w-72 items-center gap-2 border border-input px-3 md:flex rounded-none"
            onSubmit={(event) => {
              event.preventDefault();
              window.location.href = `/products?q=${encodeURIComponent(search)}`;
            }}
          >
            <Search className="size-4 text-muted-foreground shrink-0" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm sản phẩm..."
              className="h-9 border-0 px-0 shadow-none focus-visible:ring-0 text-xs"
            />
          </form>

          <Link to={hydrated && user ? "/account" : "/auth"} aria-label="Tài khoản" className="relative p-1">
            <User className="size-5" />
            {hydrated && user ? (
              <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 bg-primary" />
            ) : null}
          </Link>
          <NotificationBell />
          <Link to="/wishlist" aria-label="Yêu thích" className="relative p-1">
            <Heart className="size-5" />
            <CountBadge value={hydrated && user ? wishlist.length : 0} />
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            aria-label="Giỏ hàng"
            className="relative p-1 hover:text-muted-foreground transition-colors cursor-pointer"
          >
            <ShoppingBag className="size-5" />
            <CountBadge value={hydrated ? cartCount(lines) : 0} />
          </button>
        </div>
      </div>
    </header>
  );
}
