/**
 * ProfilePage.jsx
 * Trang Hồ sơ cá nhân — Route: "/profile".
 *
 * Tính năng (STUDYHUB_FE.md Mục 15):
 *  - Xem và thay đổi ảnh đại diện (Avatar upload qua FormData).
 *  - Cập nhật thông tin cá nhân (Họ tên, Số điện thoại, Ngày sinh) với validation Zod (`updateProfileSchema`).
 *  - Hiển thị các trường cố định/khóa (Mã tài khoản, Email, Username, Phân cấp học thuật Khóa/Khoa/Ngành) để đảm bảo tính toàn vẹn dữ liệu hệ thống.
 */
import React, { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Save,
  Shield,
  GraduationCap,
  Award,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "#/stores/useAuthStore";
import PageWrapper from "#/components/layout/PageWrapper";
import Badge from "#/components/ui/Badge";
import Button from "#/components/ui/Button";
import Input from "#/components/ui/Input";
import {
  useProfile,
  useUpdateProfile,
  useUpdateAvatar,
} from "#/hooks/useUsers";
import { updateProfileSchema } from "#/utils/validators";
import { getAvatarUrl } from "#/utils/formatters";

export default function ProfilePage() {
  const storeUser = useAuthStore((s) => s.user);
  const fileInputRef = useRef(null);

  // Fetch chi tiết profile mới nhất từ backend (nếu có cập nhật từ thiết bị khác)
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const user = profileData || storeUser || {};

  const updateProfileMutation = useUpdateProfile();
  const updateAvatarMutation = useUpdateAvatar();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      dob: "",
    },
  });

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      reset({
        full_name: user.full_name || "",
        phone: user.phone || "",
        dob: user.dob ? user.dob.split("T")[0] : "",
      });
    }
  }, [user, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate kích thước < 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh đại diện không được vượt quá 5MB.");
      return;
    }

    // Validate định dạng ảnh
    if (!file.type.startsWith("image/")) {
      toast.error(
        "Vui lòng chọn định dạng file ảnh hợp lệ (.jpg, .png, .webp...).",
      );
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    updateAvatarMutation.mutate(formData);
  };

  const onSubmit = (data) => {
    const body = {
      full_name: data.full_name.trim(),
      phone: data.phone ? data.phone.trim() : undefined,
      dob: data.dob || undefined,
    };

    updateProfileMutation.mutate(body, {
      onSuccess: () => {
        reset(data); // reset form dirty state
      },
    });
  };

  const avatarUrl = getAvatarUrl(user.avatar || user.avatar_url);

  return (
    <PageWrapper title="Hồ sơ cá nhân">
      {/* 1. Header Card: Avatar & User identity */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-brand-student-light via-brand-student/10 to-transparent pointer-events-none" />

        {/* Avatar Section */}
        <div className="relative shrink-0 mt-4 sm:mt-2 z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-1.5 shadow-md ring-1 ring-slate-200 flex items-center justify-center overflow-hidden relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.full_name || user.username}
                className="w-full h-full object-cover rounded-2xl"
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextSibling)
                    e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-full h-full bg-brand-student-light text-brand-student font-extrabold text-3xl sm:text-4xl flex items-center justify-center rounded-2xl ${avatarUrl ? "hidden" : ""}`}
            >
              {user.full_name?.charAt(0).toUpperCase() ||
                user.username?.charAt(0).toUpperCase() ||
                "U"}
            </div>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={updateAvatarMutation.isPending}
            className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-brand-student text-white shadow-lg hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
            title="Thay đổi ảnh đại diện"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
        </div>

        {/* Identity Info */}
        <div className="flex-1 text-center sm:text-left z-10 pt-2 sm:pt-4">
          <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-800">
              {user.full_name || user.username}
            </h1>
            <Badge variant="role" value={user.role || "STUDENT"} size="sm" />
          </div>

          <p className="text-sm font-medium text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-2">
            <span>@{user.username}</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
              <Hash className="w-3 h-3" /> Code: {user.code || "Chưa cập nhật"}
            </span>
          </p>

          {/* Academic info summary pills */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
            {user.cohort_code && (
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/80">
                Khóa: {user.cohort_code}
              </span>
            )}
            {user.faculty_code && (
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200/80">
                Khoa: {user.faculty_code}
              </span>
            )}
            {user.major_code && (
              <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200/80">
                Ngành: {user.major_code}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ─── LEFT COLUMN: UPDATE FORM ─── */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-student" />
                Thông tin cá nhân
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật thông tin nhận diện cơ bản trên hệ thống StudyHub.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Họ và tên */}
            <Input
              label="Họ và tên (*)"
              placeholder="Nhập họ và tên đầy đủ..."
              icon={User}
              required
              error={errors.full_name}
              disabled={updateProfileMutation.isPending || profileLoading}
              {...register("full_name")}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Số điện thoại */}
              <Input
                label="Số điện thoại di động"
                placeholder="VD: 0912345678"
                icon={Phone}
                error={errors.phone}
                disabled={updateProfileMutation.isPending || profileLoading}
                {...register("phone")}
              />

              {/* Ngày sinh */}
              <Input
                label="Ngày sinh"
                type="date"
                icon={Calendar}
                error={errors.dob}
                disabled={updateProfileMutation.isPending || profileLoading}
                {...register("dob")}
              />
            </div>

            {/* Read-only locked inputs (Code, Email & Username) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
              <div>
                <Input
                  label="Mã định danh (Code)"
                  value={user.code || "Chưa cập nhật"}
                  icon={Hash}
                  disabled
                  readOnly
                  className="bg-slate-50 text-slate-500 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <Input
                  label="Email (Không thể thay đổi)"
                  value={user.email || ""}
                  icon={Mail}
                  disabled
                  readOnly
                  className="bg-slate-50 text-slate-500 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <Input
                  label="Tên đăng nhập (Username)"
                  value={user.username || ""}
                  icon={User}
                  disabled
                  readOnly
                  className="bg-slate-50 text-slate-500 font-mono text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="submit"
                icon={Save}
                loading={updateProfileMutation.isPending}
                disabled={!isDirty || updateProfileMutation.isPending}
                className="px-6"
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>

        {/* ─── RIGHT COLUMN: ACADEMIC LOCK & SECURITY INFO ─── */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Academic Classification Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-6">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-brand-student" />
                  Phân cấp học thuật
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Khóa học */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  Khóa học
                </span>
                <span className="text-xs font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                  {user.cohort_code
                    ? `Khóa ${user.cohort_code}`
                    : "Chưa cập nhật"}
                </span>
              </div>

              {/* Khoa trực thuộc */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  Khoa trực thuộc
                </span>
                <span
                  className="text-xs font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200/80 shadow-2xs truncate max-w-[180px]"
                  title={user.faculty_code}
                >
                  {user.faculty_code || "Chưa cập nhật"}
                </span>
              </div>

              {/* Chuyên ngành */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-500">
                  Chuyên ngành
                </span>
                <span
                  className="text-xs font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200/80 shadow-2xs truncate max-w-[180px]"
                  title={user.major_code}
                >
                  {user.major_code || "Chưa cập nhật"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-800 leading-relaxed">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong className="font-semibold">Student Upload Guard:</strong>{" "}
                Phân cấp học thuật được bảo vệ không cho chỉnh sửa tự do, đảm
                bảo tính chính xác và phân loại tài liệu chuẩn trên toàn hệ
                thống.
              </span>
            </div>
          </div>

          {/* Role Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-student-light flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-brand-student" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Quyền hạn tài khoản
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Bạn đang sử dụng quyền{" "}
                <strong className="text-slate-700 font-semibold">
                  {user.role || "STUDENT"}
                </strong>{" "}
                trên StudyHub.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
