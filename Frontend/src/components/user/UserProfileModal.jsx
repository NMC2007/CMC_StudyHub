/**
 * UserProfileModal.jsx
 * Modal hiển thị trang cá nhân của một người dùng bất kỳ trong hệ thống.
 *
 * Tính năng:
 *  - Header: Avatar (to), Tên đầy đủ, Badge vai trò, thông tin học thuật (Khóa/Khoa/Ngành).
 *  - Body: Thanh tìm kiếm tài liệu (q, debounce 400ms), bộ lọc loại tài liệu (type), lưới DocumentCard.
 *  - Phân trang server-side bằng Pagination component.
 *  - Skeleton loading trong khi chờ API phản hồi.
 *  - Tài liệu PRIVATE và GROUP bị ẩn tự động theo quyền của người xem (xử lý phía Backend).
 *
 * Tuân thủ: STUDYHUB_FE.md — Section 7 (Shared Components), Section 19 (Performance).
 */
import React, { useState, useCallback } from "react";
import {
  User,
  FileText,
  Building2,
  BookOpen,
  GraduationCap,
  Search,
  X,
} from "lucide-react";
import Modal from "#/components/ui/Modal";
import DocumentCard from "#/components/document/DocumentCard";
import Skeleton from "#/components/ui/Skeleton";
import Pagination from "#/components/ui/Pagination";
import { useUserProfileById } from "#/hooks/useUsers";
import { useDebounce } from "#/hooks/useDebounce";
import { getAvatarUrl, getRoleLabel, formatDate } from "#/utils/formatters";

// ── Danh sách loại tài liệu để lọc — Không hardcode, đồng bộ với spec ──────
const DOC_TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại tài liệu" },
  { value: "DOCUMENT", label: "Tài liệu" },
  { value: "ASSIGNMENT", label: "Bài tập" },
  { value: "EXAM", label: "Đề thi" },
  { value: "SLIDE", label: "Slide" },
  { value: "REFERENCE", label: "Tham khảo" },
];

// ── Skeleton cho DocumentCard ─────────────────────────────────────────────────
const DocumentCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 animate-pulse">
    <div className="flex items-center gap-3">
      <Skeleton variant="rect" className="w-10 h-10 rounded-xl shrink-0" />
      <Skeleton variant="text" className="w-20" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton variant="circle" className="w-7 h-7" />
      <Skeleton variant="text" className="w-32" />
    </div>
    <Skeleton variant="text" className="w-11/12 h-5" />
    <Skeleton variant="text" className="w-3/5" />
    <div className="flex gap-2 pt-2 border-t border-slate-100">
      <Skeleton variant="rect" className="w-16 h-7 rounded-lg" />
      <Skeleton variant="rect" className="w-16 h-7 rounded-lg" />
    </div>
  </div>
);

