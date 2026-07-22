/**
 * DocumentCard.jsx
 * Component Card hiển thị thông tin chi tiết của 1 tài liệu (Document).
 *
 * Tính năng nổi bật:
 *  - Optimistic Update khi Like & Bookmark: Cập nhật giao diện lập tức không cần chờ API, rollback khi có lỗi.
 *  - Phân quyền Owner/Admin: Tự động hiển thị dropdown menu Sửa (`onEdit`) & Xóa (`onDelete`) nếu người dùng hiện tại là người đăng hoặc Admin.
 *  - Tự động hiển thị Icon theo `document_type` và Badge màu chuẩn hệ thống.
 *  - Nút Mở nhanh tài liệu qua tab mới (`window.open(file_url, '_blank')`).
 *  - Tối ưu hiệu năng: Bọc `React.memo` ngăn re-render thừa.
 */
import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Bookmark,
  Eye,
  MoreVertical,
  Edit3,
  Trash2,
  ExternalLink,
  FileText,
  ClipboardList,
  GraduationCap as ExamIcon,
  Presentation,
  BookOpen,
  File as DefaultFileIcon,
  User,
  Share2,
} from "lucide-react";
import Badge from "#/components/ui/Badge";
import ConfirmModal from "#/components/ui/ConfirmModal";
import EditDocumentModal from "#/components/document/EditDocumentModal";
import ShareDocToGroupModal from "#/components/document/ShareDocToGroupModal";
import DocumentPreviewModal from "#/components/document/DocumentPreviewModal";
import UserProfileModal from "#/components/user/UserProfileModal";
import {
  useToggleLike,
  useToggleBookmark,
  useSoftDeleteDocument,
} from "#/hooks/useDocuments";
import { useAuthStore } from "#/stores/useAuthStore";
import { formatDate, formatCount, getAvatarUrl } from "#/utils/formatters";

