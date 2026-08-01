import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/entities/order/services";
import { getAddresses } from "@/entities/identity/services";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/entities/order/types";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { AuthFeature } from "@/features/auth/components/auth-feature";

export function AccountFeature() {
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const orders = useQuery({ queryKey: ["orders"], queryFn: getOrders, enabled: !!user });
  const addresses = useQuery({ queryKey: ["addresses"], queryFn: getAddresses, enabled: !!user });

  if (!hydrated) return <div className="min-h-[50vh]" />;
  if (!user) return <AuthFeature />;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">Tài khoản</p>
          <h1 className="mt-2 text-4xl">{user.fullName ?? user.email}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" onClick={logout}>
          Đăng xuất
        </Button>
      </div>

      <Tabs defaultValue="orders" className="mt-10">
        <TabsList>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          <TabsTrigger value="addresses">Địa chỉ</TabsTrigger>
          <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-8 space-y-6">
          {(orders.data ?? []).map((order) => (
            <article key={order.orderId} className="border border-border p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{order.orderCode}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)} · {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                  </p>
                </div>
                <span className="eyebrow bg-accent px-3 py-1.5">
                  {ORDER_STATUS_LABEL[order.currentStatus]}
                </span>
              </div>

              <ul className="mt-5 space-y-2 text-sm">
                {order.items.map((item) => (
                  <li key={item.orderItemId} className="flex justify-between gap-4">
                    <span>
                      {item.productName} · {item.colorName}/{item.size} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.totalPrice)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex justify-between border-t border-border pt-4 text-sm font-bold">
                <span>Tổng cộng</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>

              <ol className="mt-6 space-y-3 border-t border-border pt-4">
                {order.tracking.map((step) => (
                  <li key={step.trackingId} className="flex gap-3 text-xs">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-muted-foreground">
                        {formatDate(step.timestamp)} · {step.location}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ))}
          {orders.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
          ) : null}
        </TabsContent>

        <TabsContent value="addresses" className="mt-8 grid gap-4 md:grid-cols-2">
          {(addresses.data ?? []).map((address) => (
            <div key={address.addressId} className="border border-border p-6 text-sm">
              <p className="font-bold">{address.receiverName}</p>
              <p className="text-muted-foreground">{address.phoneNumber}</p>
              <p className="mt-2">
                {address.addressLine1}, {address.ward}, {address.district}, {address.city}
              </p>
              {address.isDefault ? (
                <span className="eyebrow mt-3 inline-block bg-accent px-2 py-1">Mặc định</span>
              ) : null}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="profile" className="mt-8 space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Họ tên:</span> {user.fullName ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span> {user.email}
          </p>
          <p>
            <span className="text-muted-foreground">Điện thoại:</span> {user.phone ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Vai trò:</span> {user.role}
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