// ── Badge vai trò ─────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    STUDENT: "bg-blue-50 text-blue-700 border-blue-100",
    LECTURER: "bg-emerald-50 text-emerald-700 border-emerald-100",
    ADMIN: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
        styles[role] || "bg-slate-50 text-slate-600 border-slate-100"
      }`}
    >
      {getRoleLabel(role)}
    </span>
  );
};

// ── Component chính ───────────────────────────────────────────────────────────
const UserProfileModal = ({ isOpen, onClose, userId }) => {
  // Bộ lọc tài liệu nội bộ modal
  const [searchInput, setSearchInput] = useState("");
  const [docType, setDocType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce 400ms cho ô tìm kiếm — theo STUDYHUB_FE.md Section 19
  const debouncedSearch = useDebounce(searchInput, 400);

  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
    setCurrentPage(1);
  }, []);

  const handleTypeChange = useCallback((value) => {
    setDocType(value);
    setCurrentPage(1);
  }, []);

  // Tổng hợp query params — không hardcode URL hay giá trị tham số
  const queryParams = {
    q: debouncedSearch || undefined,
    type: docType || undefined,
    page: currentPage,
    limit: 6,
  };

  // TanStack Query — enabled=false khi modal đóng (tránh gọi API thừa)
  const { data, isLoading, isError, refetch } = useUserProfileById(
    isOpen ? userId : null,
    queryParams,
  );

  const profile = data?.profile || null;
  const documents = data?.documents || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  // Đóng modal và reset toàn bộ trạng thái filter
  const handleClose = useCallback(() => {
    setSearchInput("");
    setDocType("");
    setCurrentPage(1);
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      bodyClassName="p-0 flex flex-col overflow-hidden max-h-[85vh]"
      closeOnBackdrop
      hideHeader
    >
      {/* ── HEADER PROFILE ────────────────────────────────────────────────── */}
      <div className="shrink-0 z-10 px-6 pt-5 pb-5 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
        {/* Nút đóng */}
        <div className="flex justify-end -mt-1 mb-3">
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Đóng trang cá nhân"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-5">
            <Skeleton variant="circle" className="w-20 h-20 shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton variant="text" className="w-44 h-6" />
              <Skeleton variant="text" className="w-24" />
              <Skeleton variant="text" className="w-56" />
            </div>
          </div>
        ) : profile ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-slate-200 border-2 border-white shadow-md flex items-center justify-center text-slate-500 shrink-0 overflow-hidden">
              {profile.avatar ? (
                <img
                  src={getAvatarUrl(profile.avatar)}
                  alt={profile.full_name || profile.username || "Avatar"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <User className="w-9 h-9" />
              )}
            </div>

            {/* Thông tin người dùng */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-800 truncate">
                  {profile.full_name || profile.username || "Người dùng"}
                </h2>
                {profile.role && <RoleBadge role={profile.role} />}
              </div>

              <p className="text-sm text-slate-500">@{profile.username}</p>

              {/* Thông tin học thuật */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                {profile.faculty_code && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    Khoa:{" "}
                    <strong className="text-slate-700 ml-0.5">
                      {profile.faculty_code}
                    </strong>
                  </span>
                )}
                {profile.major_code && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    Ngành:{" "}
                    <strong className="text-slate-700 ml-0.5">
                      {profile.major_code}
                    </strong>
                  </span>
                )}
                {profile.cohort_code && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    Khóa:{" "}
                    <strong className="text-slate-700 ml-0.5">
                      {profile.cohort_code}
                    </strong>
                  </span>
                )}
                {profile.created_at && (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    Tham gia: {formatDate(profile.created_at)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-500 py-2">
            <User className="w-6 h-6" />
            <span className="text-sm">Không thể tải thông tin người dùng.</span>
          </div>
        )}
      </div>

      {/* ── BODY: TÀI LIỆU ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Tiêu đề + bộ lọc (Cố định ở trên cùng phần body) */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-50 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 shrink-0">
            <FileText className="w-4 h-4 text-slate-400" />
            Tài liệu đã đăng
            {!isLoading && (
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                {pagination.total}
              </span>
            )}
          </h3>

          {/* Bộ lọc tài liệu */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Tìm kiếm theo từ khóa */}
            <div className="relative w-full sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                id="user-profile-doc-search"
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm tài liệu..."
                className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-student/20 focus:border-brand-student transition-colors"
                aria-label="Tìm kiếm tài liệu của người dùng này"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Xóa từ khóa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Lọc loại tài liệu — native select để tương thích với design system */}
            <select
              id="user-profile-doc-type"
              value={docType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-student/20 focus:border-brand-student transition-colors cursor-pointer w-full sm:w-44"
              aria-label="Lọc theo loại tài liệu"
            >
              {DOC_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Danh sách tài liệu (Phần duy nhất được phép cuộn) */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <DocumentCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-slate-500 text-sm">
                Không thể tải danh sách tài liệu.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 text-xs text-brand-student underline underline-offset-2 hover:text-brand-student-dark cursor-pointer"
              >
                Thử lại
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">
                {debouncedSearch || docType
                  ? "Không tìm thấy tài liệu phù hợp với bộ lọc."
                  : "Người dùng này chưa đăng tải tài liệu nào."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    disableProfileClick={true}
                  />
                ))}
              </div>

              {/* Phân trang */}
              {pagination.totalPages > 1 && (
                <Pagination
                  page={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  onPageChange={(p) => setCurrentPage(p)}
                  disabled={isLoading}
                  className="mt-5"
                />
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(UserProfileModal);
