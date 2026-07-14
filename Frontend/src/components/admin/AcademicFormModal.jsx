/**
 * AcademicFormModal.jsx
 * Modal đa năng thêm mới hoặc chỉnh sửa các đối tượng học thuật: Khóa, Khoa, Ngành, Môn.
 * Subject hỗ trợ chọn nhiều Ngành (major_codes: string[]) theo đúng API spec.
 */
import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Check } from "lucide-react";
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
  // Load toàn bộ ngành học (không filter theo khoa) để Subject multi-select dùng
  const { majorsQuery } = useAdminMajors(null);

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [majorSearch, setMajorSearch] = useState("");
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState("");

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setMajorSearch("");
      setSelectedFacultyFilter("");
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
          // Subject edit: lấy toàn bộ code từ mảng majors trả về
          major_codes: initialData.majors?.map((m) => m.code) || [],
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
            // Nếu đang lọc theo ngành thì pre-select ngành đó
            major_codes: parentFilterId ? [parentFilterId] : [],
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

  // Toggle chọn/bỏ chọn một ngành trong danh sách major_codes
  const toggleMajorCode = (code) => {
    setFormData((prev) => {
      const current = prev.major_codes || [];
      const next = current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code];
      return { ...prev, major_codes: next };
    });
    if (errors.major_codes) {
      setErrors((prev) => ({ ...prev, major_codes: null }));
    }
  };

  // Lọc danh sách ngành: theo Khoa trước, sau đó theo từ khóa tìm kiếm
  const filteredMajors = useMemo(() => {
    let list = majorsQuery.data || [];
    // Bước 1: lọc theo khoa (nếu có chọn)
    if (selectedFacultyFilter) {
      list = list.filter(
        (m) => (m.faculty_code || m.faculty?.code) === selectedFacultyFilter,
      );
    }
    // Bước 2: lọc theo từ khóa tìm kiếm
    if (majorSearch.trim()) {
      const q = majorSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.code || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [majorsQuery.data, majorSearch, selectedFacultyFilter]);

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
      if (!formData.major_codes || formData.major_codes.length === 0)
        newErrors.major_codes = "Vui lòng chọn ít nhất 1 Ngành trực thuộc";
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
    }
    // subject: major_codes đã là array, gửi thẳng lên API

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
            {/* --- Multi-select Ngành trực thuộc --- */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Ngành trực thuộc <span className="text-red-500">*</span>
                  <span className="ml-1 text-slate-400 normal-case font-normal">
                    (có thể chọn nhiều)
                  </span>
                </label>
                {(formData.major_codes || []).length > 0 && (
                  <span className="text-xs font-bold text-brand-admin bg-brand-admin/10 px-2 py-0.5 rounded-full">
                    {formData.major_codes.length} đã chọn
                  </span>
                )}
              </div>

              {/* Bộ lọc theo Khoa */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="relative">
                  <select
                    value={selectedFacultyFilter}
                    onChange={(e) => {
                      setSelectedFacultyFilter(e.target.value);
                      setMajorSearch(""); // reset search khi đổi khoa
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-admin/20 focus:border-brand-admin font-medium appearance-none"
                  >
                    <option value="">Tất cả Khoa</option>
                    {(facultiesQuery.data || []).map((f) => (
                      <option key={f.id} value={f.code || f.faculty_code}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ô tìm kiếm */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tìm tên / mã ngành..."
                    value={majorSearch}
                    onChange={(e) => setMajorSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-admin/20 focus:border-brand-admin"
                  />
                </div>
              </div>

              {/* Danh sách checkbox có scroll */}
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
                {majorsQuery.isLoading ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Đang tải danh sách ngành...
                  </div>
                ) : filteredMajors.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    {majorSearch || selectedFacultyFilter
                      ? "Không tìm thấy ngành phù hợp với bộ lọc"
                      : "Chưa có ngành học nào trong hệ thống"}
                  </div>
                ) : (
                  filteredMajors.map((m) => {
                    const mCode = m.code || m.major_code;
                    const isChecked = (formData.major_codes || []).includes(
                      mCode,
                    );
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors select-none ${
                          isChecked ? "bg-brand-admin/5" : "hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                            isChecked
                              ? "bg-brand-admin border-brand-admin"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && (
                            <Check
                              className="w-2.5 h-2.5 text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={() => toggleMajorCode(mCode)}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-text-primary">
                            {m.name}
                          </span>
                          <span className="ml-2 text-xs font-mono text-slate-400">
                            ({mCode})
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Tags các ngành đã chọn */}
              {(formData.major_codes || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.major_codes.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-brand-admin/10 text-brand-admin text-xs font-bold rounded-lg"
                    >
                      {code}
                      <button
                        type="button"
                        onClick={() => toggleMajorCode(code)}
                        className="hover:text-brand-admin-dark cursor-pointer leading-none"
                        aria-label={`Bỏ chọn ngành ${code}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {errors.major_codes && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.major_codes}
                </p>
              )}
            </div>

            {/* --- Mã & Tên môn học --- */}
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
