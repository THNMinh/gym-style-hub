import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { CreditCard, Truck, Wallet, ShieldAlert, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { env } from "@/core/config/env";
import { request, ApiError } from "@/core/lib/api-client";
import { useCartStore } from "@/features/cart/store";
import { useAuthStore } from "@/features/auth/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  checkoutSchema,
  type CheckoutFormValues,
  type CheckoutResponseData,
} from "@/lib/validations/checkout";

interface CheckoutFormProps {
  couponCode?: string | null;
}

export function CheckoutForm({ couponCode }: CheckoutFormProps) {
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      receiverName: user?.fullName ?? "",
      phoneNumber: user?.phone ?? "",
      shippingAddress: "",
      ward: "",
      district: "",
      city: "",
      paymentMethod: "COD",
      customerNote: "",
    },
  });

  const selectedPaymentMethod = watch("paymentMethod");

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!lines.length) {
      toast.error("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!user || !accessToken) {
      toast.error("Vui lòng đăng nhập để tiến hành thanh toán!");
      navigate({ to: "/auth", search: { redirect: "/checkout" } });
      return;
    }

    setIsSubmitting(true);

    // Build full shipping address string
    const addressParts = [
      values.shippingAddress.trim(),
      values.ward?.trim(),
      values.district?.trim(),
      values.city?.trim(),
    ].filter(Boolean);
    const fullAddress = `${values.receiverName} (${values.phoneNumber}) - ${addressParts.join(", ")}`;

    // Prepare API Payload matching CheckoutCommand schema
    const payload = {
      items: lines.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      shippingAddress: fullAddress,
      paymentMethod: values.paymentMethod,
      customerNote: values.customerNote?.trim() || null,
      couponCode: couponCode?.trim() || null,
    };

    try {
      // Gọi API Endpoint POST /api/checkout với request() tự động đính kèm Bearer token & refresh token
      let data: CheckoutResponseData;

      try {
        data = await request<CheckoutResponseData>("/api/checkout", {
          method: "POST",
          body: payload,
        });
      } catch (reqErr) {
        // Fallback với axios đính kèm accessToken
        if (reqErr instanceof ApiError && reqErr.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
          navigate({ to: "/auth", search: { redirect: "/checkout" } });
          return;
        }
        
        const response = await axios.post<CheckoutResponseData>(
          `${env.apiBaseUrl}/api/checkout`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        data = response.data;
      }

      // Handle Payment Redirect if paymentUrl exists (VNPAY / MOMO)
      if (data.paymentUrl) {
        toast.loading("Đang chuyển hướng sang cổng thanh toán...");
        clearCart();
        window.location.href = data.paymentUrl;
        return;
      }

      // Handle COD Payment Success
      if (values.paymentMethod === "COD") {
        toast.success(`Đặt hàng thành công! Mã đơn: ${data.orderCode}`);
        clearCart();
        navigate({
          to: "/orders/success",
          search: { orderCode: data.orderCode, total: data.totalAmount },
        });
      }
    } catch (error: unknown) {
      console.error("Checkout Error:", error);
      if (axios.isAxiosError(error)) {
        const errorDetail =
          error.response?.data?.detail ||
          error.response?.data?.title ||
          error.response?.data?.message ||
          "Có lỗi xảy ra khi xử lý đơn hàng";
        toast.error(`Đặt hàng thất bại: ${errorDetail}`);
      } else if (error instanceof ApiError) {
        toast.error(`Đặt hàng thất bại: ${error.message}`);
      } else {
        toast.error("Không thể kết nối đến máy chủ thanh toán");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Shipping Address Card */}
      <Card className="border border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Truck className="size-5 text-primary" /> Thông tin giao hàng
          </CardTitle>
          <CardDescription>
            Nhập chính xác người nhận và địa chỉ giao hàng để đảm bảo đơn hàng đến nhanh nhất.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="receiverName">Tên người nhận *</Label>
              <Input
                id="receiverName"
                placeholder="Nguyễn Văn A"
                {...register("receiverName")}
                disabled={isSubmitting}
              />
              {errors.receiverName && (
                <p className="text-xs text-destructive">{errors.receiverName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại *</Label>
              <Input
                id="phoneNumber"
                placeholder="0987654321"
                {...register("phoneNumber")}
                disabled={isSubmitting}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingAddress">Địa chỉ chi tiết (Số nhà, tên đường) *</Label>
            <Input
              id="shippingAddress"
              placeholder="123 Đường Nguyễn Trãi"
              {...register("shippingAddress")}
              disabled={isSubmitting}
            />
            {errors.shippingAddress && (
              <p className="text-xs text-destructive">{errors.shippingAddress.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ward">Phường / Xã</Label>
              <Input id="ward" placeholder="Phường 2" {...register("ward")} disabled={isSubmitting} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Quận / Huyện</Label>
              <Input
                id="district"
                placeholder="Quận 1"
                {...register("district")}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Tỉnh / Thành phố</Label>
              <Input
                id="city"
                placeholder="TP. Hồ Chí Minh"
                {...register("city")}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="customerNote">Ghi chú cho đơn hàng (Tùy chọn)</Label>
            <Textarea
              id="customerNote"
              placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
              rows={3}
              {...register("customerNote")}
              disabled={isSubmitting}
            />
            {errors.customerNote && (
              <p className="text-xs text-destructive">{errors.customerNote.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Card */}
      <Card className="border border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <CreditCard className="size-5 text-primary" /> Phương thức thanh toán
          </CardTitle>
          <CardDescription>Chọn phương thức thanh toán phù hợp với bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={selectedPaymentMethod}
            onValueChange={(val) => setValue("paymentMethod", val as "COD" | "VNPAY" | "MOMO")}
            className="grid gap-3 sm:grid-cols-3"
          >
            {/* COD Option */}
            <div
              className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all ${
                selectedPaymentMethod === "COD"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-accent/50"
              }`}
              onClick={() => setValue("paymentMethod", "COD")}
            >
              <RadioGroupItem value="COD" id="payment-cod" className="mt-1" />
              <Label htmlFor="payment-cod" className="cursor-pointer font-normal">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Truck className="size-4 text-primary" /> COD
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Thanh toán bằng tiền mặt khi nhận hàng.
                </p>
              </Label>
            </div>

            {/* VNPAY Option */}
            <div
              className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all ${
                selectedPaymentMethod === "VNPAY"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-accent/50"
              }`}
              onClick={() => setValue("paymentMethod", "VNPAY")}
            >
              <RadioGroupItem value="VNPAY" id="payment-vnpay" className="mt-1" />
              <Label htmlFor="payment-vnpay" className="cursor-pointer font-normal">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <CreditCard className="size-4 text-blue-600" /> VNPay
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Thanh toán qua Ví / ATM / QR Code VNPay.
                </p>
              </Label>
            </div>

            {/* MOMO Option */}
            <div
              className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all ${
                selectedPaymentMethod === "MOMO"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:bg-accent/50"
              }`}
              onClick={() => setValue("paymentMethod", "MOMO")}
            >
              <RadioGroupItem value="MOMO" id="payment-momo" className="mt-1" />
              <Label htmlFor="payment-momo" className="cursor-pointer font-normal">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Wallet className="size-4 text-pink-600" /> MoMo
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Thanh toán qua ứng dụng Ví MoMo.
                </p>
              </Label>
            </div>
          </RadioGroup>
          {errors.paymentMethod && (
            <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>
          )}

          {selectedPaymentMethod !== "COD" && (
            <div className="rounded-md bg-blue-50 dark:bg-blue-950/40 p-3 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <ShieldAlert className="size-4 flex-shrink-0" />
              <span>
                Sau khi bấm "Hoàn tất đặt hàng", bạn sẽ được chuyển hướng tự động sang cổng{" "}
                <span className="font-bold">{selectedPaymentMethod}</span> để quét mã / thanh toán.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || lines.length === 0}
        className="w-full h-12 text-base font-bold shadow-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-5 animate-spin" /> Đang xử lý đơn hàng...
          </>
        ) : (
          `Hoàn tất đặt hàng (${lines.length} sản phẩm)`
        )}
      </Button>
    </form>
  );
}
