/**
 * LoginPage.jsx
 * Trang đăng nhập — Route: /login
 *
 * Luồng:
 *  1. Hiển thị form gồm 2 trường: identifier (email/username) và password.
 *  2. Validate phía client bằng Zod schema (loginSchema).
 *  3. Gọi API POST /auth/login qua useLogin mutation.
 *  4. Lưu accessToken → Zustand, refreshToken → localStorage.
 *  5. Redirect về "/" (RoleBasedDashboard tự điều hướng theo role).
 *
 * Tính năng Pre-fill:
 *  - Nếu được điều hướng từ RegisterPage thành công, state sẽ chứa
 *    { prefillIdentifier: "username_vừa_tạo" } → tự động điền vào ô identifier.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 8.1 (LoginPage).
 */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "react-router";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";

import { loginSchema } from "#/utils/validators";
import { useLogin } from "#/hooks/useAuth";
import Input from "#/components/ui/Input";
import Button from "#/components/ui/Button";

export default function LoginPage() {
  const location = useLocation();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  // Lấy identifier được truyền từ RegisterPage (nếu có)
  const prefillIdentifier = location.state?.prefillIdentifier || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: prefillIdentifier,
      password: "",
    },
  });

  // Pre-fill khi navigate state thay đổi (ví dụ: từ RegisterPage redirect sang)
  useEffect(() => {
    if (prefillIdentifier) {
      setValue("identifier", prefillIdentifier);
    }
  }, [prefillIdentifier, setValue]);

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-student/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-student/5 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-student/10 mb-4">
              <BookOpen className="w-7 h-7 text-brand-student" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              Đăng nhập StudyHub
            </h1>
            <p className="text-text-secondary text-sm mt-1.5">
              Nền tảng chia sẻ tài nguyên học tập
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Identifier */}
            <Input
              label="Email hoặc Tên đăng nhập"
              placeholder="Nhập email hoặc username"
              icon={Mail}
              required
              autoComplete="username"
              error={errors.identifier}
              {...register("identifier")}
            />

            {/* Password */}
            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              type={showPassword ? "text" : "password"}
              icon={Lock}
              required
              autoComplete="current-password"
              error={errors.password}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              {...register("password")}
            />

            {/* Server-side error */}
            {loginMutation.isError && (
              <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                {[400, 401, 404].includes(loginMutation.error?.response?.status)
                  ? "Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."
                  : loginMutation.error?.response?.data?.message ||
                    "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              loading={loginMutation.isPending}
              className="w-full mt-2"
              size="lg"
            >
              Đăng nhập
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-text-muted">
                Chưa có tài khoản?
              </span>
            </div>
          </div>

          {/* Register link */}
          <Link
            to="/register"
            className="block w-full text-center py-2.5 text-sm font-medium text-brand-student hover:text-brand-student-dark border border-brand-student/20 rounded-xl hover:bg-brand-student-light/50 transition-all duration-200"
          >
            Tạo tài khoản mới
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          © 2026 StudyHub — CMC University
        </p>
      </div>
    </div>
  );
}
