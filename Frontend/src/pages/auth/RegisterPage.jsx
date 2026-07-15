/**
 * RegisterPage.jsx
 * Trang đăng ký — Route: /register
 *
 * Luồng đa bước (Multi-step Form):
 *  - Step 1: Thông tin cá nhân cơ bản + Chọn vai trò (STUDENT / LECTURER).
 *  - Step 2: Thông tin học thuật (Dynamic theo Role):
 *      • STUDENT: Cascade Select Khóa → Khoa → Ngành (bắt buộc cả 3).
 *      • LECTURER: Chỉ chọn Khoa.
 *
 * Sau khi đăng ký thành công:
 *  - Redirect về /login kèm state { prefillIdentifier } để tự điền sẵn username/email.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 8.2 (RegisterPage) + validators.js schemas.
 */
import { useState, useEffect, useRef, forwardRef } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import {
  BookOpen,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  UserCheck,
  Hash,
} from "lucide-react";

import {
  registerStep1Schema,
  registerStep2StudentSchema,
  registerStep2LecturerSchema,
} from "#/utils/validators";
import { useRegister } from "#/hooks/useAuth";
import CascadeSelect from "#/components/academic/CascadeSelect";
import Input from "#/components/ui/Input";
import Button from "#/components/ui/Button";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ref tham chiếu tới hàm setError của Step1Form để gọi từ bên ngoài
  const step1SetErrorRef = React.useRef(null);

  const registerMutation = useRegister();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-student/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-lecturer/5 blur-3xl" />
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-lg">
        <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-student/10 mb-4">
              <BookOpen className="w-7 h-7 text-brand-student" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              Tạo tài khoản StudyHub
            </h1>
            <p className="text-text-secondary text-sm mt-1.5">
              {currentStep === 1
                ? "Nhập thông tin cá nhân cơ bản"
                : "Chọn thông tin học thuật"}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <StepIndicator
              step={1}
              currentStep={currentStep}
              label="Thông tin"
            />
            <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-student rounded-full transition-all duration-500"
                style={{ width: currentStep >= 2 ? "100%" : "0%" }}
              />
            </div>
            <StepIndicator
              step={2}
              currentStep={currentStep}
              label="Học thuật"
            />
          </div>

          {/* Step Content */}
          {/* Step 1 Form (luôn mounted với hidden/block để giữ ref setError và form state) */}
          <div className={currentStep === 1 ? "block" : "hidden"}>
            <Step1Form
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              onNext={(data) => {
                setStep1Data(data);
                setCurrentStep(2);
              }}
              defaultValues={step1Data}
              onSetErrorReady={(fn) => {
                step1SetErrorRef.current = fn;
              }}
            />
          </div>

          {/* Step 2 Form */}
          {currentStep === 2 && (
            <Step2Form
              role={step1Data?.role}
              onBack={() => setCurrentStep(1)}
              onSubmit={(step2Data) => {
                // Gộp dữ liệu Step 1 + Step 2 rồi loại bỏ confirm_password trước khi gửi API
                const fullData = { ...step1Data, ...step2Data };
                const { confirm_password, ...payload } = fullData;
                registerMutation.mutate(payload, {
                  onError: (error) => {
                    const status = error.response?.status;
                    const errors = error.response?.data?.errors || [];
                    const message =
                      error.response?.data?.message ||
                      "Đăng ký thất bại. Vui lòng thử lại.";

                    // Ưu tiên mảng errors chi tiết từ server, nếu không có mới dùng message
                    const errorList = errors.length > 0 ? errors : [message];

                    // Kiểm tra lỗi 400 hoặc 409 (Conflict - Trùng lặp email/username/phone/password...)
                    if ([400, 409].includes(status) && errorList.length > 0) {
                      let hasStep1Error = false;
                      const setError = step1SetErrorRef.current;

                      if (setError) {
                        errorList.forEach((msg) => {
                          if (/code|mã số|mã định danh/i.test(msg)) {
                            setError("code", {
                              type: "manual",
                              message: msg,
                            });
                            hasStep1Error = true;
                          }
                          if (/username|tên đăng nhập/i.test(msg)) {
                            setError("username", {
                              type: "manual",
                              message: msg,
                            });
                            hasStep1Error = true;
                          }
                          if (/email/i.test(msg)) {
                            setError("email", {
                              type: "manual",
                              message: msg,
                            });
                            hasStep1Error = true;
                          }
                          if (/phone|điện thoại|số điện thoại/i.test(msg)) {
                            setError("phone", { type: "manual", message: msg });
                            hasStep1Error = true;
                          }
                          if (/password|mật khẩu/i.test(msg)) {
                            setError("password", {
                              type: "manual",
                              message: msg,
                            });
                            hasStep1Error = true;
                          }
                          if (/full_name|họ và tên|họ tên/i.test(msg)) {
                            setError("full_name", {
                              type: "manual",
                              message: msg,
                            });
                            hasStep1Error = true;
                          }
                          if (/dob|ngày sinh/i.test(msg)) {
                            setError("dob", {
                              type: "manual",
                              message: msg,
                            });
                            hasStep1Error = true;
                          }
                          if (/role|vai trò/i.test(msg)) {
                            setError("role", {
                              type: "manual",
                              message: msg,
                            });
                            hasStep1Error = true;
                          }
                        });
                      }

                      // Nếu là lỗi 409 (Trùng lặp) hoặc có lỗi thuộc về ô input của Step 1 -> Lùi về Step 1
                      if (status === 409 || hasStep1Error) {
                        setCurrentStep(1);
                      }
                    }
                  },
                });
              }}
              isPending={registerMutation.isPending}
            />
          )}

          {/* Divider + Login link */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-text-muted">
                Đã có tài khoản?
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="block w-full text-center py-2.5 text-sm font-medium text-brand-student hover:text-brand-student-dark border border-brand-student/20 rounded-xl hover:bg-brand-student-light/50 transition-all duration-200"
          >
            Đăng nhập
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

// ─── Step Indicator Component ─────────────────────────────────────────────────

function StepIndicator({ step, currentStep, label }) {
  const isActive = currentStep >= step;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
          isActive
            ? "bg-brand-student text-white shadow-sm"
            : "bg-slate-100 text-slate-400 border border-slate-200"
        }`}
      >
        {step}
      </div>
      <span
        className={`text-[10px] font-medium ${
          isActive ? "text-brand-student" : "text-text-muted"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Step 1: Thông tin cá nhân ────────────────────────────────────────────────

function Step1Form({
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onNext,
  defaultValues,
  onSetErrorReady,
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: defaultValues || {
      full_name: "",
      username: "",
      code: "",
      email: "",
      phone: "",
      dob: "",
      password: "",
      confirm_password: "",
      role: "",
    },
  });

  // Đăng ký hàm setError lên parent để xử lý lỗi từ Server (400) trả về sau khi submit Step 2
  useEffect(() => {
    if (onSetErrorReady) onSetErrorReady(setError);
  }, [onSetErrorReady, setError]);

  const codeValue = watch("code");
  const prevCodeRef = useRef(defaultValues?.code || "");

  // Tự động điền/cập nhật email khi nhập mã code theo định dạng code@st.cmcu.edu.vn
  useEffect(() => {
    if (codeValue === prevCodeRef.current) return;
    prevCodeRef.current = codeValue;

    if (codeValue !== undefined && codeValue.trim().length > 0) {
      const cleanCode = codeValue.trim().toLowerCase();
      setValue("email", `${cleanCode}@st.cmcu.edu.vn`, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue("email", "", {
        shouldValidate: false,
        shouldDirty: true,
      });
      clearErrors("email");
    }
  }, [codeValue, setValue, clearErrors]);

  const selectedRole = watch("role");

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-3.5">
      {/* Full name */}
      <Input
        label="Họ và tên"
        placeholder="Nguyễn Văn A"
        icon={User}
        required
        autoComplete="name"
        error={errors.full_name}
        {...register("full_name")}
      />

      {/* Username */}
      <Input
        label="Tên đăng nhập"
        placeholder="nguyenvana"
        icon={UserCheck}
        required
        autoComplete="username"
        helperText="Chỉ chứa chữ cái, số và dấu gạch dưới"
        error={errors.username}
        {...register("username")}
      />

      {/* Code (MSSV/MSGV) */}
      <Input
        label="Mã định danh (MSSV/MSGV)"
        placeholder="Ví dụ: BIT250052"
        icon={Hash}
        required
        autoComplete="off"
        helperText="Mã sinh viên hoặc mã giảng viên của bạn"
        error={errors.code}
        {...register("code", {
          onChange: (e) => {
            e.target.value = e.target.value.toUpperCase();
          },
        })}
      />

      {/* Email */}
      <Input
        label="Email"
        placeholder="email@example.com"
        type="email"
        icon={Mail}
        required
        autoComplete="email"
        error={errors.email}
        {...register("email")}
      />

      {/* 2 columns: Phone + DOB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Số điện thoại"
          placeholder="0901234567"
          icon={Phone}
          required
          autoComplete="tel"
          error={errors.phone}
          {...register("phone")}
        />
        <Input
          label="Ngày sinh"
          type="date"
          icon={Calendar}
          required
          error={errors.dob}
          {...register("dob")}
        />
      </div>

      {/* Password */}
      <Input
        label="Mật khẩu"
        placeholder="Tối thiểu 6 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt"
        type={showPassword ? "text" : "password"}
        icon={Lock}
        required
        autoComplete="new-password"
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

      {/* Confirm Password */}
      <Input
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu phía trên"
        type={showConfirmPassword ? "text" : "password"}
        icon={Lock}
        required
        autoComplete="new-password"
        error={errors.confirm_password}
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
        {...register("confirm_password")}
      />

      {/* Role selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          Vai trò <span className="text-red-500 font-bold">*</span>
        </span>
        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            role="STUDENT"
            icon={GraduationCap}
            label="Sinh viên"
            description="Upload theo Khóa/Khoa/Ngành"
            isSelected={selectedRole === "STUDENT"}
            {...register("role")}
          />
          <RoleCard
            role="LECTURER"
            icon={BookOpen}
            label="Giảng viên"
            description="Upload không giới hạn"
            isSelected={selectedRole === "LECTURER"}
            {...register("role")}
          />
        </div>
        {errors.role && (
          <p className="text-xs text-red-500 font-medium mt-0.5">
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Next step button */}
      <Button type="submit" icon={ArrowRight} className="w-full mt-2" size="lg">
        Tiếp tục
      </Button>
    </form>
  );
}

// ─── Role Card (Radio Button Style) ──────────────────────────────────────────

const RoleCard = forwardRef(
  ({ role, icon: Icon, label, description, isSelected, ...restProps }, ref) => {
    return (
      <label
        className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
          isSelected
            ? "border-brand-student bg-brand-student-light/30 shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <input
          type="radio"
          value={role}
          ref={ref}
          className="sr-only"
          {...restProps}
        />
        <Icon
          className={`w-6 h-6 ${
            isSelected ? "text-brand-student" : "text-slate-400"
          }`}
        />
        <span
          className={`text-sm font-semibold ${
            isSelected ? "text-brand-student-dark" : "text-slate-600"
          }`}
        >
          {label}
        </span>
        <span className="text-[10px] text-text-muted text-center leading-tight">
          {description}
        </span>
      </label>
    );
  },
);
RoleCard.displayName = "RoleCard";

function Step2Form({ role, onBack, onSubmit, isPending }) {
  const isStudent = role === "STUDENT";
  const schema = isStudent
    ? registerStep2StudentSchema
    : registerStep2LecturerSchema;

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isStudent
      ? { cohort_code: "", faculty_code: "", major_code: "" }
      : { faculty_code: "" },
  });

  const values = {
    cohort_code: watch("cohort_code") || "",
    faculty_code: watch("faculty_code") || "",
    major_code: watch("major_code") || "",
  };

  const handleCascadeChange = (newVals) => {
    setValue("cohort_code", newVals.cohort_code || "", {
      shouldValidate: true,
    });
    setValue("faculty_code", newVals.faculty_code || "", {
      shouldValidate: true,
    });
    setValue("major_code", newVals.major_code || "", { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Section title */}
      <div className="flex items-center gap-2 mb-1">
        <GraduationCap className="w-5 h-5 text-brand-student" />
        <span className="text-sm font-semibold text-text-primary">
          {isStudent
            ? "Thông tin học thuật — Sinh viên"
            : "Thông tin học thuật — Giảng viên"}
        </span>
      </div>

      {/* CascadeSelect tái sử dụng */}
      <CascadeSelect
        mode={isStudent ? "STUDENT_REGISTER" : "LECTURER_REGISTER"}
        values={values}
        onChange={handleCascadeChange}
        errors={errors}
        required
      />

      {/* Action Buttons */}
      <div className="flex gap-3 mt-2">
        <Button
          type="button"
          variant="secondary"
          icon={ArrowLeft}
          onClick={onBack}
          className="flex-1"
          size="lg"
        >
          Quay lại
        </Button>
        <Button type="submit" loading={isPending} className="flex-1" size="lg">
          Đăng ký
        </Button>
      </div>
    </form>
  );
}
