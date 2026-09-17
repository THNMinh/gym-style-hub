import { useNavigate } from "@tanstack/react-router";
import { Shield, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { parseJwtPayload } from "@/entities/identity/jwt";
import { Button } from "@/components/ui/button";

export function AdminReturnBar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const payload = accessToken ? parseJwtPayload(accessToken) : null;
  const tokenRole =
    payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    payload?.["role"] ||
    payload?.["Role"];

  const isAdmin = Boolean(
    accessToken &&
      (user?.role === "Admin" ||
        user?.role?.toLowerCase() === "admin" ||
        String(tokenRole).toLowerCase() === "admin")
  );

  if (!isAdmin) return null;

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 flex items-center justify-between shadow-md border-b border-slate-700 font-medium z-50 sticky top-0">
      <div className="flex items-center gap-2">
        <Shield className="size-4 text-emerald-400 shrink-0" />
        <span>
          Bạn đang xem thử <strong>Giao diện Khách hàng (Client Storefront)</strong> với tài khoản Admin.
        </span>
      </div>
      <Button
        size="sm"
        onClick={() => navigate({ to: "/admin/dashboard" })}
        className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 gap-1.5 text-xs shadow-sm cursor-pointer shrink-0"
      >
        <ArrowLeft className="size-3.5" /> Quay lại Admin CMS
      </Button>
    </div>
  );
}
