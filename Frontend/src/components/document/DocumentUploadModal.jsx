/**
 * DocumentUploadModal.jsx
 * Modal tải lên tài liệu mới — hỗ trợ nghiệp vụ upload cho cả Sinh viên (Student) và Giảng viên (Lecturer).
 *
 * Nghiệp vụ (STUDHUB_FE.md Mục 10 & 18):
 *  - Sử dụng FileDropzone để chọn file (.pdf, .docx, .pptx, .zip, ≤50MB).
 *  - Form validation bằng React Hook Form + Zod (uploadDocumentSchema).
 *  - Student Upload Guard:
 *      + Khóa/Khoa/Ngành tự động điền từ thông tin hồ sơ (Zustand store).
 *      + Chỉ cho phép chọn Môn học thuộc chuyên ngành của sinh viên.
 *  - Lecturer Upload:
 *      + Có thể tự do chọn Khóa, Khoa, Ngành và Môn học.
 *  - Khi submit, đóng gói FormData và gọi useUploadDocument mutation.
 */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText, Globe, Lock, Users, BookOpen } from 'lucide-react';

import Modal from '#/components/ui/Modal';
import Button from '#/components/ui/Button';
import Input from '#/components/ui/Input';
import Select from '#/components/ui/Select';
import FileDropzone from '#/components/ui/FileDropzone';
import CascadeSelect from '#/components/academic/CascadeSelect';
import { UPLOAD_CONFIG } from '#/config/constants';
import { useAuthStore } from '#/stores/useAuthStore';
import { useUploadDocument } from '#/hooks/useDocuments';
import { uploadDocumentSchema } from '#/utils/validators';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'DOCUMENT', label: 'Tài liệu / Giáo trình' },
  { value: 'SLIDE', label: 'Bài giảng / Slide' },
  { value: 'ASSIGNMENT', label: 'Bài tập / Đề tài' },
  { value: 'EXAM', label: 'Đề thi / Kiểm tra' },
  { value: 'REFERENCE', label: 'Tài liệu tham khảo' },
];

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Công khai — Mọi người đều có thể xem' },
  { value: 'PRIVATE', label: 'Riêng tư — Chỉ mình tôi có thể xem' },
];

