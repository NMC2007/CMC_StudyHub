/**
 * UsersPage.jsx
 * Trang Quản lý Người dùng dành cho Admin (`/admin/users`).
 *
 * Tính năng:
 *  - Bảng danh sách toàn bộ Users với phân trang server-side (`page`, `limit`).
 *  - Bộ lọc theo Role (`ALL | STUDENT | LECTURER | ADMIN`).
 *  - Tìm kiếm theo từ khóa (tên, username, email) với `useDebounce`.
 *  - Nút Đổi trạng thái (`ACTIVE | INACTIVE | BANNED`) mở `UserStatusModal`.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 8.9 / 6.2 (Quản lý Người dùng).
 */
import React, { useState } from "react";
import {
  Search,
  UserCog,
  SlidersHorizontal,
  Filter,
  RefreshCw,
  Users,
} from "lucide-react";

import PageWrapper from "#/components/layout/PageWrapper";
import Badge from "#/components/ui/Badge";
import Button from "#/components/ui/Button";
import Skeleton from "#/components/ui/Skeleton";
import Pagination from "#/components/ui/Pagination";
import UserStatusModal from "#/components/admin/UserStatusModal";
import { useAdminUsers } from "#/hooks/useAdmin";
import { useDebounce } from "#/hooks/useDebounce";
import { formatDate, getAvatarUrl } from "#/utils/formatters";

const ROLE_TABS = [
  { value: "ALL", label: "Tất cả vai trò" },
  { value: "STUDENT", label: "Sinh viên (Student)" },
  { value: "LECTURER", label: "Giảng viên (Lecturer)" },
  { value: "ADMIN", label: "Quản trị viên (Admin)" },
];

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);

  // Fetch Users
  const { data, isLoading, isFetching, refetch } = useAdminUsers({
    page,
    limit,
    role: roleFilter === "ALL" ? undefined : roleFilter,
    search: debouncedSearch || undefined,
  });

  const usersList = data?.users || [];
  const pagination = data?.pagination || {};
  const totalItems = pagination.totalItems || usersList.length;
  const totalPages = pagination.totalPages || 1;

  const handleRoleChange = (newRole) => {
    setRoleFilter(newRole);
    setPage(1); // Reset về trang 1 khi đổi bộ lọc
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <PageWrapper title="Quản lý Người dùng">
      {/* Header Info Banner */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-brand-admin/10 text-brand-admin flex items-center justify-center shrink-0">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Quản lý Danh sách Người dùng Toàn hệ thống
            </h2>
            <p className="text-xs text-text-secondary">
              Quản trị tài khoản Sinh viên, Giảng viên và Quản trị viên • Cấp
              quyền hoặc khóa tài khoản vi phạm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border border-border bg-white"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1.5 ${isFetching ? "animate-spin text-brand-admin" : ""}`}
            />
            Làm mới dữ liệu
          </Button>
          <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            Tổng cộng: {totalItems} tài khoản
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card rounded-2xl p-5 border border-border shadow-2xs mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {ROLE_TABS.map((tab) => {
              const isActive = roleFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleRoleChange(tab.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-brand-admin text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, username, email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-admin/20 focus:border-brand-admin transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : usersList.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-1">
              Không tìm thấy người dùng nào
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Không có tài khoản nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện
              tại của bạn.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/50">
                    <th className="py-3 px-3.5 rounded-l-xl">Người dùng</th>
                    <th className="py-3 px-3.5">Email</th>
                    <th className="py-3 px-3.5 text-center">Vai trò</th>
                    <th className="py-3 px-3.5 text-center">Trạng thái</th>
                    <th className="py-3 px-3.5">Ngày gia nhập</th>
                    <th className="py-3 px-3.5 text-right rounded-r-xl">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {usersList.map((item) => {
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
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0 font-bold text-slate-600 text-xs shadow-2xs">
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
                              <p className="text-xs text-text-secondary truncate font-mono">
                                @{item.username} • ID: #{item.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-text-secondary font-mono text-xs truncate max-w-[200px]">
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
                            className="text-xs hover:bg-slate-200/60 font-semibold text-text-primary"
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

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      {/* Status Modal */}
      <UserStatusModal
        isOpen={Boolean(selectedUserForStatus)}
        onClose={() => setSelectedUserForStatus(null)}
        user={selectedUserForStatus}
      />
    </PageWrapper>
  );
}
