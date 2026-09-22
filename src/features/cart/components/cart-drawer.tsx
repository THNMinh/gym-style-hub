"use client";

import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCartStore, cartSubTotal, cartCount } from "../store";
import { useAuthStore } from "@/features/auth/store";
import { useWishlistStore } from "@/features/wishlist/store";
import { toggleWishlistApi } from "@/features/wishlist/services";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { formatPrice, discountPercent } from "@/shared/lib/format";
import { env } from "@/core/config/env";
import { ShoppingBag, Heart, Minus, Plus, Trash2, Info, Lock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const isOpen = useCartStore((s) => s.isOpen);
  const setIsOpen = useCartStore((s) => s.setIsOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const wishlist = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const subTotal = useMemo(() => cartSubTotal(lines), [lines]);
  const totalCount = useMemo(() => cartCount(lines), [lines]);
  const freeShippingThreshold = env.freeShippingThreshold;
  const isQualifiedFreeShipping = subTotal >= freeShippingThreshold;
  const progressPercent = Math.min(100, Math.round((subTotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subTotal);

  const handleCheckout = () => {
    closeDrawer();
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiến hành thanh toán!");
      navigate({ to: "/auth", search: { redirect: "/checkout" } });
      return;
    }
    navigate({ to: "/checkout" });
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    try {
      await updateQuantity(id, quantity);
    } catch (err: any) {
      toast.error(err?.message || "Không thể cập nhật số lượng.");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeItem(id);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (err: any) {
      toast.error(err?.message || "Không thể xóa sản phẩm.");
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }
    toggleWishlist(productId);
    try {
      const res = await toggleWishlistApi(productId);
      toast.success(res.message || (res.isAdded ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích"));
    } catch {
      // Revert if API failed
      toggleWishlist(productId);
    }
  };

  if (!hydrated) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[460px] p-0 flex flex-col bg-background border-l border-border shadow-2xl z-50 focus:outline-none"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>YOUR BAG</SheetTitle>
          <SheetDescription>Xem và quản lý các sản phẩm trong giỏ hàng</SheetDescription>
        </SheetHeader>

        {/* Drawer Header (Gymshark Style) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-black tracking-tight uppercase">YOUR BAG</h2>
          </div>
          <div className="flex items-center gap-2 pr-7">
            <div className="border border-border/80 px-2 py-1 flex items-center gap-1.5 text-xs font-bold text-foreground">
              <ShoppingBag className="size-3.5" />
              <span>{totalCount}</span>
            </div>
            <Link
              to="/wishlist"
              onClick={closeDrawer}
              className="border border-border/80 p-1.5 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted"
              title="Danh sách yêu thích"
            >
              <Heart className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="py-3 px-5 bg-muted/40 border-b border-border/60">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span>
              {isQualifiedFreeShipping ? (
                <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                  You've qualified for Free Standard Shipping
                </span>
              ) : (
                <span>
                  Thêm <strong className="text-foreground font-bold">{formatPrice(remainingForFreeShipping)}</strong> để được Free Shipping
                </span>
              )}
            </span>
            <Info className="size-3.5 text-muted-foreground shrink-0 cursor-pointer" />
          </div>
          <div className="h-1.5 w-full bg-border/80 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                isQualifiedFreeShipping ? "bg-blue-600" : "bg-blue-500"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Urgency Notice Callout */}
        <div className="flex items-start gap-2.5 px-5 py-2.5 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 text-xs border-b border-blue-100 dark:border-blue-900/40">
          <Info className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            Your items aren't reserved, checkout quickly to make sure you don't miss out.
          </p>
        </div>

        {/* Cart Item List */}
        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-base">Giỏ hàng của bạn đang trống</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
              Khám phá bộ sưu tập đồ tập cao cấp để bắt đầu hành trình của bạn.
            </p>
            <Button
              asChild
              onClick={closeDrawer}
              className="mt-6 font-bold text-xs uppercase tracking-wider"
            >
              <Link to="/products" search={{}}>
                Mua sắm ngay
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-border/60 px-5 py-1">
            {lines.map((line) => {
              const hasDiscount = line.originalPrice && line.originalPrice > line.unitPrice;
              const off = hasDiscount ? discountPercent(line.unitPrice, line.originalPrice!) : 0;
              const isItemLiked = wishlist.includes(line.productId);

              return (
                <div key={line.cartItemId} className="py-4 flex gap-3.5 text-sm">
                  <Link
                    to="/products/$slug"
                    params={{ slug: line.slug }}
                    onClick={closeDrawer}
                    className="w-20 shrink-0 aspect-[3/4] bg-muted overflow-hidden relative block border border-border/50"
                  >
                    <img
                      src={line.imageUrl}
                      alt={line.productName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          {off > 0 && (
                            <span className="text-[10px] font-black uppercase text-foreground dark:text-zinc-200 block mb-0.5 tracking-wider">
                              {off}% OFF | SAVE {formatPrice(line.originalPrice! - line.unitPrice)}
                            </span>
                          )}
                          <Link
                            to="/products/$slug"
                            params={{ slug: line.slug }}
                            onClick={closeDrawer}
                            className="font-bold text-xs sm:text-sm hover:underline line-clamp-2 block text-foreground leading-snug"
                          >
                            {line.productName}
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleWishlist(line.productId)}
                          className="p-1 text-muted-foreground hover:text-rose-500 transition-colors shrink-0"
                          title="Lưu vào yêu thích"
                        >
                          <Heart className={cn("size-4", isItemLiked && "fill-rose-500 text-rose-500")} />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        {line.colorName} · {line.size} · Boxy Fit
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-xs sm:text-sm text-foreground">
                          {formatPrice(line.unitPrice * line.quantity)}
                        </span>
                        {line.originalPrice && line.originalPrice > line.unitPrice && (
                          <span className="text-[11px] text-rose-600 line-through">
                            {formatPrice(line.originalPrice * line.quantity)}
                          </span>
                        )}
                      </div>

                      {/* Stepper & Trash */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-border bg-background">
                          <button
                            type="button"
                            aria-label="Giảm số lượng"
                            className="grid size-6 place-items-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => handleUpdateQuantity(line.cartItemId, line.quantity - 1)}
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label="Tăng số lượng"
                            className="grid size-6 place-items-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => handleUpdateQuantity(line.cartItemId, line.quantity + 1)}
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          aria-label="Xóa món này"
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleRemove(line.cartItemId)}
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Drawer Sticky Footer */}
        {lines.length > 0 && (
          <div className="border-t border-border p-5 bg-background space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Tạm tính ({totalCount} món)</span>
              <span className="font-black text-base sm:text-lg">{formatPrice(subTotal)}</span>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full h-12 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 rounded-none shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              <Lock className="size-3.5" /> Checkout securely
            </Button>

            <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
              <Link
                to="/cart"
                onClick={closeDrawer}
                className="underline hover:text-foreground font-semibold"
              >
                Xem giỏ hàng đầy đủ
              </Link>
              <span>Đổi trả 30 ngày</span>
            </div>

            {/* Payment Method: MoMo */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-pink-300 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 font-bold shadow-2xs">
                <Wallet className="size-3.5 text-pink-600 dark:text-pink-400" />
                MoMo
              </span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
