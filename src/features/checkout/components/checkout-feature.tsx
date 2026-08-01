import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartSubTotal, useCartStore } from "@/features/cart/store";
import { applyCoupon, calcDiscount, placeOrder } from "@/entities/order/services";
import type { Coupon, Order, PaymentMethod } from "@/entities/order/types";
import { PAYMENT_METHOD_LABEL } from "@/entities/order/types";
import { env } from "@/core/config/env";
import { formatPrice } from "@/shared/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { useAuthStore } from "@/features/auth/store";
import { cn } from "@/lib/utils";

export function CheckoutFeature() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);

  const [form, setForm] = useState({
    receiverName: user?.fullName ?? "",
    phoneNumber: user?.phone ?? "",
    addressLine1: "",
    ward: "",
    district: "",
    city: "",
    note: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);

  const subTotal = cartSubTotal(lines);
  const shipping = subTotal >= env.freeShippingThreshold ? 0 : env.shippingFee;
  const discount = calcDiscount(coupon, subTotal);
  const total = Math.max(0, subTotal + shipping - discount);

  const couponMutation = useMutation({
    mutationFn: () => applyCoupon(couponCode, subTotal),
    onSuccess: (data) => {
      setCoupon(data);
      toast.success(`Đã áp dụng mã ${data.code}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const orderMutation = useMutation({
    mutationFn: () =>
      placeOrder({
        lines,
        shippingAddress: `${form.addressLine1}, ${form.ward}, ${form.district}, ${form.city}`,
        paymentMethod,
        customerNote: form.note.trim() || null,
        subTotal,
        shippingFee: shipping,
        discountAmount: discount,
      }),
    onSuccess: (order) => {
      setPlaced(order);
      clear();
    },
    onError: () => toast.error("Không thể đặt hàng, vui lòng thử lại"),
  });

  if (!hydrated) return <div className="min-h-[50vh]" />;

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="eyebrow text-muted-foreground">Đặt hàng thành công</p>
        <h1 className="mt-3 text-4xl">Cảm ơn bạn!</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Mã đơn hàng của bạn là <span className="font-bold text-foreground">{placed.orderCode}</span>.
          Chúng tôi sẽ liên hệ xác nhận trong ít phút.
        </p>
        <p className="mt-2 text-sm">Tổng thanh toán: {formatPrice(placed.totalAmount)}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/account">Xem đơn hàng</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/products" search={{}}>
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl">Chưa có sản phẩm để thanh toán</h1>
        <Button asChild className="mt-6">
          <Link to="/products" search={{}}>
            Mua sắm ngay
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8">
      <h1 className="text-4xl">Thanh toán</h1>

      <form
        className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]"
        onSubmit={(event) => {
          event.preventDefault();
          orderMutation.mutate();
        }}
      >
        <div className="space-y-10">
          <section>
            <h2 className="text-xl">Địa chỉ giao hàng</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="receiverName">Người nhận</Label>
                <Input
                  id="receiverName"
                  required
                  value={form.receiverName}
                  onChange={(e) => setForm({ ...form, receiverName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  required
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="addressLine1">Địa chỉ</Label>
                <Input
                  id="addressLine1"
                  required
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ward">Phường / Xã</Label>
                <Input
                  id="ward"
                  required
                  value={form.ward}
                  onChange={(e) => setForm({ ...form, ward: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="district">Quận / Huyện</Label>
                <Input
                  id="district"
                  required
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="city">Tỉnh / Thành phố</Label>
                <Input
                  id="city"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl">Phương thức thanh toán</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "border px-4 py-4 text-left text-sm",
                    paymentMethod === method ? "border-primary bg-accent" : "border-border",
                  )}
                >
                  <span className="font-semibold">{PAYMENT_METHOD_LABEL[method]}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit border border-border p-6 lg:sticky lg:top-28">
          <h2 className="text-xl">Đơn hàng</h2>
          <ul className="mt-5 space-y-4">
            {lines.map((line) => (
              <li key={line.cartItemId} className="flex gap-3">
                <img
                  src={line.imageUrl}
                  alt={line.productName}
                  loading="lazy"
                  className="h-20 w-16 object-cover"
                />
                <div className="flex-1 text-xs">
                  <p className="font-semibold">{line.productName}</p>
                  <p className="text-muted-foreground">
                    {line.colorName} / {line.size} × {line.quantity}
                  </p>
                </div>
                <p className="text-xs font-semibold">{formatPrice(line.unitPrice * line.quantity)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex gap-2">
            <Input
              placeholder="Mã giảm giá (GYM10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={couponMutation.isPending || !couponCode}
              onClick={() => couponMutation.mutate()}
            >
              Áp dụng
            </Button>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tạm tính</dt>
              <dd>{formatPrice(subTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Vận chuyển</dt>
              <dd>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</dd>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-sale">
                <dt>Giảm giá {coupon ? `(${coupon.code})` : ""}</dt>
                <dd>-{formatPrice(discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt>Tổng cộng</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          <Button type="submit" className="mt-6 w-full" disabled={orderMutation.isPending}>
            {orderMutation.isPending ? "Đang xử lý..." : "Đặt hàng"}
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full" type="button">
            <Link to="/cart">Quay lại giỏ hàng</Link>
          </Button>
        </aside>
      </form>
    </div>
  );
}
