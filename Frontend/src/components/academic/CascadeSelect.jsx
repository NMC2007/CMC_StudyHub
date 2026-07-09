/**
 * CascadeSelect.jsx
 * Component chọn phân cấp học thuật liên kết: Khóa học → Khoa → Ngành học → Môn học.
 *
 * Tái sử dụng đa năng trong 4 ngữ cảnh (theo `mode`):
 *  1. STUDENT_REGISTER  — Khóa → Khoa → Ngành (bắt buộc chọn cả 3).
 *  2. LECTURER_REGISTER — Chỉ chọn Khoa (bắt buộc).
 *  3. FULL              — Khóa → Khoa → Ngành → Môn học (chọn 4 tầng tự do cho Admin, Lecturer upload, Tìm kiếm).
 *  4. STUDENT_UPLOAD (hoặc isLocked=true) — Khóa/Khoa/Ngành được khóa readonly từ `lockedValues` (hồ sơ sinh viên), chỉ cho phép chọn Môn học thuộc chính ngành của sinh viên.
 *
 * Tính năng nổi bật:
 *  - Tự động xóa (reset) dữ liệu tầng dưới khi đổi tầng trên.
 *  - Tích hợp mượt mà với TanStack Query (`useCohorts`, `useFaculties`, `useMajors`, `useSubjects`).
 *  - Tích hợp hoàn hảo với React Hook Form hoặc state React thông thường qua `values` & `onChange`.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 7.5 (CascadeSelect) & 10 (STUDENT Upload Guard).
 */
import React from 'react';
import { GraduationCap, Lock } from 'lucide-react';
import Select from '#/components/ui/Select';
import {
  useCohorts,
  useFaculties,
  useMajors,
  useSubjects,
} from '#/hooks/useAcademic';

