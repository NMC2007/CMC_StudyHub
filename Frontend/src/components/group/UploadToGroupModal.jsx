/**
 * UploadToGroupModal.jsx
 * Modal tải trực tiếp tài liệu mới vào Nhóm học tập (`useUploadGroupDocument`).
 *
 * Nghiệp vụ:
 *  - Mặc định và khóa cứng phạm vi hiển thị là `GROUP` (Nhóm học tập).
 *  - Gửi dữ liệu tới API POST `/api/v1/groups/:groupId/documents/upload`.
 */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText, Users } from 'lucide-react';

import Modal from '#/components/ui/Modal';
import Button from '#/components/ui/Button';
import Input from '#/components/ui/Input';
import Select from '#/components/ui/Select';
import FileDropzone from '#/components/ui/FileDropzone';
import CascadeSelect from '#/components/academic/CascadeSelect';
import { useAuthStore } from '#/stores/useAuthStore';
import { useUploadGroupDocument } from '#/hooks/useGroups';
import { uploadDocumentSchema } from '#/utils/validators';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'DOCUMENT', label: 'Tài liệu / Giáo trình' },
  { value: 'SLIDE', label: 'Bài giảng / Slide' },
  { value: 'ASSIGNMENT', label: 'Bài tập / Đề tài' },
  { value: 'EXAM', label: 'Đề thi / Kiểm tra' },
  { value: 'REFERENCE', label: 'Tài liệu tham khảo' },
];

const GROUP_VISIBILITY_OPTION = [
  { value: 'GROUP', label: 'Nhóm học tập — Chỉ thành viên nhóm được xem' },
];

export default function UploadToGroupModal({
  isOpen = false,
  onClose = () => {},
  group = null,
}) {
  const user = useAuthStore((s) => s.user);
  const isStudent = user?.role === 'STUDENT';

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const uploadGroupMutation = useUploadGroupDocument(group?.id);

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
      visibility: 'GROUP',
      subject_id: '',
      cohort_code: '',
      cohort_id: null,
      faculty_code: '',
      faculty_id: null,
      major_code: '',
      major_id: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        description: '',
        document_type: 'DOCUMENT',
        visibility: 'GROUP',
        subject_id: '',
        cohort_code: user?.cohort_code || '',
        cohort_id: user?.cohort_id || null,
        faculty_code: user?.faculty_code || '',
        faculty_id: user?.faculty_id || null,
        major_code: user?.major_code || '',
        major_id: user?.major_id || null,
      });
      setSelectedFile(null);
      setFileError('');
    }
  }, [isOpen, user, reset]);

  if (!group) return null;

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
    formData.append('visibility', 'GROUP');
    formData.append('subject_id', Number(data.subject_id));

    if (isStudent) {
      if (user?.cohort_id) formData.append('cohort_id', user.cohort_id);
      if (user?.faculty_id) formData.append('faculty_id', user.faculty_id);
      if (user?.major_id) formData.append('major_id', user.major_id);
    } else {
      if (data.cohort_id) formData.append('cohort_id', data.cohort_id);
      if (data.faculty_id) formData.append('faculty_id', data.faculty_id);
      if (data.major_id) formData.append('major_id', data.major_id);
    }

    uploadGroupMutation.mutate(formData, {
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
      title={`Tải tài liệu lên nhóm "${group.name}"`}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={uploadGroupMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            icon={Upload}
            onClick={handleSubmit(onSubmit)}
            loading={uploadGroupMutation.isPending}
          >
            Tải lên vào nhóm
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* 1. Chọn file (FileDropzone) */}
        <div>
          <FileDropzone
            label="File tài liệu (*)"
            helperText="Hỗ trợ .PDF, .DOCX, .PPTX, .ZIP (Tối đa 50MB)"
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            error={fileError}
            disabled={uploadGroupMutation.isPending}
          />
        </div>

        {/* 2. Tiêu đề tài liệu */}
        <Input
          label="Tiêu đề tài liệu"
          placeholder="Nhập tiêu đề tài liệu rõ ràng, dễ tìm kiếm..."
          icon={FileText}
          required
          error={errors.title}
          disabled={uploadGroupMutation.isPending}
          {...register('title')}
        />

        {/* 3. Mô tả ngắn */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mô tả tài liệu
          </label>
          <textarea
            placeholder="Ghi chú thêm về tài liệu trong nhóm..."
            rows={3}
            disabled={uploadGroupMutation.isPending}
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

        {/* 4. 2 cột: Loại tài liệu & Quyền hiển thị (Mặc định khóa GROUP) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Loại tài liệu"
            options={DOCUMENT_TYPE_OPTIONS}
            required
            error={errors.document_type}
            disabled={uploadGroupMutation.isPending}
            value={watch('document_type')}
            onChange={(e) => setValue('document_type', e.target.value)}
          />

          <Select
            label="Phạm vi hiển thị (Mặc định Nhóm)"
            options={GROUP_VISIBILITY_OPTION}
            required
            disabled={true}
            value="GROUP"
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
            required={{ subject: true }}
            disabled={uploadGroupMutation.isPending}
            showTitle={true}
            titleText="Phân loại học thuật & Môn học (*)"
          />
        </div>
      </form>
    </Modal>
  );
}
