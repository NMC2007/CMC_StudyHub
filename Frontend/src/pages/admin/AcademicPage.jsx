/**
 * AcademicPage.jsx
 * Trang Quản lý Cấu trúc Học thuật dành cho Admin (`/admin/academic`).
 *
 * Phân cấp 4 tầng:
 *  1. Khóa học (Cohorts)
 *  2. Khoa (Faculties)
 *  3. Ngành học (Majors — Phụ thuộc Khoa)
 *  4. Môn học (Subjects — Phụ thuộc Ngành)
 *
 * Tuân thủ: STUDYHUB_FE.md mục 8.9 / 6.3 (Quản lý Cấu trúc Học thuật).
 */
import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Building2,
  BookOpen,
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Layers,
  Filter,
} from "lucide-react";

import PageWrapper from "#/components/layout/PageWrapper";
import Tabs from "#/components/ui/Tabs";
import Button from "#/components/ui/Button";
import Skeleton from "#/components/ui/Skeleton";
import ConfirmModal from "#/components/ui/ConfirmModal";
import AcademicFormModal from "#/components/admin/AcademicFormModal";
import {
  useAdminCohorts,
  useAdminFaculties,
  useAdminMajors,
  useAdminSubjects,
} from "#/hooks/useAdmin";

const ACADEMIC_TABS = [
  { id: "cohorts", label: "Khóa học (Cohorts)", icon: CalendarDays },
  { id: "faculties", label: "Khoa (Faculties)", icon: Building2 },
  { id: "majors", label: "Ngành học (Majors)", icon: GraduationCap },
  { id: "subjects", label: "Môn học (Subjects)", icon: BookOpen },
];

