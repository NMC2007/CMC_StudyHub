/**
 * RegisterPage.jsx
 * Trang đăng ký — Route: /register
 *
 * Luồng đa bước (Multi-step Form):
 *  - Step 1: Thông tin cá nhân cơ bản + Chọn vai trò (STUDENT / LECTURER).
 *  - Step 2: Thông tin học thuật (Dynamic theo Role):
 *      • STUDENT: Cascade Select Khóa → Khoa → Ngành (bắt buộc cả 3).
 *      • LECTURER: Chỉ chọn Khoa.
 *  - Step 3: Xác thực Email bằng mã OTP 6 chữ số.
 *
 * Sau khi đăng ký thành công:
 *  - Redirect về /login kèm state { prefillIdentifier } để tự điền sẵn username/email.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 8.2 (RegisterPage) + validators.js schemas.
 */
import { useState, useEffect, useRef, forwardRef, useCallback } from "react";
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
  ShieldCheck,
  RefreshCw,
  Loader2,
} from "lucide-react";

import {
  registerStep1Schema,
  registerStep2StudentSchema,
  registerStep2LecturerSchema,
} from "#/utils/validators";
import { useRegister } from "#/hooks/useAuth";
import { sendOtp as sendOtpApi } from "#/api/authApi";
import CascadeSelect from "#/components/academic/CascadeSelect";
import Input from "#/components/ui/Input";
import Button from "#/components/ui/Button";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dữ liệu đầy đủ (Step1 + Step2) để gửi khi xác nhận OTP
  const [fullPayload, setFullPayload] = useState(null);

  // Trạng thái OTP
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [sendOtpError, setSendOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // ref tham chiếu tới hàm setError của Step1Form để gọi từ bên ngoài
  const step1SetErrorRef = React.useRef(null);

  const registerMutation = useRegister();

  // Đếm ngược cooldown gửi lại OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Hàm gọi API gửi OTP
  const handleSendOtp = useCallback(
    async (payload) => {
      setSendingOtp(true);
      setSendOtpError("");
      try {
        await sendOtpApi({
          email: payload.email,
          code: payload.code,
          username: payload.username,
          phone: payload.phone,
          full_name: payload.full_name,
        });
        setFullPayload(payload);
        setCurrentStep(3);
        setResendCooldown(60);
        setOtpValue("");
        setOtpError("");
      } catch (error) {
        const status = error.response?.status;
        const errors = error.response?.data?.errors || [];
        const message =
          error.response?.data?.message || "Không thể gửi mã xác thực.";

        // Nếu lỗi trùng lặp (409), quay về Step 1 để hiển thị lỗi
        if (status === 409) {
          const setError = step1SetErrorRef.current;
          const errorList = errors.length > 0 ? errors : [message];
          if (setError) {
            errorList.forEach((msg) => {
              if (/code|mã số|mã định danh|mã người dùng/i.test(msg)) {
                setError("code", { type: "manual", message: msg });
              }
              if (/username|tên đăng nhập/i.test(msg)) {
                setError("username", { type: "manual", message: msg });
              }
              if (/email/i.test(msg)) {
                setError("email", { type: "manual", message: msg });
              }
              if (/phone|điện thoại/i.test(msg)) {
                setError("phone", { type: "manual", message: msg });
              }
            });
          }
          setCurrentStep(1);
        } else {
          setSendOtpError(message);
        }
      } finally {
        setSendingOtp(false);
      }
    },
    [step1SetErrorRef]
  );

  // Hàm gửi lại OTP
  const handleResendOtp = useCallback(() => {
    if (resendCooldown > 0 || !fullPayload) return;
    handleSendOtp(fullPayload);
  }, [resendCooldown, fullPayload, handleSendOtp]);

  // Hàm xác nhận OTP + đăng ký
  const handleConfirmOtp = useCallback(() => {
    const trimmedOtp = otpValue.trim();
    if (trimmedOtp.length !== 6 || !/^\d{6}$/.test(trimmedOtp)) {
      setOtpError("Mã OTP phải gồm đúng 6 chữ số.");
      return;
    }
    setOtpError("");

    const { confirm_password, ...payloadWithoutConfirm } = fullPayload;
    registerMutation.mutate(
      { ...payloadWithoutConfirm, otp: trimmedOtp },
      {
        onError: (error) => {
          const message =
            error.response?.data?.message || "Đăng ký thất bại.";
          const errors = error.response?.data?.errors || [];
          if (errors.some((e) => /otp/i.test(e))) {
            setOtpError(message);
          } else {
            setOtpError(message);
          }
        },
      }
    );
  }, [otpValue, fullPayload, registerMutation]);

  // Xác định subtitle theo step
  const stepSubtitle = {
    1: "Nhập thông tin cá nhân cơ bản",
    2: "Chọn thông tin học thuật",
    3: "Xác thực Email trước khi hoàn tất",
  };

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
              {stepSubtitle[currentStep]}
            </p>
          </div>

          {/* Step indicator (3 bước) */}
          <div className="flex items-center gap-2 mb-6">
            <StepIndicator step={1} currentStep={currentStep} label="Thông tin" />
            <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-student rounded-full transition-all duration-500"
                style={{ width: currentStep >= 2 ? "100%" : "0%" }}
              />
            </div>
            <StepIndicator step={2} currentStep={currentStep} label="Học thuật" />
            <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-student rounded-full transition-all duration-500"
                style={{ width: currentStep >= 3 ? "100%" : "0%" }}
              />
            </div>
            <StepIndicator step={3} currentStep={currentStep} label="Xác thực" />
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
                // Gộp Step 1 + Step 2 rồi gọi send-otp
                const mergedData = { ...step1Data, ...step2Data };
                handleSendOtp(mergedData);
              }}
              isPending={sendingOtp}
              submitLabel="Gửi mã xác thực Email"
              submitIcon={Mail}
            />
          )}

          {/* Step 3: OTP Verification */}
          {currentStep === 3 && (
            <Step3OtpForm
              email={fullPayload?.email}
              otpValue={otpValue}
              setOtpValue={setOtpValue}
              otpError={otpError}
              sendOtpError={sendOtpError}
              resendCooldown={resendCooldown}
              onResend={handleResendOtp}
              onConfirm={handleConfirmOtp}
              onBack={() => setCurrentStep(2)}
              isPending={registerMutation.isPending}
              sendingOtp={sendingOtp}
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
    trigger,
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
  const selectedRole = watch("role");
  const prevCodeRef = useRef(defaultValues?.code || "");
  const prevRoleRef = useRef(defaultValues?.role || "");

  // Tự động điền email theo code + role, và khóa ô email
  useEffect(() => {
    const codeChanged = codeValue !== prevCodeRef.current;
    const roleChanged = selectedRole !== prevRoleRef.current;
    if (!codeChanged && !roleChanged) return;
    prevCodeRef.current = codeValue;
    prevRoleRef.current = selectedRole;

    if (codeValue !== undefined && codeValue.trim().length > 0 && selectedRole) {
      const cleanCode = codeValue.trim().toLowerCase();
      const domain =
        selectedRole === "LECTURER" ? "@cmcu.edu.vn" : "@st.cmcu.edu.vn";
      setValue("email", `${cleanCode}${domain}`, {
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
  }, [codeValue, selectedRole, setValue, clearErrors]);

  // Khi đổi role, trigger lại validate ô code để cập nhật thông báo lỗi đúng định dạng
  useEffect(() => {
    if (codeValue && codeValue.trim().length > 0) {
      trigger("code");
    }
  }, [selectedRole, trigger, codeValue]);

  // Xác định placeholder và helper text của ô Code theo role
  const codeConfig = (() => {
    if (selectedRole === "STUDENT") {
      return {
        placeholder: "VD: BIT250052",
        helperText: "3 chữ cái mã ngành + 2 số khóa + 3-5 số STT",
      };
    }
    if (selectedRole === "LECTURER") {
      return {
        placeholder: "VD: NTSon, IT_GV01",
        helperText: "Tên viết tắt hoặc mã cán bộ (3-15 ký tự)",
      };
    }
    return {
      placeholder: "Chọn vai trò trước",
      helperText: "Mã sinh viên hoặc mã giảng viên của bạn",
    };
  })();

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

      {/* Role selector — đặt TRÊN ô Code để người dùng chọn vai trò trước */}
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

      {/* Code (MSSV/MSGV) — sau khi chọn Role mới nhập */}
      <div className="flex flex-col gap-1">
        <Input
          label="Mã định danh (MSSV/MSGV)"
          placeholder={codeConfig.placeholder}
          icon={Hash}
          required
          autoComplete="off"
          disabled={!selectedRole}
          helperText={codeConfig.helperText}
          error={errors.code}
          {...register("code", {
            onChange: (e) => {
              // Sinh viên: tự động viết hoa toàn bộ; Giảng viên: giữ nguyên case
              if (selectedRole === "STUDENT") {
                e.target.value = e.target.value.toUpperCase();
              }
            },
          })}
        />
        {/* Banner lưu ý quan trọng */}
        {selectedRole && (
          <div className="flex items-start gap-2 mt-1 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-amber-500 mt-0.5 shrink-0" aria-hidden>
              ⚠️
            </span>
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">Lưu ý quan trọng:</span> Mã định danh bạn nhập sẽ được dùng để tạo{" "}
              <span className="font-mono font-semibold">
                {selectedRole === "LECTURER" ? "@cmcu.edu.vn" : "@st.cmcu.edu.vn"}
              </span>
              . Vui lòng nhập <span className="font-semibold">chính xác</span> mã của bạn để đảm bảo nhận được mã xác thực khi kích hoạt tài khoản.
            </p>
          </div>
        )}
      </div>

      {/* Email — readOnly, tự động điền theo code + role */}
      <Input
        label="Email"
        placeholder={selectedRole ? "Tự động điền sau khi nhập mã" : "email@example.com"}
        type="email"
        icon={Mail}
        required
        autoComplete="email"
        readOnly
        className="bg-slate-50 cursor-not-allowed opacity-80"
        helperText={
          selectedRole
            ? `Email được tạo tự động từ mã định danh của bạn`
            : undefined
        }
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

function Step2Form({ role, onBack, onSubmit, isPending, submitLabel, submitIcon: SubmitIcon }) {
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
        <Button
          type="submit"
          loading={isPending}
          icon={SubmitIcon || undefined}
          className="flex-1"
          size="lg"
        >
          {submitLabel || "Đăng ký"}
        </Button>
      </div>
    </form>
  );
}

// ─── Step 3: OTP Verification ─────────────────────────────────────────────────

function Step3OtpForm({
  email,
  otpValue,
  setOtpValue,
  otpError,
  sendOtpError,
  resendCooldown,
  onResend,
  onConfirm,
  onBack,
  isPending,
  sendingOtp,
}) {
  const inputRefs = useRef([]);

  // Tách otpValue thành mảng 6 ký tự (luôn có đủ 6 phần tử để render đúng 6 ô input)
  const otpDigits = Array.from({ length: 6 }, (_, i) => otpValue[i] || "");

  const handleDigitChange = (index, value) => {
    // Chỉ cho phép số
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = Array.from({ length: 6 }, (_, i) => otpValue[i] || "");
    newDigits[index] = digit;
    setOtpValue(newDigits.join(""));

    // Auto-focus ô tiếp theo nếu đã nhập
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Xử lý paste mã OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pastedData) {
      setOtpValue(pastedData);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Icon header */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-text-primary mb-1">
            Xác thực Email
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Mã xác nhận 6 chữ số đã được gửi tới
          </p>
          <p className="text-sm font-semibold text-brand-student mt-0.5">
            {email}
          </p>
        </div>
      </div>

      {/* OTP Input (6 ô tách rời) */}
      <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all duration-200
              ${
                otpError
                  ? "border-red-400 text-red-700 bg-red-50 focus:ring-2 focus:ring-red-200"
                  : "border-slate-300 text-slate-800 bg-white focus:border-brand-student focus:ring-2 focus:ring-brand-student/20 hover:border-slate-400"
              }`}
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* Error messages */}
      {otpError && (
        <p className="text-xs text-red-500 font-medium text-center flex items-center justify-center gap-1">
          <span>⚠️</span> {otpError}
        </p>
      )}
      {sendOtpError && (
        <p className="text-xs text-red-500 font-medium text-center flex items-center justify-center gap-1">
          <span>⚠️</span> {sendOtpError}
        </p>
      )}

      {/* Helper text */}
      <p className="text-xs text-text-muted text-center leading-relaxed">
        Vui lòng kiểm tra hộp thư đến hoặc <span className="font-semibold">thư rác (spam)</span> của email trên.
      </p>

      {/* Resend OTP button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown > 0 || sendingOtp}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer
            ${
              resendCooldown > 0 || sendingOtp
                ? "text-slate-400 cursor-not-allowed"
                : "text-brand-student hover:text-brand-student-dark"
            }`}
        >
          {sendingOtp ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {resendCooldown > 0
            ? `Gửi lại mã sau ${resendCooldown}s`
            : sendingOtp
            ? "Đang gửi lại..."
            : "Gửi lại mã OTP"}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
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
        <Button
          type="button"
          onClick={onConfirm}
          loading={isPending}
          icon={ShieldCheck}
          className="flex-1"
          size="lg"
        >
          Hoàn tất Đăng ký
        </Button>
      </div>
    </div>
  );
}
