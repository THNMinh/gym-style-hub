import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cartSubTotal, useCartStore } from "../store";
import { formatPrice } from "@/shared/lib/format";
import { env } from "@/core/config/env";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/shared/hooks/use-hydrated";

export function CartFeature() {
  const hydrated = useHydrated();
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subTotal = cartSubTotal(lines);
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

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8">
      <h1 className="text-4xl">Giỏ hàng</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-6">
          {lines.map((line) => (
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
          <Button asChild className="mt-6 w-full">
            <Link to="/checkout">Thanh toán</Link>
          </Button>
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
