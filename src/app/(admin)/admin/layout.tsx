"use client";

import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert, LogIn } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { parseJwtPayload } from "@/entities/identity/jwt";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  // Giải mã trực tiếp Claim Role từ AccessToken để phòng trường hợp Zustand cache user cũ
  const payload = accessToken ? parseJwtPayload(accessToken) : null;
  const tokenRole =
    payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    payload?.role ||
    payload?.Role;

  // Chuỗi Role Admin chính xác trong hệ thống: "Admin" (hoặc không phân biệt hoa thường "admin")
  const isAdmin = Boolean(
    accessToken &&
      (user?.role === "Admin" ||
        user?.role?.toLowerCase() === "admin" ||
        String(tokenRole).toLowerCase() === "admin")
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground text-xs font-semibold">
        Đang xác thực quyền Admin...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 shadow-xl text-center p-6">
          <CardContent className="space-y-4 pt-4">
            <div className="mx-auto size-16 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="size-8" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground">Truy cập bị từ chối (403 Forbidden)</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Phân hệ này dành riêng cho tài khoản có quyền <strong className="text-rose-600 dark:text-rose-400">Admin</strong> (Role: <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">"Admin"</code>).
              Tài khoản hiện tại của bạn không đủ quyền truy cập.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                onClick={() => navigate({ to: "/auth", search: { redirect: "/admin/dashboard" } as never })}
                className="w-full font-bold gap-2"
              >
                <LogIn className="size-4" /> Đăng nhập tài khoản Admin
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: "/" })} className="w-full">
                Về trang chủ bán hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/20 font-sans antialiased text-foreground">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="GymKitten Admin CMS Portal" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
