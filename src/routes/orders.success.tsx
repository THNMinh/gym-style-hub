import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/shared/lib/format";

export const Route = createFileRoute("/orders/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderCode: (search.orderCode as string) || "GK-SUCCESS",
    total: search.total ? Number(search.total) : null,
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderCode, total } = useSearch({ from: "/orders/success" });

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <Card className="border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xl">
        <CardContent className="pt-12 pb-10 px-6">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-12" />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-foreground">Đặt hàng thành công!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cảm ơn bạn đã mua sắm tại <span className="font-bold text-foreground">GymKitten</span>.
          </p>

          <div className="mt-8 rounded-lg bg-background p-6 border text-left space-y-3">
            <div className="flex justify-between items-center text-sm border-b pb-3">
              <span className="text-muted-foreground">Mã đơn hàng</span>
              <span className="font-mono font-bold text-primary text-base">{orderCode}</span>
            </div>

            {total !== null && (
              <div className="flex justify-between items-center text-sm border-b pb-3">
                <span className="text-muted-foreground">Tổng tiền thanh toán</span>
                <span className="font-bold text-emerald-600 text-base">{formatPrice(total)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-muted-foreground">Trạng thái đơn hàng</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                <Package className="size-3" /> Đang xử lý
              </span>
            </div>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Chúng tôi đã nhận được thông tin đơn hàng và sẽ liên hệ giao hàng trong thời gian sớm nhất.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild size="lg" className="font-bold">
              <Link to="/account">
                Xem chi tiết đơn hàng <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/products" search={{}}>
                <ShoppingBag className="mr-2 size-4" /> Tiếp tục mua sắm
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
