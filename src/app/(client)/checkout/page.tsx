"use client";

import { useState } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CartSummary } from "@/components/checkout/cart-summary";
import { useCartStore } from "@/features/cart/store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import type { ApplyCouponResponse } from "@/entities/coupon/types";

export default function CheckoutPage() {
  const hydrated = useHydrated();
  const lines = useCartStore((s) => s.lines);
  const [appliedCoupon, setAppliedCoupon] = useState<ApplyCouponResponse | null>(null);

  if (!hydrated) {
    return <div className="min-h-[60vh] flex items-center justify-center" />;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-10 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Giỏ hàng của bạn đang trống</h1>
        <p className="mt-2 text-muted-foreground">
          Vui lòng thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.
        </p>
        <Button asChild className="mt-8 font-bold">
          <Link to="/products" search={{}}>
            Mua sắm ngay
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-8 lg:px-8">
      {/* Header Breadcrumb / Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to="/cart"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1 size-3.5" /> Quay lại giỏ hàng
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Thanh toán</h1>
        </div>
      </div>

      {/* Two Column Layout: Form on Left, Cart Summary on Right */}
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <CheckoutForm couponCode={appliedCoupon?.code} />
        </div>
        <div className="lg:sticky lg:top-28 h-fit">
          <CartSummary onCouponApplied={(res) => setAppliedCoupon(res)} />
        </div>
      </div>
    </div>
  );
}