export default function DocumentUploadModal({
  isOpen = false,
  onClose = () => {},
  defaultVisibility = 'PUBLIC',
}) {
  const user = useAuthStore((s) => s.user);
  const isStudent = user?.role === 'STUDENT';

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const uploadMutation = useUploadDocument();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      title: '',
      description: '',
      document_type: 'DOCUMENT',
      visibility: defaultVisibility,
      subject_id: '',
      cohort_code: isStudent ? user?.cohort_code || '' : '',
      cohort_id: isStudent ? user?.cohort_id || null : null,
      faculty_code: isStudent ? user?.faculty_code || '' : '',
      faculty_id: isStudent ? user?.faculty_id || null : null,
      major_code: isStudent ? user?.major_code || '' : '',
      major_id: isStudent ? user?.major_id || null : null,
    },
  });

  // Khi mở modal, tự động set các giá trị ban đầu và pre-fill hồ sơ học thuật cho sinh viên
  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        description: '',
        document_type: 'DOCUMENT',
        visibility: defaultVisibility,
        subject_id: '',
        cohort_code: isStudent ? user?.cohort_code || '' : '',
        cohort_id: isStudent ? user?.cohort_id || null : null,
        faculty_code: isStudent ? user?.faculty_code || '' : '',
        faculty_id: isStudent ? user?.faculty_id || null : null,
        major_code: isStudent ? user?.major_code || '' : '',
        major_id: isStudent ? user?.major_id || null : null,
      });
      setSelectedFile(null);
      setFileError('');
    }
  }, [isOpen, defaultVisibility, user, reset]);

  // Quản lý thay đổi từ CascadeSelect
  const cascadeValues = {
    cohort_code: watch('cohort_code'),
    cohort_id: watch('cohort_id'),
    faculty_code: watch('faculty_code'),
    faculty_id: watch('faculty_id'),
    major_code: watch('major_code'),
    major_id: watch('major_id'),
    subject_code: watch('subject_code') || '',
    subject_id: watch('subject_id') || '',
  };

  const handleCascadeChange = (newVals) => {
    setValue('cohort_code', newVals.cohort_code || '');
    setValue('cohort_id', newVals.cohort_id || null);
    setValue('faculty_code', newVals.faculty_code || '');
    setValue('faculty_id', newVals.faculty_id || null);
    setValue('major_code', newVals.major_code || '');
    setValue('major_id', newVals.major_id || null);
    setValue('subject_code', newVals.subject_code || '');
    setValue('subject_id', newVals.subject_id ? Number(newVals.subject_id) : '', {
      shouldValidate: true,
    });
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    if (file) {
      setFileError('');
      // Nếu chưa nhập tiêu đề, lấy tên file làm tiêu đề mặc định (bỏ đuôi mở rộng)
      const currentTitle = watch('title');
      if (!currentTitle || currentTitle.trim() === '') {
        const titleFromName = file.name.replace(/\.[^/.]+$/, '');
        setValue('title', titleFromName, { shouldValidate: true });
      }
    }
  };

  const onSubmit = (data) => {
    if (!selectedFile) {
      setFileError('Vui lòng chọn file tài liệu cần tải lên');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', data.title.trim());
    if (data.description && data.description.trim() !== '') {
      formData.append('description', data.description.trim());
    }
    formData.append('document_type', data.document_type);
    formData.append('visibility', data.visibility);
    formData.append('subject_id', Number(data.subject_id));

    if (isStudent) {
      // Đối với sinh viên, luôn bắt buộc gửi đúng ID học thuật từ profile user
      if (user?.cohort_id) formData.append('cohort_id', user.cohort_id);
      if (user?.faculty_id) formData.append('faculty_id', user.faculty_id);
      if (user?.major_id) formData.append('major_id', user.major_id);
    } else {
      // Đối với giảng viên hoặc admin, gửi ID từ dropdown nếu đã chọn
      if (data.cohort_id) formData.append('cohort_id', data.cohort_id);
      if (data.faculty_id) formData.append('faculty_id', data.faculty_id);
      if (data.major_id) formData.append('major_id', data.major_id);
    }

    uploadMutation.mutate(formData, {
      onSuccess: () => {
        reset();
        setSelectedFile(null);
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tải lên tài liệu mới"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={uploadMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            icon={Upload}
            onClick={handleSubmit(onSubmit)}
            loading={uploadMutation.isPending}
          >
            Tải lên tài liệu
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* 1. Chọn file (FileDropzone) */}
        <div>
          <FileDropzone
            label="File tài liệu (*)"
            helperText={UPLOAD_CONFIG.DOC.LABEL}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            error={fileError}
            disabled={uploadMutation.isPending}
          />
        </div>

        {/* 2. Tiêu đề tài liệu */}
        <Input
          label="Tiêu đề tài liệu"
          placeholder="Nhập tiêu đề tài liệu rõ ràng, dễ tìm kiếm..."
          icon={FileText}
          required
          error={errors.title}
          disabled={uploadMutation.isPending}
          {...register('title')}
        />

        {/* 3. Mô tả ngắn */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mô tả tài liệu
          </label>
          <textarea
            placeholder="Ghi chú thêm về tài liệu (VD: Chương 1-3 môn Java, tài liệu ôn thi cuối kỳ...)"
            rows={3}
            disabled={uploadMutation.isPending}
            {...register('description')}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none resize-none ${
              errors.description
                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-slate-200 bg-white focus:border-brand-student focus:ring-2 focus:ring-brand-student-light'
            } disabled:bg-slate-100 disabled:text-slate-400`}
          />
          {errors.description && (
            <p className="text-xs text-red-500 font-medium mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* 4. 2 cột: Loại tài liệu & Quyền hiển thị */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Loại tài liệu"
            options={DOCUMENT_TYPE_OPTIONS}
            required
            error={errors.document_type}
            disabled={uploadMutation.isPending}
            value={watch('document_type')}
            onChange={(e) => setValue('document_type', e.target.value)}
          />

          <Select
            label="Phạm vi hiển thị"
            options={VISIBILITY_OPTIONS}
            required
            error={errors.visibility}
            disabled={uploadMutation.isPending}
            value={watch('visibility')}
            onChange={(e) => setValue('visibility', e.target.value)}
          />
        </div>

        {/* 5. Phân cấp học thuật (CascadeSelect) */}
        <div className="pt-2 border-t border-slate-100">
          <CascadeSelect
            mode={isStudent ? 'STUDENT_UPLOAD' : 'FULL'}
            isLocked={isStudent}
            lockedValues={{
              cohort_code: user?.cohort_code,
              cohort_id: user?.cohort_id,
              faculty_code: user?.faculty_code,
              faculty_id: user?.faculty_id,
              major_code: user?.major_code,
              major_id: user?.major_id,
            }}
            values={cascadeValues}
            onChange={handleCascadeChange}
            errors={{
              subject_code: errors.subject_id ? errors.subject_id.message : '',
              cohort_code: errors.cohort_id ? errors.cohort_id.message : '',
              faculty_code: errors.faculty_id ? errors.faculty_id.message : '',
              major_code: errors.major_id ? errors.major_id.message : '',
            }}
            required={true}
            disabled={uploadMutation.isPending}
            showTitle={true}
            titleText="Phân loại học thuật & Môn học (*)"
          />
        </div>
      </form>
    </Modal>
  );
}
