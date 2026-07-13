/**
 * AdminDashboard.jsx
 * Trang Dashboard Quản trị viên (Admin Panel) — Route: "/admin/dashboard".
 *
 * Tính năng:
 *  1. Stats Overview: 4 metric cards (Tổng Users | Tổng Tài liệu | Tổng Nhóm | Tổng Views).
 *  2. System Health real-time (RAM, CPU Load, DB, Uptime).
 *  3. Quản lý nhanh: Shortcuts đến Users, Academic, Cron.
 *  4. Cây học thuật (AcademicTreeWidget).
 *  5. Danh sách 10 Users mới đăng ký gần nhất + action Đổi trạng thái.
 *  6. Cron Triggers panel: Dọn rác mềm (nhập days) & Dọn Refresh Token.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 8.9 / 9.3 (AdminDashboard).
 */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  Users as UsersIcon,
  FileText,
  Users,
  Eye,
  UserCog,
  GraduationCap,
  Clock,
  Trash2,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";

import { useAuthStore } from "#/stores/useAuthStore";
import PageWrapper from "#/components/layout/PageWrapper";
import Badge from "#/components/ui/Badge";
import Button from "#/components/ui/Button";
import Skeleton from "#/components/ui/Skeleton";
import SystemHealthCard from "#/components/admin/SystemHealthCard";
import AcademicTreeWidget from "#/components/admin/AcademicTreeWidget";
import UserStatusModal from "#/components/admin/UserStatusModal";
import {
  useAdminStats,
  useAdminUsers,
  useCronTriggers,
} from "#/hooks/useAdmin";
import { formatDate, getRoleLabel, getAvatarUrl } from "#/utils/formatters";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Queries
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: recentUsersData, isLoading: usersLoading } = useAdminUsers({
    page: 1,
    limit: 10,
  });
  const { triggerTrashCleanup, triggerTokenCleanup } = useCronTriggers();

  // State
  const [trashDays, setTrashDays] = useState(15);
  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);

  const recentUsers = recentUsersData?.users || [];

  const handleRunTrashCleanup = () => {
    triggerTrashCleanup.mutate({ days: Number(trashDays) || 15 });
  };

  const handleRunTokenCleanup = () => {
    triggerTokenCleanup.mutate();
  };

  return (
    <PageWrapper title="Admin Dashboard">
      {/* 1. Welcome banner — Admin Red Theme (#DC2626) */}
      <div className="bg-gradient-to-br from-brand-admin/15 via-brand-admin-light/40 to-white rounded-2xl p-6 md:p-8 border border-brand-admin/20 mb-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-admin flex items-center justify-center text-white shadow-md shadow-brand-admin/20 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-text-primary tracking-tight mb-1">
                Xin chào, {user?.full_name || user?.username || "Quản trị viên"}
                !
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="role" value="ADMIN" size="sm" />
                <span className="text-sm text-text-secondary font-medium">
                  Trung tâm điều khiển và quản trị toàn diện hệ thống StudyHub
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              icon={UserCog}
              size="sm"
              onClick={() => navigate("/admin/users")}
              className="bg-brand-admin hover:bg-brand-admin-dark text-white shadow-xs"
            >
              Quản lý Users
            </Button>
            <Button
              icon={GraduationCap}
              variant="secondary"
              size="sm"
              onClick={() => navigate("/admin/academic")}
            >
              Cấu trúc Học thuật
            </Button>
            <Button
              icon={Clock}
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/cron")}
              className="border border-border bg-white"
            >
              Bảo trì Cron
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Stats Overview — 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={UsersIcon}
          label="Tổng Người dùng"
          value={stats?.total_users}
          isLoading={statsLoading}
          color="text-brand-admin"
          bgColor="bg-brand-admin/10"
          linkTo="/admin/users"
        />
        <StatCard
          icon={FileText}
          label="Tổng Tài liệu"
          value={stats?.total_documents}
          isLoading={statsLoading}
          color="text-blue-600"
          bgColor="bg-blue-50"
          linkTo="/documents"
        />
        <StatCard
          icon={Users}
          label="Tổng Nhóm học"
          value={stats?.total_groups}
          isLoading={statsLoading}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          linkTo="/groups"
        />
        <StatCard
          icon={Eye}
          label="Tổng Lượt xem"
          value={stats?.total_views}
          isLoading={statsLoading}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      {/* 3. System Health Real-time Card */}
      <div className="mb-6">
        <SystemHealthCard />
      </div>

      {/* 4. Grid 2 Column: Academic Tree & Cron Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left 7 cols: Academic Tree */}
        <div className="lg:col-span-7">
          <AcademicTreeWidget />
        </div>

        {/* Right 5 cols: Cron Triggers Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border/60">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary tracking-tight">
                    Kích hoạt Cron Jobs Thủ công
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Thực hiện dọn dẹp tài nguyên máy chủ ngay lập tức
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Trash Cleanup Trigger */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-sm font-bold text-text-primary mb-1">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>Dọn Thùng rác mềm quá hạn</span>
                  </div>
                  <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                    Xóa vĩnh viễn các tài liệu và tệp tin đã nằm trong thùng rác
                    vượt quá số ngày chỉ định.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-brand-admin/20 focus-within:border-brand-admin">
                      <span className="text-xs text-slate-400 mr-1.5 font-medium">
                        ≥
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={trashDays}
                        onChange={(e) => setTrashDays(e.target.value)}
                        className="w-12 text-xs font-bold outline-none text-center bg-transparent"
                      />
                      <span className="text-xs text-slate-400 ml-1">ngày</span>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleRunTrashCleanup}
                      loading={triggerTrashCleanup.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white ml-auto"
                    >
                      Chạy dọn rác
                    </Button>
                  </div>
                </div>

                {/* Token Cleanup Trigger */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2 text-sm font-bold text-text-primary mb-1">
                    <KeyRound className="w-4 h-4 text-purple-600" />
                    <span>Thu hồi Refresh Token hết hạn</span>
                  </div>
                  <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                    Khảo sát bảng tokens trong DB và thu hồi toàn bộ các JWT
                    refresh token đã hết hạn sử dụng.
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleRunTokenCleanup}
                    loading={triggerTokenCleanup.isPending}
                    className="w-full justify-center"
                  >
                    Dọn token ngay
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Lưu ý: Các tác vụ này cũng tự động chạy ngầm lúc 02:00 sáng mỗi
              ngày.
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recent Users Table (10 Newest Users) */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary tracking-tight">
                Người Dùng Mới Đăng Ký Gần Đây
              </h3>
              <p className="text-xs text-text-secondary">
                Danh sách {stats?.total_users} tài khoản vừa tham gia hệ thống
              </p>
            </div>
          </div>

          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-admin hover:text-brand-admin-dark bg-brand-admin/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>Xem toàn bộ danh sách</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {usersLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Chưa có người dùng nào đăng ký trên hệ thống.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-3 px-3.5 rounded-l-xl">Người dùng</th>
                  <th className="py-3 px-3.5">Email</th>
                  <th className="py-3 px-3.5 text-center">Vai trò</th>
                  <th className="py-3 px-3.5 text-center">Trạng thái</th>
                  <th className="py-3 px-3.5">Ngày tạo</th>
                  <th className="py-3 px-3.5 text-right rounded-r-xl">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentUsers.map((item) => {
                  const avatarUrl = getAvatarUrl(
                    item.avatar || item.avatar_url,
                  );
                  const isBanned = item.status === "BANNED";
                  const isInactive = item.status === "INACTIVE";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0 font-bold text-slate-600 text-xs">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={item.full_name || item.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (item.username || "U").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-text-primary truncate">
                              {item.full_name || item.username}
                            </p>
                            <p className="text-xs text-text-secondary truncate">
                              @{item.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-text-secondary font-mono text-xs truncate max-w-[180px]">
                        {item.email}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <Badge
                          variant="role"
                          value={item.role || "STUDENT"}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isBanned
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : isInactive
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isBanned
                                ? "bg-red-600"
                                : isInactive
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                          />
                          {item.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-xs text-text-secondary">
                        {formatDate(item.created_at || item.createdAt)}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedUserForStatus(item)}
                          className="text-xs hover:bg-slate-200/60"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Status Modal */}
      <UserStatusModal
        isOpen={Boolean(selectedUserForStatus)}
        onClose={() => setSelectedUserForStatus(null)}
        user={selectedUserForStatus}
      />
    </PageWrapper>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
  color,
  bgColor,
  linkTo,
}) {
  const content = (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-2xs hover:shadow-md transition-all flex items-center gap-4 group">
      <div
        className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}
      >
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="overflow-hidden">
        {isLoading ? (
          <Skeleton className="h-7 w-16 mb-1 rounded-md" />
        ) : (
          <p className="text-2xl font-extrabold text-text-primary tracking-tight">
            {value ?? "0"}
          </p>
        )}
        <p className="text-xs font-semibold text-text-secondary truncate mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
