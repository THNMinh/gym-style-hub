import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  login,
  register,
  verifyEmail,
  resendOtp,
  forgotPassword,
} from "@/entities/identity/services";
import { parseUserFromToken } from "@/entities/identity/jwt";
import { useAuthStore } from "../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { Mail, Lock, User, ArrowLeft, RefreshCw, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";

export function AuthFeature() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);

  // Extract optional search params (e.g. ?redirect=/checkout, ?mode=verify-otp, ?email=...)
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get("redirect");
  const initialMode = (searchParams.get("mode") as "login" | "register" | "verify-otp" | "forgot-password") || "login";
  const initialEmail = searchParams.get("email") || "";

  const [mode, setMode] = useState<"login" | "register" | "verify-otp" | "forgot-password">(initialMode);
  
  // Form states
  const [form, setForm] = useState({
    fullName: "",
    email: initialEmail,
    password: "",
    confirmPassword: "",
  });

  // OTP state
  const [targetEmail, setTargetEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === "verify-otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [mode, countdown]);

  // Helper redirect
  const handleAuthSuccess = (accessToken: string, refreshToken: string, userEmail: string) => {
    const user = parseUserFromToken(accessToken, userEmail);
    setSession({
      user,
      accessToken,
      refreshToken,
    });

    const isAdmin = Boolean(
      user?.role === "Admin" ||
      user?.role?.toLowerCase() === "admin"
    );

    if (redirectUrl) {
      if (redirectUrl.startsWith("/admin") && !isAdmin) {
        navigate({ to: "/account" });
      } else {
        navigate({ to: redirectUrl as any });
      }
    } else if (isAdmin) {
      navigate({ to: "/admin/dashboard" });
    } else {
      navigate({ to: "/account" });
    }
  };

  // 1. Login Mutation
  const loginMutation = useMutation({
    mutationFn: () => login({ email: form.email.trim(), password: form.password }),
    onSuccess: (tokens) => {
      toast.success("Đăng nhập thành công!");
      handleAuthSuccess(tokens.accessToken, tokens.refreshToken, form.email.trim());
    },
    onError: (error: any) => {
      const errCode = error?.code || error?.data?.errors?.[0]?.code;
      const errMsg = error?.message || "Đăng nhập thất bại.";

      // Bắt lỗi tài khoản chưa kích hoạt email theo chuẩn Backend
      if (
        errCode === "Auth.EmailNotVerified" ||
        errMsg.toLowerCase().includes("not been verified") ||
        errMsg.toLowerCase().includes("chưa được kích hoạt")
      ) {
        toast.warning("Tài khoản chưa xác thực email. Vui lòng nhập mã OTP để kích hoạt tài khoản.");
        setTargetEmail(form.email.trim());
        setCountdown(60);
        setOtpCode("");
        setMode("verify-otp");
        return;
      }

      toast.error(errMsg);
    },
  });

  // 2. Register Mutation
  const registerMutation = useMutation({
    mutationFn: () => {
      if (form.password !== form.confirmPassword) {
        throw new Error("Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!");
      }
      return register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    },
    onSuccess: () => {
      toast.success("Đăng ký thành công! Mã OTP xác thực đã được gửi tới email của bạn.");
      setTargetEmail(form.email.trim());
      setCountdown(60);
      setOtpCode("");
      setMode("verify-otp");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Đăng ký thất bại.");
    },
  });

  // 3. Verify Email OTP Mutation
  const verifyEmailMutation = useMutation({
    mutationFn: () => {
      if (otpCode.length !== 6) {
        throw new Error("Vui lòng nhập đủ 6 chữ số mã OTP.");
      }
      return verifyEmail({
        email: targetEmail.trim(),
        otpCode: otpCode.trim(),
      });
    },
    onSuccess: (tokens) => {
      toast.success("Kích hoạt tài khoản & Đăng nhập thành công!");
      handleAuthSuccess(tokens.accessToken, tokens.refreshToken, targetEmail.trim());
    },
    onError: (error: any) => {
      const errCode = error?.code || error?.data?.errors?.[0]?.code;
      if (errCode === "Auth.WrongOtp") {
        toast.error("Mã OTP không chính xác. Vui lòng kiểm tra lại!");
      } else if (errCode === "Auth.OtpExpired") {
        toast.error("Mã OTP đã hết hạn (quá 5 phút). Vui lòng bấm 'Gửi lại mã OTP'.");
      } else {
        toast.error(error?.message || "Xác thực mã OTP thất bại.");
      }
    },
  });

  // 4. Resend OTP Mutation
  const resendOtpMutation = useMutation({
    mutationFn: () => resendOtp({ email: targetEmail.trim() }),
    onSuccess: () => {
      toast.success("Đã gửi lại mã OTP mới tới email của bạn!");
      setCountdown(60);
      setOtpCode("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể gửi lại mã OTP lúc này.");
    },
  });

  // 5. Forgot Password Mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: () => {
      if (!forgotEmail.trim()) {
        throw new Error("Vui lòng nhập địa chỉ email của bạn.");
      }
      return forgotPassword({ email: forgotEmail.trim() });
    },
    onSuccess: () => {
      setForgotSent(true);
      toast.success("Mật khẩu mới đã được gửi về email!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Không thể yêu cầu mật khẩu mới.");
    },
  });

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      {/* View 1: Login & Register Tabs */}
      {(mode === "login" || mode === "register") && (
        <div className="space-y-6">
          <div className="flex border-b border-border">
            {(["login", "register"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={cn(
                  "flex-1 pb-3 text-sm font-bold transition-colors cursor-pointer text-center",
                  mode === value
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {mode === "login" ? "Chào mừng bạn trở lại" : "Tạo tài khoản GymKitten"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              {mode === "login"
                ? "Đăng nhập để theo dõi đơn hàng, lưu yêu thích và nhận ưu đãi."
                : "Đăng ký thành viên để nhận ngay các đặc quyền mua sắm cao cấp."}
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (mode === "login") {
                loginMutation.mutate();
              } else {
                registerMutation.mutate();
              }
            }}
          >
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold">
                  Họ và tên <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    required
                    placeholder="Nguyễn Văn A"
                    className="pl-9 text-xs font-medium"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Địa chỉ Email <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="pl-9 text-xs font-medium"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Mật khẩu <span className="text-rose-500">*</span>
                </Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(form.email);
                      setForgotSent(false);
                      setMode("forgot-password");
                    }}
                    className="text-xs text-primary hover:underline font-medium cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10 pointer-events-none" />
                <PasswordInput
                  id="password"
                  required
                  minLength={8}
                  placeholder="Tối thiểu 8 ký tự"
                  className="pl-9 text-xs font-medium"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            {/* Nhập lại mật khẩu (Chỉ ở giao diện đăng ký) */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                  Nhập lại mật khẩu <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10 pointer-events-none" />
                  <PasswordInput
                    id="confirmPassword"
                    required
                    minLength={8}
                    placeholder="Nhập lại mật khẩu để xác nhận"
                    className={cn(
                      "pl-9 text-xs font-medium",
                      form.confirmPassword && form.password !== form.confirmPassword && "border-rose-500 focus-visible:ring-rose-500"
                    )}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    Mật khẩu nhập lại chưa khớp!
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-bold h-10 text-xs shadow-md mt-2"
              disabled={
                mode === "login"
                  ? loginMutation.isPending
                  : registerMutation.isPending || (form.confirmPassword.length > 0 && form.password !== form.confirmPassword)
              }
            >
              {loginMutation.isPending || registerMutation.isPending
                ? "Đang xử lý..."
                : mode === "login"
                ? "Đăng nhập"
                : "Tạo tài khoản"}
            </Button>
          </form>

          {mode === "register" && (
            <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1 border border-border/50">
              <p className="font-semibold text-foreground">Yêu cầu bảo mật mật khẩu:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Độ dài tối thiểu 8 ký tự.</li>
                <li>Bao gồm chữ hoa, chữ thường và chữ số.</li>
                <li>Sau khi đăng ký, hệ thống sẽ gửi mã OTP 6 số tới email để xác thực.</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* View 2: OTP Verification Screen */}
      {mode === "verify-otp" && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> Quay lại đăng nhập
          </button>

          <div className="text-center space-y-2">
            <div className="mx-auto size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="size-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Xác Thực Tài Khoản 🐱</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mã xác thực 6 chữ số đã được gửi tới email: <br />
              <strong className="text-foreground font-semibold font-mono">{targetEmail}</strong>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 pt-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              Nhập mã OTP 6 số (hiệu lực 5 phút):
            </Label>
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={(val) => setOtpCode(val)}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="size-11 text-lg font-bold border-2 rounded-md" />
                <InputOTPSlot index={1} className="size-11 text-lg font-bold border-2 rounded-md" />
                <InputOTPSlot index={2} className="size-11 text-lg font-bold border-2 rounded-md" />
                <InputOTPSlot index={3} className="size-11 text-lg font-bold border-2 rounded-md" />
                <InputOTPSlot index={4} className="size-11 text-lg font-bold border-2 rounded-md" />
                <InputOTPSlot index={5} className="size-11 text-lg font-bold border-2 rounded-md" />
              </InputOTPGroup>
            </InputOTP>

            <Button
              type="button"
              onClick={() => verifyEmailMutation.mutate()}
              disabled={otpCode.length !== 6 || verifyEmailMutation.isPending}
              className="w-full h-10 text-xs font-bold shadow-md mt-2"
            >
              {verifyEmailMutation.isPending ? "Đang xác thực..." : "Kích Hoạt Tài Khoản"}
            </Button>

            <div className="flex items-center justify-center text-xs text-muted-foreground pt-2">
              Chưa nhận được mã?&nbsp;
              {countdown > 0 ? (
                <span className="font-semibold text-muted-foreground">
                  Gửi lại sau <span className="font-mono text-primary font-bold">{countdown}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => resendOtpMutation.mutate()}
                  disabled={resendOtpMutation.isPending}
                  className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={cn("size-3", resendOtpMutation.isPending && "animate-spin")} />
                  {resendOtpMutation.isPending ? "Đang gửi..." : "Gửi lại mã OTP mới"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View 3: Forgot Password Screen */}
      {mode === "forgot-password" && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
          >
            <ArrowLeft className="size-3.5" /> Quay lại đăng nhập
          </button>

          <div className="text-center space-y-2">
            <div className="mx-auto size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="size-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Quên Mật Khẩu 🔑</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nhập email đã đăng ký của bạn. Hệ thống sẽ tự động tạo mật khẩu tạm thời mới và gửi về hộp thư.
            </p>
          </div>

          {forgotSent ? (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 p-5 text-center space-y-3">
              <CheckCircle2 className="size-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm text-foreground">Mật khẩu mới đã được gửi!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vui lòng kiểm tra hộp thư email <strong className="text-foreground">{forgotEmail}</strong> (cả thư mục Spam nếu không thấy trong Hộp thư đến) và sử dụng mật khẩu mới để đăng nhập.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setForm({ ...form, email: forgotEmail, password: "" });
                  setMode("login");
                }}
                className="w-full text-xs font-bold mt-2"
              >
                Đăng nhập ngay
              </Button>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                forgotPasswordMutation.mutate();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-semibold">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="pl-9 text-xs font-medium"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full font-bold h-10 text-xs shadow-md mt-2"
              >
                {forgotPasswordMutation.isPending ? "Đang gửi email..." : "Gửi Mật Khẩu Mới"}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