export default function AcademicPage() {
  const [activeTab, setActiveTab] = useState("cohorts");

  // Filter selection for Cascade Tabs
  const [selectedFacultyCode, setSelectedFacultyCode] = useState("");
  const [selectedMajorCode, setSelectedMajorCode] = useState("");

  // Modals state
  const [formModal, setFormModal] = useState({
    isOpen: false,
    type: "cohort",
    mode: "create",
    data: null,
  });

  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    type: "cohort",
    item: null,
  });

  // Queries & Mutations
  const cohortsHook = useAdminCohorts();
  const facultiesHook = useAdminFaculties();
  const majorsHook = useAdminMajors(selectedFacultyCode);
  const subjectsHook = useAdminSubjects(selectedMajorCode);

  // Reset major selection when faculty changes
  useEffect(() => {
    setSelectedMajorCode("");
  }, [selectedFacultyCode]);

  // Handle Create / Edit Submit
  const handleFormSubmit = async (payload) => {
    try {
      if (formModal.type === "cohort") {
        if (formModal.mode === "create") await cohortsHook.createMutation.mutateAsync(payload);
        else await cohortsHook.updateMutation.mutateAsync({ id: formModal.data.id, ...payload });
      } else if (formModal.type === "faculty") {
        if (formModal.mode === "create") await facultiesHook.createMutation.mutateAsync(payload);
        else await facultiesHook.updateMutation.mutateAsync({ id: formModal.data.id, ...payload });
      } else if (formModal.type === "major") {
        if (formModal.mode === "create") await majorsHook.createMutation.mutateAsync(payload);
        else await majorsHook.updateMutation.mutateAsync({ id: formModal.data.id, ...payload });
      } else if (formModal.type === "subject") {
        if (formModal.mode === "create") await subjectsHook.createMutation.mutateAsync(payload);
        else await subjectsHook.updateMutation.mutateAsync({ id: formModal.data.id, ...payload });
      }
      setFormModal({ isOpen: false, type: formModal.type, mode: "create", data: null });
    } catch {
      // Toast already shown in mutation hook
    }
  };

  // Handle Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!confirmDelete.item) return;
    try {
      if (confirmDelete.type === "cohort") {
        await cohortsHook.deleteMutation.mutateAsync(confirmDelete.item.id);
      } else if (confirmDelete.type === "faculty") {
        await facultiesHook.deleteMutation.mutateAsync(confirmDelete.item.id);
      } else if (confirmDelete.type === "major") {
        await majorsHook.deleteMutation.mutateAsync(confirmDelete.item.id);
      } else if (confirmDelete.type === "subject") {
        await subjectsHook.deleteMutation.mutateAsync(confirmDelete.item.id);
      }
      setConfirmDelete({ isOpen: false, type: "cohort", item: null });
    } catch {
      // Toast already shown in mutation hook
    }
  };

  const getActiveLoading = () => {
    if (activeTab === "cohorts") return cohortsHook.cohortsQuery.isLoading;
    if (activeTab === "faculties") return facultiesHook.facultiesQuery.isLoading;
    if (activeTab === "majors") return majorsHook.majorsQuery.isLoading;
    if (activeTab === "subjects") return subjectsHook.subjectsQuery.isLoading;
    return false;
  };

  const getActiveList = () => {
    if (activeTab === "cohorts") return cohortsHook.cohortsQuery.data || [];
    if (activeTab === "faculties") return facultiesHook.facultiesQuery.data || [];
    if (activeTab === "majors") return majorsHook.majorsQuery.data || [];
    if (activeTab === "subjects") return subjectsHook.subjectsQuery.data || [];
    return [];
  };

  const getEntityType = (tab) => {
    switch (tab) {
      case "cohorts":
        return "cohort";
      case "faculties":
        return "faculty";
      case "majors":
        return "major";
      case "subjects":
        return "subject";
      default:
        return "cohort";
    }
  };

  const openCreateModal = () => {
    let parentFilter = null;
    if (activeTab === "majors") parentFilter = selectedFacultyCode;
    if (activeTab === "subjects") parentFilter = selectedMajorCode;

    setFormModal({
      isOpen: true,
      type: getEntityType(activeTab),
      mode: "create",
      data: null,
      parentFilterId: parentFilter,
    });
  };

  const openEditModal = (item) => {
    setFormModal({
      isOpen: true,
      type: getEntityType(activeTab),
      mode: "edit",
      data: item,
      parentFilterId: activeTab === "majors" ? (item.faculty_code || item.faculty?.code) : activeTab === "subjects" ? (item.majors?.[0]?.code || item.major_code) : null,
    });
  };

  const openDeleteModal = (item) => {
    setConfirmDelete({
      isOpen: true,
      type: getEntityType(activeTab),
      item,
    });
  };

  return (
    <PageWrapper title="Quản lý Cấu trúc Học thuật">
      {/* Header Banner */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-brand-admin/10 text-brand-admin flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Quản lý Phân Cấp Học Thuật Toàn Trường
            </h2>
            <p className="text-xs text-text-secondary">
              Cấu trúc 4 tầng: Khóa học (Cohorts) → Khoa (Faculties) → Ngành học (Majors) → Môn học (Subjects)
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={openCreateModal}
          className="bg-brand-admin hover:bg-brand-admin-dark text-white"
        >
          Thêm {activeTab === "cohorts" ? "Khóa học" : activeTab === "faculties" ? "Khoa" : activeTab === "majors" ? "Ngành học" : "Môn học"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={ACADEMIC_TABS}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
          variant="pills"
        />
      </div>

      {/* Cascade Filters for Majors and Subjects */}
      {(activeTab === "majors" || activeTab === "subjects") && (
        <div className="bg-card rounded-2xl p-5 border border-border shadow-2xs mb-6 flex items-center gap-4 flex-wrap bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider shrink-0">
            <Filter className="w-4 h-4 text-brand-admin" />
            <span>Bộ lọc Phân tầng:</span>
          </div>

          {/* Faculty Select */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-sm">
            <label className="text-xs font-semibold text-slate-600 shrink-0">Khoa:</label>
            <select
              value={selectedFacultyCode}
              onChange={(e) => {
                setSelectedFacultyCode(e.target.value);
              }}
              className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-admin/20 focus:border-brand-admin shadow-2xs"
            >
              <option value="">-- Tất cả Khoa --</option>
              {(facultiesHook.facultiesQuery.data || []).map((f) => {
                const fCode = f.code || f.faculty_code;
                return (
                  <option key={f.id} value={fCode}>
                    {f.name} ({fCode})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Major Select (Only for Subjects Tab) */}
          {activeTab === "subjects" && (
            <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-sm">
              <label className="text-xs font-semibold text-slate-600 shrink-0">Ngành:</label>
              <select
                value={selectedMajorCode}
                onChange={(e) => setSelectedMajorCode(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-admin/20 focus:border-brand-admin shadow-2xs"
              >
                <option value="">-- Tất cả Ngành học --</option>
                {(majorsHook.majorsQuery.data || []).map((m) => {
                  const mCode = m.code || m.major_code;
                  return (
                    <option key={m.id} value={mCode}>
                      {m.name} ({mCode})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs">
        {getActiveLoading() ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : getActiveList().length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-1">
              Chưa có dữ liệu cho mục này
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mb-4">
              {activeTab === "majors" && !selectedFacultyCode
                ? "Danh sách tất cả Ngành học hiện đang trống hoặc chọn Khoa phía trên để lọc."
                : activeTab === "subjects" && !selectedMajorCode
                ? "Danh sách tất cả Môn học hiện đang trống hoặc chọn Ngành phía trên để lọc."
                : "Danh sách hiện đang trống. Nhấn nút Thêm mới ở góc trên để tạo bản ghi đầu tiên."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/50">
                  <th className="py-3 px-3.5 rounded-l-xl">ID</th>
                  <th className="py-3 px-3.5">Mã Code</th>
                  <th className="py-3 px-3.5">Tên hiển thị</th>
                  {activeTab === "cohorts" && <th className="py-3 px-3.5">Giai đoạn</th>}
                  {(activeTab === "faculties" || activeTab === "majors" || activeTab === "subjects") && (
                    <th className="py-3 px-3.5">Mô tả / Ghi chú</th>
                  )}
                  <th className="py-3 px-3.5 text-right rounded-r-xl">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {getActiveList().map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-3.5 font-mono text-xs text-slate-400 font-bold">
                      #{item.id}
                    </td>
                    <td className="py-3.5 px-3.5 font-mono font-bold text-brand-admin text-xs">
                      {item.code || item.cohort_code || item.faculty_code || item.major_code || item.subject_code}
                    </td>
                    <td className="py-3.5 px-3.5 font-bold text-text-primary">
                      {item.name}
                    </td>
                    {activeTab === "cohorts" && (
                      <td className="py-3.5 px-3.5 text-xs text-text-secondary font-medium">
                        {item.start_year} - {item.end_year} ({item.end_year - item.start_year} năm)
                      </td>
                    )}
                    {(activeTab === "faculties" || activeTab === "majors" || activeTab === "subjects") && (
                      <td className="py-3.5 px-3.5 text-xs text-text-secondary truncate max-w-[300px]">
                        {item.description || "—"}
                      </td>
                    )}
                    <td className="py-3.5 px-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa bản ghi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AcademicFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal((prev) => ({ ...prev, isOpen: false }))}
        type={formModal.type}
        mode={formModal.mode}
        initialData={formModal.data}
        parentFilterId={formModal.parentFilterId}
        onSubmit={handleFormSubmit}
        isLoading={
          cohortsHook.createMutation.isPending ||
          cohortsHook.updateMutation.isPending ||
          facultiesHook.createMutation.isPending ||
          facultiesHook.updateMutation.isPending ||
          majorsHook.createMutation.isPending ||
          majorsHook.updateMutation.isPending ||
          subjectsHook.createMutation.isPending ||
          subjectsHook.updateMutation.isPending
        }
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, type: "cohort", item: null })}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa bản ghi"
        description={`Bạn có chắc chắn muốn xóa "${
          confirmDelete.item?.name || ""
        }" (${
          confirmDelete.item?.code ||
          confirmDelete.item?.cohort_code ||
          confirmDelete.item?.faculty_code ||
          confirmDelete.item?.major_code ||
          confirmDelete.item?.subject_code ||
          ""
        }) khỏi hệ thống? Hành động này có thể ảnh hưởng đến các tài liệu hoặc sinh viên trực thuộc.`}
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy"
        variant="danger"
        loading={
          cohortsHook.deleteMutation.isPending ||
          facultiesHook.deleteMutation.isPending ||
          majorsHook.deleteMutation.isPending ||
          subjectsHook.deleteMutation.isPending
        }
      />
    </PageWrapper>
  );
}
