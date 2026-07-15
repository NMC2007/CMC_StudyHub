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
import { BookOpen, Mail, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";

import { loginSchema } from "#/utils/validators";
import { useLogin } from "#/hooks/useAuth";
import Input from "#/components/ui/Input";
import Button from "#/components/ui/Button";
import Modal from "#/components/ui/Modal";

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

  const [statusAlertModal, setStatusAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // Kiểm tra lỗi 403 (Tài khoản bị khóa hoặc tạm ngừng hoạt động) để hiển thị Modal
  useEffect(() => {
    if (loginMutation.isError) {
      const status = loginMutation.error?.response?.status;
      const msg = loginMutation.error?.response?.data?.message;
      const errorsList = loginMutation.error?.response?.data?.errors || [];

      if (
        status === 403 ||
        msg === "Tài khoản đã bị khóa" ||
        msg === "Tài khoản đang tạm ngừng hoạt động"
      ) {
        setStatusAlertModal({
          isOpen: true,
          title: "Không thể truy cập hệ thống",
          message:
            msg ||
            errorsList[0] ||
            "Tài khoản của bạn hiện không được phép hoạt động trên hệ thống.",
        });
      }
    }
  }, [loginMutation.isError, loginMutation.error]);

  const handleCloseStatusModal = () => {
    setStatusAlertModal({ isOpen: false, title: "", message: "" });
    loginMutation.reset();
  };

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
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <img
                src="/favicon.svg"
                alt="StudyHub Logo"
                className="w-full h-full object-contain"
              />
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
            {loginMutation.isError &&
              loginMutation.error?.response?.status !== 403 && (
                <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                  {[400, 401, 404].includes(
                    loginMutation.error?.response?.status,
                  )
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

      {/* Modal thông báo khi tài khoản bị khóa hoặc tạm ngưng */}
      <Modal
        isOpen={statusAlertModal.isOpen}
        onClose={handleCloseStatusModal}
        title={statusAlertModal.title}
        icon={ShieldAlert}
        size="sm"
        closeOnBackdrop={true}
        footer={
          <Button
            type="button"
            variant="primary"
            onClick={handleCloseStatusModal}
            className="w-full sm:w-auto min-w-[120px] bg-red-600 hover:bg-red-700 text-white border-transparent"
          >
            Đã hiểu
          </Button>
        }
      >
        <div className="flex flex-col gap-3.5 py-1">
          <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl text-red-700 font-semibold text-sm flex items-start gap-3 shadow-2xs">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{statusAlertModal.message}</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            Vui lòng liên hệ trực tiếp với Quản trị viên (Admin) hoặc phòng Công
            tác Sinh viên của Nhà trường để được kiểm tra lý do và hỗ trợ giải
            quyết vấn đề về tài khoản của bạn.
          </p>
        </div>
      </Modal>
    </div>
  );
}
