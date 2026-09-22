import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cartSubTotal, useCartStore } from "../store";
import { useAuthStore } from "@/features/auth/store";
import { formatPrice } from "@/shared/lib/format";
import { env } from "@/core/config/env";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { getProductsByIds } from "@/entities/catalog/services";
import type { Product } from "@/entities/catalog/types";

export function CartFeature() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const hydrated = useHydrated();
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const productIds = useMemo(() => Array.from(new Set(lines.map((l) => l.productId))), [lines]);

  const productsQuery = useQuery({
    queryKey: ["cart-products-validation", productIds],
    queryFn: () => getProductsByIds(productIds),
    enabled: hydrated && productIds.length > 0,
  });

  const productsMap = useMemo(() => {
    const map = new Map<string, Product>();
    (productsQuery.data || []).forEach((p) => map.set(p.productId, p));
    return map;
  }, [productsQuery.data]);

  const { availableLines, unavailableLines } = useMemo(() => {
    const available: typeof lines = [];
    const unavailable: { line: (typeof lines)[0]; reason: string }[] = [];

    lines.forEach((line) => {
      if (!productsQuery.isSuccess) {
        available.push(line);
        return;
      }
      const product = productsMap.get(line.productId);
      if (!product || !product.isActive) {
        unavailable.push({ line, reason: "Tạm ngưng bán" });
        return;
      }
      const variant = product.variants.find((v) => v.variantId === line.variantId);
      if (!variant || variant.available <= 0) {
        unavailable.push({ line, reason: "Hết hàng" });
        return;
      }
      if (variant.available < line.quantity) {
        unavailable.push({ line, reason: `Chỉ còn ${variant.available} sản phẩm` });
        return;
      }
      available.push(line);
    });

    return { availableLines: available, unavailableLines: unavailable };
  }, [lines, productsMap, productsQuery.isSuccess]);

  const subTotal = cartSubTotal(availableLines);
  const shipping = subTotal >= env.freeShippingThreshold || subTotal === 0 ? 0 : env.shippingFee;

  if (!hydrated) return <div className="min-h-[50vh]" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl">Giỏ hàng trống</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Thêm vài món để bắt đầu buổi tập tiếp theo của bạn.
        </p>
        <Button asChild className="mt-6">
          <Link to="/products" search={{}}>
            Tiếp tục mua sắm
          </Link>
        </Button>
      </div>
    );
  }

  const hasUnavailable = unavailableLines.length > 0;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8">
      <h1 className="text-4xl">Giỏ hàng</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <ul className="space-y-6">
            {availableLines.map((line) => (
              <li key={line.cartItemId} className="flex gap-4 border-b border-border pb-6">
                <Link to="/products/$slug" params={{ slug: line.slug }} className="w-28 shrink-0 bg-muted">
                  <img
                    src={line.imageUrl}
                    alt={line.productName}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-bold">{line.productName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {line.colorName} / Size {line.size}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">SKU: {line.sku}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(line.unitPrice * line.quantity)}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        aria-label="Giảm"
                        className="grid size-9 place-items-center"
                        onClick={() => updateQuantity(line.cartItemId, line.quantity - 1)}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Tăng"
                        className="grid size-9 place-items-center"
                        onClick={() => updateQuantity(line.cartItemId, line.quantity + 1)}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.cartItemId)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" /> Xoá
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Section for Unavailable Items */}
          {hasUnavailable && (
            <div className="mt-8 rounded-lg border border-destructive/40 bg-destructive/5 p-5 space-y-4">
              <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                <AlertTriangle className="size-4" />
                <span>Sản phẩm không khả dụng ({unavailableLines.length})</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Các sản phẩm này đã bị tạm ngưng bán hoặc hết hàng. Vui lòng xóa khỏi giỏ để có thể tiến hành thanh toán.
              </p>
              <ul className="space-y-4 pt-2">
                {unavailableLines.map(({ line, reason }) => (
                  <li
                    key={line.cartItemId}
                    className="flex items-center justify-between gap-4 border-b border-destructive/20 pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={line.imageUrl}
                        alt={line.productName}
                        className="size-14 object-cover opacity-60 rounded bg-muted"
                      />
                      <div>
                        <p className="font-bold text-sm line-clamp-1">{line.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {line.colorName} / Size {line.size}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold bg-destructive text-destructive-foreground rounded-xs">
                          🔴 {reason}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.cartItemId)}
                      className="flex items-center gap-1 text-xs text-destructive hover:underline font-semibold"
                    >
                      <Trash2 className="size-3.5" /> Xoá
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="h-fit border border-border p-6 lg:sticky lg:top-28">
          <h2 className="text-xl">Tóm tắt đơn</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tạm tính</dt>
              <dd>{formatPrice(subTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Phí vận chuyển</dt>
              <dd>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Tổng cộng</dt>
              <dd>{formatPrice(subTotal + shipping)}</dd>
            </div>
          </dl>

          {hasUnavailable ? (
            <div className="mt-6 space-y-2">
              <Button disabled className="w-full bg-muted text-muted-foreground cursor-not-allowed">
                Không thể thanh toán
              </Button>
              <p className="text-center text-xs text-destructive font-medium">
                Vui lòng xóa các sản phẩm không khả dụng để tiếp tục.
              </p>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (!user) {
                  toast.error("Vui lòng đăng nhập để tiến hành thanh toán!");
                  navigate({ to: "/auth", search: { redirect: "/checkout" } });
                  return;
                }
                navigate({ to: "/checkout" });
              }}
              className="mt-6 w-full"
            >
              Thanh toán
            </Button>
          )}

          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/products" search={{}}>
              Tiếp tục mua sắm
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
