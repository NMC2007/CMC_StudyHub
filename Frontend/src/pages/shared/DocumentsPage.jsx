/**
 * DocumentsPage.jsx
 * Trang quản lý Tài liệu cá nhân & Thùng rác — Route: "/documents".
 *
 * Tính năng (STUDYHUB_FE.md Mục 11):
 *  - 2 Tab rõ rệt:
 *      1. Tài liệu của tôi (`my`): Quản lý các file đã tải lên, hỗ trợ tìm kiếm, lọc theo loại file và quyền hiển thị.
 *         + Thao tác: Sửa metadata (EditDocumentModal), Xóa mềm (chuyển vào Thùng rác qua ConfirmModal).
 *      2. Thùng rác (`trash`): Xem các file đã xóa mềm, hiển thị cảnh báo ngày xóa vĩnh viễn.
 *         + Thao tác: Khôi phục lại tài liệu (`useRestoreDocument`).
 *  - Đồng bộ trạng thái tab với URL query params (`/documents?tab=my|trash`).
 *  - Nút tải lên nhanh mở DocumentUploadModal.
 */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  FileText,
  Trash2,
  Upload,
  Search,
  Filter,
  FolderOpen,
  RotateCcw,
} from "lucide-react";

import PageWrapper from "#/components/layout/PageWrapper";
import Tabs from "#/components/ui/Tabs";
import Button from "#/components/ui/Button";
import Input from "#/components/ui/Input";
import Select from "#/components/ui/Select";
import Skeleton from "#/components/ui/Skeleton";
import EmptyState from "#/components/ui/EmptyState";
import Pagination from "#/components/ui/Pagination";
import ConfirmModal from "#/components/ui/ConfirmModal";

import DocumentCard from "#/components/document/DocumentCard";
import TrashCard from "#/components/document/TrashCard";
import DocumentUploadModal from "#/components/document/DocumentUploadModal";
import EditDocumentModal from "#/components/document/EditDocumentModal";

import {
  useMyDocuments,
  useTrash,
  useSoftDeleteDocument,
  useRestoreDocument,
} from "#/hooks/useDocuments";
import { useDebounce } from "#/hooks/useDebounce";

const DOCUMENT_TYPE_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả loại tài liệu" },
  { value: "DOCUMENT", label: "Tài liệu / Giáo trình" },
  { value: "SLIDE", label: "Bài giảng / Slide" },
  { value: "ASSIGNMENT", label: "Bài tập / Đề tài" },
  { value: "EXAM", label: "Đề thi / Kiểm tra" },
  { value: "REFERENCE", label: "Tài liệu tham khảo" },
];

const VISIBILITY_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả phạm vi" },
  { value: "PUBLIC", label: "Công khai (PUBLIC)" },
  { value: "PRIVATE", label: "Riêng tư (PRIVATE)" },
  { value: "GROUP", label: "Nhóm học tập (GROUP)" },
];

