import { useAuthStore } from "@/features/auth/store";
import { User, Bell, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminHeader({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-16 bg-background border-b border-border/80 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Thông báo"
          className="relative p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
        >
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
        </button>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center font-bold text-xs">
            {user?.fullName?.charAt(0) || "A"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-foreground leading-none">
                {user?.fullName || "Admin System"}
              </p>
              <Badge variant="outline" className="text-[10px] h-4 px-1 border-emerald-500/50 text-emerald-600 font-bold">
                <ShieldCheck className="size-3 mr-0.5" /> Admin
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{user?.email || "admin@gymkitten.vn"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
