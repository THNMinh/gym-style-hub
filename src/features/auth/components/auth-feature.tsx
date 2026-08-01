import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { login, register } from "@/entities/identity/services";
import { useAuthStore } from "../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AuthFeature() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });

  const mutation = useMutation({
    mutationFn: () =>
      mode === "login"
        ? login({ email: form.email, password: form.password })
        : register({ email: form.email, password: form.password, fullName: form.fullName }),
    onSuccess: (user) => {
      setUser(user);
      toast.success(mode === "login" ? "Đăng nhập thành công" : "Tạo tài khoản thành công");
      navigate({ to: "/account" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="mb-8 flex">
        {(["login", "register"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={cn(
              "eyebrow flex-1 border-b-2 pb-3",
              mode === value ? "border-primary" : "border-border text-muted-foreground",
            )}
          >
            {value === "login" ? "Đăng nhập" : "Đăng ký"}
          </button>
        ))}
      </div>

      <h1 className="text-3xl">{mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản"}</h1>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        {mode === "register" ? (
          <div>
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input
              id="fullName"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
        ) : null}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </Button>
      </form>

      <p className="mt-6 text-xs text-muted-foreground">
        Bản demo dùng dữ liệu mock: nhập email bất kỳ và mật khẩu từ 6 ký tự.
      </p>
    </div>
  );
}