export default function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab") === "trash" ? "trash" : "my";
  const [activeTab, setActiveTab] = useState(urlTab);

  // Bộ lọc cho Tab Tài liệu của tôi
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState("ALL");
  const [myPage, setMyPage] = useState(1);

  // Bộ lọc cho Tab Thùng rác
  const [trashPage, setTrashPage] = useState(1);

  // State Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);

  // Mutations
  const softDeleteMutation = useSoftDeleteDocument();
  const restoreMutation = useRestoreDocument();

  // Đồng bộ tab khi URL thay đổi hoặc khi click tab
  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // 1. Query cho Tab "Tài liệu của tôi"
  const myDocsParams = {
    page: myPage,
    limit: 12,
    ...(debouncedSearchQuery.trim() ? { q: debouncedSearchQuery.trim() } : {}),
    ...(typeFilter !== "ALL"
      ? { type: typeFilter, document_type: typeFilter }
      : {}),
    ...(visibilityFilter !== "ALL" ? { visibility: visibilityFilter } : {}),
  };
  const { data: myDocsData, isLoading: myDocsLoading } =
    useMyDocuments(myDocsParams);

  // 2. Query cho Tab "Thùng rác"
  const trashParams = {
    page: trashPage,
    limit: 12,
    ...(debouncedSearchQuery.trim() ? { q: debouncedSearchQuery.trim() } : {}),
  };
  const { data: trashData, isLoading: trashLoading } = useTrash(trashParams);

  // Xử lý Xóa mềm
  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    softDeleteMutation.mutate(docToDelete.id, {
      onSuccess: () => {
        setDocToDelete(null);
      },
    });
  };

  // Xử lý Khôi phục
  const handleRestore = (doc) => {
    if (!doc) return;
    restoreMutation.mutate(doc.id);
  };

  const tabsConfig = [
    {
      id: "my",
      label: "Tài liệu của tôi",
      icon: FolderOpen,
      count: myDocsData?.pagination?.total || 0,
    },
    {
      id: "trash",
      label: "Thùng rác",
      icon: Trash2,
      count: trashData?.pagination?.total || 0,
    },
  ];

  return (
    <PageWrapper title="Quản lý tài liệu">
      {/* Header CTA Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-student" />
            Quản lý tài liệu cá nhân
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi, chỉnh sửa và quản lý tất cả các tài liệu, bài giảng bạn đã
            chia sẻ.
          </p>
        </div>

        <Button
          type="button"
          icon={Upload}
          onClick={() => setIsUploadOpen(true)}
          className="w-full sm:w-auto shrink-0"
        >
          Tải lên tài liệu mới
        </Button>
      </div>

      {/* Tabs Control & Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6 flex flex-col gap-4">
        <Tabs
          tabs={tabsConfig}
          activeTab={activeTab}
          onChange={handleTabChange}
          variant="pills"
        />

        {/* Thanh tìm kiếm & bộ lọc */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-3 border-t border-slate-100">
          <div className="w-full md:flex-1">
            <Input
              placeholder={
                activeTab === "my"
                  ? "Tìm kiếm theo tên hoặc mô tả tài liệu của bạn..."
                  : "Tìm kiếm tài liệu trong thùng rác..."
              }
              icon={Search}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab === "my") setMyPage(1);
                else setTrashPage(1);
              }}
            />
          </div>

          {activeTab === "my" && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <Select
                options={DOCUMENT_TYPE_FILTER_OPTIONS}
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setMyPage(1);
                }}
                className="w-full sm:w-52"
              />

              <Select
                options={VISIBILITY_FILTER_OPTIONS}
                value={visibilityFilter}
                onChange={(e) => {
                  setVisibilityFilter(e.target.value);
                  setMyPage(1);
                }}
                className="w-full sm:w-48"
              />
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: TÀI LIỆU CỦA TÔI */}
      {activeTab === "my" && (
        <div className="flex flex-col gap-6">
          {myDocsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <Skeleton key={key} height="h-44" className="rounded-2xl" />
              ))}
            </div>
          ) : !myDocsData?.documents || myDocsData.documents.length === 0 ? (
            <EmptyState
              title="Không tìm thấy tài liệu nào"
              message={
                searchQuery ||
                typeFilter !== "ALL" ||
                visibilityFilter !== "ALL"
                  ? "Không có tài liệu nào khớp với bộ lọc của bạn. Hãy thử thay đổi từ khóa hoặc xóa bộ lọc."
                  : "Bạn chưa tải lên tài liệu nào. Hãy bắt đầu chia sẻ tài nguyên đầu tiên của bạn."
              }
              actionText={
                searchQuery ||
                typeFilter !== "ALL" ||
                visibilityFilter !== "ALL"
                  ? "Đặt lại bộ lọc"
                  : "Tải lên ngay"
              }
              onAction={() => {
                if (
                  searchQuery ||
                  typeFilter !== "ALL" ||
                  visibilityFilter !== "ALL"
                ) {
                  setSearchQuery("");
                  setTypeFilter("ALL");
                  setVisibilityFilter("ALL");
                } else {
                  setIsUploadOpen(true);
                }
              }}
              icon={FolderOpen}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myDocsData.documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onEdit={(d) => setDocToEdit(d)}
                    onDelete={(d) => setDocToDelete(d)}
                  />
                ))}
              </div>

              {(myDocsData?.pagination?.totalPages || 0) > 1 && (
                <Pagination
                  page={myDocsData?.pagination?.page || myPage}
                  totalPages={myDocsData?.pagination?.totalPages || 0}
                  totalItems={myDocsData?.pagination?.total || 0}
                  onPageChange={(p) => setMyPage(p)}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: THÙNG RÁC */}
      {activeTab === "trash" && (
        <div className="flex flex-col gap-6">
          {trashLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((key) => (
                <Skeleton key={key} height="h-40" className="rounded-2xl" />
              ))}
            </div>
          ) : !trashData?.documents || trashData.documents.length === 0 ? (
            <EmptyState
              title="Thùng rác trống"
              message="Không có tài liệu nào trong thùng rác của bạn. Các tài liệu bị xóa sẽ được lưu giữ tại đây trước khi xóa vĩnh viễn."
              icon={Trash2}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trashData.documents.map((doc) => (
                  <TrashCard
                    key={doc.id}
                    document={doc}
                    onRestore={handleRestore}
                    isRestoring={restoreMutation.isPending}
                  />
                ))}
              </div>

              {(trashData?.pagination?.totalPages || 0) > 1 && (
                <Pagination
                  page={trashData?.pagination?.page || trashPage}
                  totalPages={trashData?.pagination?.totalPages || 0}
                  totalItems={trashData?.pagination?.total || 0}
                  onPageChange={(p) => setTrashPage(p)}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <EditDocumentModal
        isOpen={!!docToEdit}
        onClose={() => setDocToEdit(null)}
        document={docToEdit}
      />

      <ConfirmModal
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận chuyển vào Thùng rác"
        description={`Bạn có chắc chắn muốn chuyển tài liệu "${docToDelete?.title || ""}" vào thùng rác? Bạn có thể khôi phục lại trong tab Thùng rác.`}
        confirmText="Chuyển vào Thùng rác"
        cancelText="Hủy bỏ"
        variant="danger"
        loading={softDeleteMutation.isPending}
      />
    </PageWrapper>
  );
}
