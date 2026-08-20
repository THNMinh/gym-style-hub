import { useState } from "react";
import { formatPrice } from "@/shared/lib/format";
import { cartSubTotal, useCartStore } from "@/features/cart/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Truck, ShieldCheck, Tag } from "lucide-react";
import { env } from "@/core/config/env";
import { toast } from "sonner";

export function CartSummary() {
  const lines = useCartStore((s) => s.lines);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const subTotal = cartSubTotal(lines);
  const shippingFee = subTotal >= env.freeShippingThreshold || subTotal === 0 ? 0 : env.shippingFee;
  const discountAmount = (subTotal * discountPercent) / 100;
  const grandTotal = Math.max(0, subTotal + shippingFee - discountAmount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "GYMKITTEN10" || code === "GYM10") {
      setDiscountPercent(10);
      setAppliedCoupon(code);
      toast.success("Áp dụng mã giảm giá 10% thành công!");
    } else if (code === "WELCOME20") {
      setDiscountPercent(20);
      setAppliedCoupon(code);
      toast.success("Áp dụng mã giảm giá 20% thành công!");
    } else {
      toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  return (
    <Card className="border border-border/80 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <ShoppingBag className="size-5 text-primary" />
          Tóm tắt đơn hàng ({lines.length} sản phẩm)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Items List */}
        <div className="max-h-[320px] space-y-4 overflow-y-auto pr-1">
          {lines.map((line) => (
            <div key={line.cartItemId} className="flex gap-3 text-sm">
              <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-md bg-muted border">
                <img
                  src={line.imageUrl}
                  alt={line.productName}
                  className="h-full w-full object-cover"
                />
                <Badge
                  variant="secondary"
                  className="absolute bottom-0.5 right-0.5 h-4 px-1 text-[10px] font-bold"
                >
                  x{line.quantity}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h4 className="font-semibold leading-tight line-clamp-1">{line.productName}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Màu: {line.colorName} | Size: {line.size}
                  </p>
                </div>
                <p className="text-xs font-bold text-foreground">
                  {formatPrice(line.unitPrice * line.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Coupon Code Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Mã giảm giá (GYM10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="pl-9 text-xs uppercase"
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleApplyCoupon}>
              Áp dụng
            </Button>
          </div>
          {appliedCoupon && (
            <p className="text-xs text-emerald-600 font-medium">
              ✓ Đã áp dụng mã <span className="font-bold">{appliedCoupon}</span> (-{discountPercent}%)
            </p>
          )}
        </div>

        <Separator />

        {/* Pricing Calculation Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Tạm tính</span>
            <span className="font-medium text-foreground">{formatPrice(subTotal)}</span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <Truck className="size-3.5" /> Phí vận chuyển
            </span>
            <span className="font-medium text-foreground">
              {shippingFee === 0 ? (
                <span className="text-emerald-600 font-bold">MIỄN PHÍ</span>
              ) : (
                formatPrice(shippingFee)
              )}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Giảm giá ({discountPercent}%)</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <Separator className="my-2" />

          <div className="flex justify-between text-base font-bold text-foreground">
            <span>Tổng cộng</span>
            <span className="text-lg text-primary">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-primary" />
            <span>Giao hàng nhanh 2-4 ngày làm việc</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span>Bảo mật thanh toán 100% qua SSL</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