export default function CascadeSelect({
  mode = 'FULL',
  values = {},
  onChange = () => {},
  errors = {},
  isLocked = false,
  lockedValues = {},
  disabled = false,
  required = false,
  wrapperClassName = '',
  showTitle = false,
  titleText = 'Thông tin học thuật',
}) {
  // Xác định các trường cần hiển thị dựa vào mode
  const isStudentRegister = mode === 'STUDENT_REGISTER';
  const isLecturerRegister = mode === 'LECTURER_REGISTER';
  const isStudentUpload = mode === 'STUDENT_UPLOAD' || isLocked;
  const isFull = mode === 'FULL' && !isStudentUpload;

  // ─── TanStack Query hooks ──────────────────────────────────────────────────
  // 1. Cohorts: Luôn fetch nếu cần hiển thị cohort
  const { data: cohortsData, isLoading: cohortsLoading } = useCohorts({
    enabled: isStudentRegister || isFull || isStudentUpload,
  });

  const rawCohorts = cohortsData?.cohorts || cohortsData || [];
  const cohortCode = isStudentUpload
    ? (lockedValues.cohort_code || values.cohort_code || rawCohorts.find((c) => String(c.id) === String(lockedValues.cohort_id || values.cohort_id))?.code || '')
    : (values.cohort_code || rawCohorts.find((c) => String(c.id) === String(values.cohort_id))?.code || '');

  // 2. Faculties: Luôn fetch khi hiển thị faculty (dùng chung cho toàn trường)
  const { data: facultiesData, isLoading: facultiesLoading } = useFaculties(cohortCode, {
    enabled: isStudentRegister || isLecturerRegister || isFull || isStudentUpload,
  });

  const rawFaculties = facultiesData?.faculties || facultiesData || [];
  const facultyCode = isStudentUpload
    ? (lockedValues.faculty_code || values.faculty_code || rawFaculties.find((f) => String(f.id) === String(lockedValues.faculty_id || values.faculty_id))?.code || '')
    : (values.faculty_code || rawFaculties.find((f) => String(f.id) === String(values.faculty_id))?.code || '');

  // 3. Majors: Chỉ fetch khi có facultyCode
  const { data: majorsData, isLoading: majorsLoading } = useMajors(facultyCode, {
    enabled: (isStudentRegister || isFull || isStudentUpload) && !!facultyCode,
  });

  const rawMajors = majorsData?.majors || majorsData || [];
  const majorCode = isStudentUpload
    ? (lockedValues.major_code || values.major_code || rawMajors.find((m) => String(m.id) === String(lockedValues.major_id || values.major_id))?.code || '')
    : (values.major_code || rawMajors.find((m) => String(m.id) === String(values.major_id))?.code || '');

  // 4. Subjects: Chỉ fetch trong mode FULL hoặc STUDENT_UPLOAD khi có majorCode
  const { data: subjectsData, isLoading: subjectsLoading } = useSubjects(majorCode, {
    enabled: (isFull || isStudentUpload) && !!majorCode,
  });

  const rawSubjects = subjectsData?.subjects || subjectsData || [];
  const subjectCode = values.subject_code || rawSubjects.find((s) => String(s.id) === String(values.subject_id))?.code || '';

  // ─── Options Mapping ───────────────────────────────────────────────────────
  const cohortsOptions = rawCohorts.map((c) => ({
    value: c.code,
    label: c.name || `${c.code} (${c.start_year}–${c.end_year})`,
  }));

  const facultiesOptions = rawFaculties.map((f) => ({
    value: f.code,
    label: f.name,
  }));

  const majorsOptions = rawMajors.map((m) => ({
    value: m.code,
    label: m.name,
  }));

  const subjectsOptions = rawSubjects.map((s) => ({
    value: s.code,
    label: `${s.code} — ${s.name}`,
  }));

  // Helper tìm tên hiển thị khi bị khóa readonly
  const getCohortLabel = (code) => {
    const found = cohortsOptions.find((o) => o.value === code);
    return found ? found.label : code || 'N/A';
  };

  const getFacultyLabel = (code) => {
    const found = facultiesOptions.find((o) => o.value === code);
    return found ? found.label : code || 'N/A';
  };

  const getMajorLabel = (code) => {
    const found = majorsOptions.find((o) => o.value === code);
    return found ? found.label : code || 'N/A';
  };

  // Check required cho từng dropdown
  const isRequired = (field) => {
    if (typeof required === 'object' && required !== null) {
      return !!required[field];
    }
    return !!required;
  };

  // ─── Handlers thay đổi với Cascade Reset ───────────────────────────────────
  const handleCohortChange = (e) => {
    const newCohortCode = e.target.value;
    const found = rawCohorts.find((c) => c.code === newCohortCode);
    onChange({
      ...values,
      cohort_code: found ? found.code : newCohortCode,
      cohort_id: found ? found.id : null,
      faculty_code: '',
      faculty_id: null,
      major_code: '',
      major_id: null,
      subject_code: '',
      subject_id: null,
    });
  };

  const handleFacultyChange = (e) => {
    const newFacultyCode = e.target.value;
    const found = rawFaculties.find((f) => f.code === newFacultyCode);
    onChange({
      ...values,
      faculty_code: found ? found.code : newFacultyCode,
      faculty_id: found ? found.id : null,
      major_code: '',
      major_id: null,
      subject_code: '',
      subject_id: null,
    });
  };

  const handleMajorChange = (e) => {
    const newMajorCode = e.target.value;
    const found = rawMajors.find((m) => m.code === newMajorCode);
    onChange({
      ...values,
      major_code: found ? found.code : newMajorCode,
      major_id: found ? found.id : null,
      subject_code: '',
      subject_id: null,
    });
  };

  const handleSubjectChange = (e) => {
    const newSubjectCode = e.target.value;
    const found = rawSubjects.find((s) => s.code === newSubjectCode);
    onChange({
      ...values,
      subject_code: found ? found.code : newSubjectCode,
      subject_id: found ? found.id : null,
    });
  };

  return (
    <div className={`flex flex-col gap-3.5 w-full ${wrapperClassName}`}>
      {/* Optional Title Header */}
      {showTitle && (
        <div className="flex items-center gap-2 mb-0.5">
          <GraduationCap className="w-5 h-5 text-brand-student" />
          <span className="text-sm font-semibold text-text-primary">{titleText}</span>
        </div>
      )}

      {/* ─── CHẾ ĐỘ KHÓA (STUDENT UPLOAD GUARD) ─── */}
      {isStudentUpload ? (
        <div className="flex flex-col gap-3.5">
          {/* Box hiển thị thông tin học thuật đã bị khóa */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-student" />
                Thông tin học thuật (Mặc định theo hồ sơ)
              </span>
              <span className="text-[11px] text-brand-student font-semibold px-2 py-0.5 bg-brand-student-light rounded-full">
                Sinh viên
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Khóa học:</span>
                <span className="font-semibold text-slate-700 truncate block">
                  {cohortsLoading ? 'Đang tải...' : getCohortLabel(cohortCode)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Khoa:</span>
                <span className="font-semibold text-slate-700 truncate block">
                  {facultiesLoading ? 'Đang tải...' : getFacultyLabel(facultyCode)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Ngành học:</span>
                <span className="font-semibold text-slate-700 truncate block">
                  {majorsLoading ? 'Đang tải...' : getMajorLabel(majorCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Dropdown chọn Môn học (Cho phép chọn Môn thuộc Ngành) */}
          <Select
            label="Môn học"
            placeholder={
              !majorCode
                ? 'Đang xác định Ngành học...'
                : subjectsLoading
                  ? 'Đang tải danh sách Môn học...'
                  : 'Chọn Môn học của bạn'
            }
            options={subjectsOptions}
            required={isRequired('subject')}
            disabled={disabled || !majorCode || subjectsLoading}
            error={errors.subject_code}
            value={subjectCode}
            onChange={handleSubjectChange}
          />
        </div>
      ) : isLecturerRegister ? (
        /* ─── CHẾ ĐỘ ĐĂNG KÝ GIẢNG VIÊN (Chỉ chọn Khoa) ─── */
        <Select
          label="Khoa"
          placeholder={facultiesLoading ? 'Đang tải...' : 'Chọn Khoa'}
          options={facultiesOptions}
          required={isRequired('faculty') || isRequired(true)}
          disabled={disabled || facultiesLoading}
          error={errors.faculty_code}
          value={facultyCode}
          onChange={handleFacultyChange}
        />
      ) : (
        /* ─── CHẾ ĐỘ ĐĂNG KÝ SINH VIÊN HOẶC CHỌN ĐẦY ĐỦ ─── */
        <div className="flex flex-col gap-3.5">
          {/* Cohort Select */}
          <Select
            label="Khóa học"
            placeholder={cohortsLoading ? 'Đang tải...' : 'Chọn Khóa học'}
            options={cohortsOptions}
            required={isRequired('cohort') || isStudentRegister}
            disabled={disabled || cohortsLoading}
            error={errors.cohort_code}
            value={cohortCode}
            onChange={handleCohortChange}
          />

          {/* Faculty Select */}
          <Select
            label="Khoa"
            placeholder={
              !cohortCode
                ? 'Vui lòng chọn Khóa trước'
                : facultiesLoading
                  ? 'Đang tải...'
                  : 'Chọn Khoa'
            }
            options={facultiesOptions}
            required={isRequired('faculty') || isStudentRegister}
            disabled={disabled || !cohortCode || facultiesLoading}
            error={errors.faculty_code}
            value={facultyCode}
            onChange={handleFacultyChange}
          />

          {/* Major Select */}
          <Select
            label="Ngành học"
            placeholder={
              !facultyCode
                ? 'Vui lòng chọn Khoa trước'
                : majorsLoading
                  ? 'Đang tải...'
                  : 'Chọn Ngành'
            }
            options={majorsOptions}
            required={isRequired('major') || isStudentRegister}
            disabled={disabled || !facultyCode || majorsLoading}
            error={errors.major_code}
            value={majorCode}
            onChange={handleMajorChange}
          />

          {/* Subject Select (Chỉ hiển thị trong mode FULL) */}
          {isFull && (
            <Select
              label="Môn học"
              placeholder={
                !majorCode
                  ? 'Vui lòng chọn Ngành trước'
                  : subjectsLoading
                    ? 'Đang tải...'
                    : 'Chọn Môn học'
              }
              options={subjectsOptions}
              required={isRequired('subject')}
              disabled={disabled || !majorCode || subjectsLoading}
              error={errors.subject_code}
              value={subjectCode}
              onChange={handleSubjectChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
