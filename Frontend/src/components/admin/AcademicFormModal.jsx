/**
 * AcademicFormModal.jsx
 * Modal đa năng thêm mới hoặc chỉnh sửa các đối tượng học thuật: Khóa, Khoa, Ngành, Môn.
 */
import React, { useState, useEffect } from "react";
import Modal from "#/components/ui/Modal";
import Input from "#/components/ui/Input";
import Button from "#/components/ui/Button";
import { useAdminFaculties, useAdminMajors } from "#/hooks/useAdmin";

export default function AcademicFormModal({
  isOpen,
  onClose,
  type, // "cohort" | "faculty" | "major" | "subject"
  mode = "create", // "create" | "edit"
  initialData = null,
  parentFilterId = null, // facultyId cho Major, hoặc majorId cho Subject
  onSubmit,
  isLoading = false,
}) {
  const { facultiesQuery } = useAdminFaculties();
  const { majorsQuery } = useAdminMajors(
    type === "subject" ? initialData?.major_id || parentFilterId : null,
  );

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (mode === "edit" && initialData) {
        setFormData({
          ...initialData,
          code:
            initialData.code ||
            initialData.cohort_code ||
            initialData.faculty_code ||
            initialData.major_code ||
            initialData.subject_code ||
            "",
          faculty_code:
            initialData.faculty_code ||
            (initialData.faculty ? initialData.faculty.code : "") ||
            parentFilterId ||
            "",
          major_code:
            initialData.majors?.[0]?.code ||
            initialData.major_code ||
            parentFilterId ||
            "",
        });
      } else {
        // Create defaults
        if (type === "cohort") {
          const currentYear = new Date().getFullYear();
          setFormData({
            code: "",
            name: "",
            start_year: currentYear,
            end_year: currentYear + 4,
          });
        } else if (type === "faculty") {
          setFormData({
            code: "",
            name: "",
            description: "",
          });
        } else if (type === "major") {
          setFormData({
            code: "",
            name: "",
            faculty_code: parentFilterId || "",
            description: "",
          });
        } else if (type === "subject") {
          setFormData({
            code: "",
            name: "",
            major_code: parentFilterId || "",
            description: "",
          });
        }
      }
    }
  }, [isOpen, type, mode, initialData, parentFilterId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (type === "cohort") {
      if (!formData.code?.trim()) newErrors.code = "Mã khóa học bắt buộc nhập";
      if (!formData.name?.trim()) newErrors.name = "Tên khóa học bắt buộc nhập";
      if (!formData.start_year)
        newErrors.start_year = "Năm bắt đầu không hợp lệ";
      if (!formData.end_year) newErrors.end_year = "Năm kết thúc không hợp lệ";
      if (Number(formData.start_year) > Number(formData.end_year)) {
        newErrors.end_year = "Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu";
      }
    } else if (type === "faculty") {
      if (!formData.code?.trim()) newErrors.code = "Mã khoa bắt buộc nhập";
      if (!formData.name?.trim()) newErrors.name = "Tên khoa bắt buộc nhập";
    } else if (type === "major") {
      if (!formData.code?.trim()) newErrors.code = "Mã ngành bắt buộc nhập";
      if (!formData.name?.trim()) newErrors.name = "Tên ngành bắt buộc nhập";
      if (!formData.faculty_code)
        newErrors.faculty_code = "Vui lòng chọn Khoa trực thuộc";
    } else if (type === "subject") {
      if (!formData.code?.trim()) newErrors.code = "Mã môn học bắt buộc nhập";
      if (!formData.name?.trim()) newErrors.name = "Tên môn học bắt buộc nhập";
      if (!formData.major_code)
        newErrors.major_code = "Vui lòng chọn Ngành trực thuộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert fields where necessary
    const payload = { ...formData };
    if (type === "cohort") {
      payload.start_year = Number(payload.start_year);
      payload.end_year = Number(payload.end_year);
    } else if (type === "subject") {
      payload.major_codes = [payload.major_code];
    }

    onSubmit(payload);
  };

  const getTitle = () => {
    const action = mode === "edit" ? "Chỉnh sửa" : "Thêm mới";
    if (type === "cohort") return `${action} Khóa học (Cohort)`;
    if (type === "faculty") return `${action} Khoa (Faculty)`;
    if (type === "major") return `${action} Ngành học (Major)`;
    if (type === "subject") return `${action} Môn học (Subject)`;
    return action;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* COHORT FIELDS */}
        {type === "cohort" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mã Khóa học"
                placeholder="VD: K16, K17..."
                value={formData.code || ""}
                onChange={(e) => handleChange("code", e.target.value)}
                error={errors.code}
              />
              <Input
                label="Tên hiển thị"
                placeholder="VD: Khóa 2021 - 2025"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Năm bắt đầu"
                type="number"
                value={formData.start_year || ""}
                onChange={(e) => handleChange("start_year", e.target.value)}
                error={errors.start_year}
              />
              <Input
                label="Năm kết thúc"
                type="number"
                value={formData.end_year || ""}
                onChange={(e) => handleChange("end_year", e.target.value)}
                error={errors.end_year}
              />
            </div>
          </>
        )}

        {/* FACULTY FIELDS */}
        {type === "faculty" && (
          <>
            <Input
              label="Mã Khoa"
              placeholder="VD: CNTT, QTKD, NN..."
              value={formData.code || ""}
              onChange={(e) => handleChange("code", e.target.value)}
              error={errors.code}
            />
            <Input
              label="Tên Khoa"
              placeholder="VD: Khoa Công nghệ Thông tin"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
            />
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Mô tả ngắn
              </label>
              <textarea
                rows={3}
                placeholder="Nhập mô tả cho Khoa..."
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-admin/20 focus:border-brand-admin"
              />
            </div>
          </>
        )}

        {/* MAJOR FIELDS */}
        {type === "major" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Khoa trực thuộc <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.faculty_code || ""}
                onChange={(e) => handleChange("faculty_code", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-admin/20 focus:border-brand-admin font-medium"
              >
                <option value="">-- Chọn Khoa --</option>
                {(facultiesQuery.data || []).map((f) => (
                  <option key={f.id} value={f.code}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
              {errors.faculty_code && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.faculty_code}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mã Ngành"
                placeholder="VD: BIT, SE, AI..."
                value={formData.code || ""}
                onChange={(e) => handleChange("code", e.target.value)}
                error={errors.code}
              />
              <Input
                label="Tên Ngành"
                placeholder="VD: Công nghệ Thông tin"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Mô tả ngắn
              </label>
              <textarea
                rows={2}
                placeholder="Nhập mô tả ngành học..."
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-admin/20 focus:border-brand-admin"
              />
            </div>
          </>
        )}

        {/* SUBJECT FIELDS */}
        {type === "subject" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Ngành trực thuộc <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.major_code || ""}
                onChange={(e) => handleChange("major_code", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-admin/20 focus:border-brand-admin font-medium"
              >
                <option value="">-- Chọn Ngành học --</option>
                {(majorsQuery.data || []).map((m) => (
                  <option key={m.id} value={m.code}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
              {errors.major_code && (
                <p className="text-xs text-red-600 mt-1">{errors.major_code}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mã Môn học"
                placeholder="VD: CS101, IT202..."
                value={formData.code || ""}
                onChange={(e) => handleChange("code", e.target.value)}
                error={errors.code}
              />
              <Input
                label="Tên Môn học"
                placeholder="VD: Cấu trúc dữ liệu & Giải thuật"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Mô tả ngắn
              </label>
              <textarea
                rows={2}
                placeholder="Nhập mô tả môn học..."
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-admin/20 focus:border-brand-admin"
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button type="submit" loading={isLoading}>
            {mode === "edit" ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