const DocumentCard = ({
  document: doc,
  onEdit,
  onDelete,
  onLikeToggle,
  onBookmarkToggle,
  disableProfileClick = false,
  className = "",
}) => {
  if (!doc) return null;

  const user = useAuthStore((state) => state.user);
  const isOwner =
    user &&
    (user.id === doc.owner_id ||
      user.id === doc.owner?.id ||
      user.role === "ADMIN");

  // Mutation hooks từ TanStack Query
  const toggleLikeMutation = useToggleLike();
  const toggleBookmarkMutation = useToggleBookmark();

  // Local state cho Optimistic Update
  const [isLiked, setIsLiked] = useState(!!(doc.is_liked || doc.liked));
  const [likeCount, setLikeCount] = useState(doc.like_count || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const [isBookmarked, setIsBookmarked] = useState(
    !!(doc.is_bookmarked || doc.bookmarked),
  );
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  // Local state cho Owner Dropdown Menu
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Local state cho Modals tự trị khi cha không truyền onEdit/onDelete
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // State mở DocumentPreviewModal — thay thế window.open để sửa lỗi 404 & ghi nhận view_count
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  // State mở UserProfileModal khi click vào người đăng
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const softDeleteMutation = useSoftDeleteDocument();

  const handleInternalDelete = () => {
    softDeleteMutation.mutate(doc.id, {
      onSuccess: () => {
        setIsConfirmDeleteOpen(false);
      },
    });
  };

  // Đồng bộ với props khi props thay đổi từ server/cache
  useEffect(() => {
    setIsLiked(!!(doc.is_liked || doc.liked));
    setLikeCount(doc.like_count || 0);
    setIsBookmarked(!!(doc.is_bookmarked || doc.bookmarked));
  }, [
    doc.is_liked,
    doc.liked,
    doc.like_count,
    doc.is_bookmarked,
    doc.bookmarked,
  ]);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Helper lấy icon theo loại tài liệu
  const getDocTypeIcon = (type) => {
    switch (type) {
      case "DOCUMENT":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "ASSIGNMENT":
        return <ClipboardList className="w-5 h-5 text-amber-600" />;
      case "EXAM":
        return <ExamIcon className="w-5 h-5 text-purple-600" />;
      case "SLIDE":
        return <Presentation className="w-5 h-5 text-rose-600" />;
      case "REFERENCE":
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      default:
        return <DefaultFileIcon className="w-5 h-5 text-slate-500" />;
    }
  };

  // ─── Handler: Optimistic Like Toggle ───────────────────────────────────────
  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (toggleLikeMutation.isPending || isLikeLoading) return;

    const prevLiked = isLiked;
    const prevCount = likeCount;
    const newLiked = !prevLiked;
    const newCount = newLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    // 1. Optimistic UI Update
    setIsLiked(newLiked);
    setLikeCount(newCount);
    setIsLikeLoading(true);
    if (onLikeToggle) onLikeToggle(doc, newLiked, newCount);

    toggleLikeMutation.mutate(doc.id, {
      onSuccess: (res) => {
        const serverData = res?.data?.data;
        if (serverData) {
          setIsLiked(!!(serverData.is_liked ?? serverData.liked ?? newLiked));
          if (typeof serverData.like_count === "number") {
            setLikeCount(serverData.like_count);
          }
        }
      },
      onError: () => {
        setIsLiked(prevLiked);
        setLikeCount(prevCount);
        if (onLikeToggle) onLikeToggle(doc, prevLiked, prevCount);
      },
      onSettled: () => {
        setIsLikeLoading(false);
      },
    });
  };

  // ─── Handler: Optimistic Bookmark Toggle ───────────────────────────────────
  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (toggleBookmarkMutation.isPending || isBookmarkLoading) return;

    const prevBookmarked = isBookmarked;
    const newBookmarked = !prevBookmarked;

    // 1. Optimistic UI Update
    setIsBookmarked(newBookmarked);
    setIsBookmarkLoading(true);
    if (onBookmarkToggle) onBookmarkToggle(doc, newBookmarked);

    toggleBookmarkMutation.mutate(doc.id, {
      onSuccess: (res) => {
        const serverData = res?.data?.data;
        if (
          serverData &&
          typeof (serverData.is_bookmarked ?? serverData.bookmarked) ===
            "boolean"
        ) {
          setIsBookmarked(serverData.is_bookmarked ?? serverData.bookmarked);
        }
      },
      onError: () => {
        setIsBookmarked(prevBookmarked);
        if (onBookmarkToggle) onBookmarkToggle(doc, prevBookmarked);
      },
      onSettled: () => {
        setIsBookmarkLoading(false);
      },
    });
  };

  // Mở DocumentPreviewModal thay vì window.open để:
  //  1. Tránh lỗi 404 (URL tương đối backend được xử lý bởi getFileUrl bên trong modal)
  //  2. Ghi nhận view_count thông qua useDocumentDetail bên trong modal
  const handleOpenPreview = (e) => {
    e.stopPropagation();
    setIsPreviewModalOpen(true);
  };

  const getRoleBadge = (role) => {
    const normalizedRole = String(role || "").toUpperCase();
    switch (normalizedRole) {
      case "STUDENT":
        return (
          <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
            Sinh viên
          </span>
        );
      case "LECTURER":
        return (
          <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
            Giảng viên
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">
            Admin
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={handleOpenPreview}
      className={`group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer select-none ${className}`.trim()}
    >
      {/* ─── Top Header: Document Type Badge & Owner Actions ─── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100/80 transition-colors">
            {getDocTypeIcon(doc.document_type)}
          </div>
          <Badge variant="type" value={doc.document_type} size="sm" />
          {doc.visibility && doc.visibility !== "PUBLIC" && (
            <Badge variant="visibility" value={doc.visibility} size="sm" />
          )}
        </div>

        {/* Owner Menu (Sửa / Xóa) */}
        {isOwner && (
          <div
            className="relative"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Menu thao tác tài liệu"
            >
              <MoreVertical className="w-4.5 h-4.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    if (onEdit) {
                      onEdit(doc);
                    } else {
                      setIsEditModalOpen(true);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setIsShareModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-brand-student" />
                  Chia sẻ vào nhóm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    if (onDelete) {
                      onDelete(doc);
                    } else {
                      setIsConfirmDeleteOpen(true);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa tài liệu
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Uploader & Date Row (Phía dưới tag, trên tiêu đề tài liệu) ─── */}
      {/* Click vào khu vực avatar/tên mở UserProfileModal của người đăng */}
      <div
        className={`flex items-center gap-2.5 text-xs text-slate-500 -mt-1 pb-1 ${
          disableProfileClick 
            ? "" 
            : "cursor-pointer hover:bg-slate-50 rounded-xl p-1 -ml-1 transition-colors"
        }`}
        onClick={(e) => {
          e.stopPropagation(); // Ngăn kích hoạt DocumentPreviewModal bên ngoài
          if (!disableProfileClick && doc.owner?.id) setIsProfileModalOpen(true);
        }}
        title={disableProfileClick ? "" : `Xem trang cá nhân của ${doc.owner?.full_name || doc.owner?.username || "người dùng này"}`}
        role={disableProfileClick ? "presentation" : "button"}
        tabIndex={disableProfileClick ? -1 : 0}
        onKeyDown={(e) => {
          if (!disableProfileClick && (e.key === "Enter" || e.key === " ") && doc.owner?.id) {
            e.stopPropagation();
            setIsProfileModalOpen(true);
          }
        }}
        aria-label={disableProfileClick ? undefined : `Xem trang cá nhân của ${doc.owner?.full_name || doc.owner?.username || "người dùng này"}`}
      >
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 overflow-hidden relative">
          {doc.owner?.avatar ? (
            <img
              src={getAvatarUrl(doc.owner.avatar)}
              alt={doc.owner.full_name || doc.owner.username || "Avatar"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling &&
                  (e.target.nextSibling.style.display = "block");
              }}
            />
          ) : null}
          <User className={`w-4 h-4 ${doc.owner?.avatar ? "hidden" : ""}`} />
        </div>
        <div className="flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 truncate hover:underline hover:text-brand-student transition-colors">
              {doc.owner?.full_name || doc.owner?.username || "Người dùng"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="shrink-0 text-slate-400">
              {formatDate(doc.created_at)}
            </span>
          </div>
          {doc.owner?.role && (
            <div className="mt-0.5">{getRoleBadge(doc.owner.role)}</div>
          )}
        </div>
      </div>

      {/* ─── Body: Title, Description & Subject ─── */}
      <div className="flex flex-col gap-1.5 flex-1 min-h-0">
        <h3
          className="text-base font-bold text-slate-800 group-hover:text-brand-student transition-colors line-clamp-2 leading-snug"
          title={doc.title}
        >
          {doc.title}
        </h3>

        {doc.description && (
          <p
            className="text-xs text-slate-500 line-clamp-2 leading-relaxed"
            title={doc.description}
          >
            {doc.description}
          </p>
        )}

        {/* Subject code / name */}
        {(doc.subject?.name || doc.subject_code) && (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-600 px-2 py-0.5 rounded-md bg-slate-100">
              {doc.subject?.code || doc.subject_code || "Môn học"}:{" "}
              {doc.subject?.name || ""}
            </span>
          </div>
        )}
      </div>

      {/* ─── Footer: Action Stats (View/Like/Bookmark & Open) ─── */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2 shrink-0">
          {/* View count */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 bg-slate-50"
            title={`${doc.view_count || 0} lượt xem`}
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">
              {formatCount(doc.view_count || 0)}
            </span>
          </div>

          {/* Like button */}
          <button
            type="button"
            onClick={handleLikeClick}
            disabled={isLikeLoading}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer ${
              isLiked
                ? "bg-rose-50 text-rose-600 font-bold"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-800 bg-slate-50"
            }`}
            title={isLiked ? "Bỏ thích" : "Thích tài liệu"}
          >
            <Heart
              className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`}
            />
            <span>{formatCount(likeCount)}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Bookmark button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={isBookmarkLoading}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isBookmarked
                ? "bg-brand-student-light text-brand-student"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
            title={isBookmarked ? "Bỏ lưu" : "Lưu tài liệu"}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${isBookmarked ? "fill-brand-student text-brand-student" : ""}`}
            />
          </button>

          {/* Share to group button */}
          {(doc.visibility === "PUBLIC" || isOwner) &&
            doc.visibility !== "GROUP" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShareModalOpen(true);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-brand-student transition-all cursor-pointer"
                title="Chia sẻ vào nhóm học tập"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}

          {/* Nút Mở xem trước / Chi tiết tài liệu — mở DocumentPreviewModal */}
          {doc.file_url && (
            <button
              type="button"
              onClick={handleOpenPreview}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 group-hover:text-brand-student transition-colors"
              title="Xem trước tài liệu"
              aria-label="Xem trước tài liệu"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Modals tự trị (Chỉ render div wrapper khi modal mở để tránh tạo DOM div rỗng gây thêm gap-4 trong flex col) */}
      {!onEdit && isEditModalOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <EditDocumentModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            document={doc}
          />
        </div>
      )}

      {!onDelete && isConfirmDeleteOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <ConfirmModal
            isOpen={isConfirmDeleteOpen}
            onClose={() => setIsConfirmDeleteOpen(false)}
            onConfirm={handleInternalDelete}
            title="Xác nhận chuyển vào Thùng rác"
            description={`Bạn có chắc chắn muốn chuyển tài liệu "${doc.title || ""}" vào thùng rác? Bạn có thể khôi phục lại trong tab Thùng rác.`}
            confirmText="Chuyển vào Thùng rác"
            cancelText="Hủy bỏ"
            variant="danger"
            loading={softDeleteMutation.isPending}
          />
        </div>
      )}

      {/* Modal chọn nhóm để chia sẻ tài liệu */}
      {isShareModalOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <ShareDocToGroupModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            document={doc}
          />
        </div>
      )}

      {/* Modal Xem trước & Chi tiết Tài liệu — Sửa lỗi 404 + Ghi nhận view_count */}
      {isPreviewModalOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <DocumentPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            document={doc}
          />
        </div>
      )}

      {/* Modal Trang cá nhân người đăng tài liệu — mở khi click avatar/tên */}
      {isProfileModalOpen && doc.owner?.id && (
        <div onClick={(e) => e.stopPropagation()}>
          <UserProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            userId={doc.owner.id}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(DocumentCard);
