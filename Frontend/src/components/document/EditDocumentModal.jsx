/**
 * EditDocumentModal.jsx
 * Modal chỉnh sửa metadata của tài liệu (Tiêu đề, Mô tả, Loại tài liệu, Phạm vi hiển thị).
 * Lưu ý: Theo đặc tả backend (STUDYHUB_FE.md), không cho phép thay đổi file đính kèm hay môn học sau khi upload.
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, FileText } from 'lucide-react';

import Modal from '#/components/ui/Modal';
import Button from '#/components/ui/Button';
import Input from '#/components/ui/Input';
import Select from '#/components/ui/Select';
import { useUpdateDocument } from '#/hooks/useDocuments';
import { updateDocumentSchema } from '#/utils/validators';

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

export default function EditDocumentModal({
  isOpen = false,
  onClose = () => {},
  document: doc = null,
}) {
  const updateMutation = useUpdateDocument();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateDocumentSchema),
    defaultValues: {
      title: '',
      description: '',
      document_type: 'DOCUMENT',
      visibility: 'PUBLIC',
    },
  });

  useEffect(() => {
    if (isOpen && doc) {
      reset({
        title: doc.title || '',
        description: doc.description || '',
        document_type: doc.document_type || 'DOCUMENT',
        visibility: doc.visibility || 'PUBLIC',
      });
    }
  }, [isOpen, doc, reset]);

  if (!doc) return null;

  const onSubmit = (data) => {
    const body = {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      document_type: data.document_type,
      visibility: data.visibility,
    };

    updateMutation.mutate(
      { id: doc.id, body },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa thông tin tài liệu"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            icon={Edit3}
            onClick={handleSubmit(onSubmit)}
            loading={updateMutation.isPending}
          >
            Lưu thay đổi
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Tiêu đề */}
        <Input
          label="Tiêu đề tài liệu"
          placeholder="Nhập tiêu đề..."
          icon={FileText}
          required
          error={errors.title}
          disabled={updateMutation.isPending}
          {...register('title')}
        />

        {/* Mô tả */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mô tả tài liệu
          </label>
          <textarea
            placeholder="Ghi chú thêm về tài liệu..."
            rows={3}
            disabled={updateMutation.isPending}
            {...register('description')}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none resize-none ${
              errors.description
                ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                : 'border-slate-200 bg-white focus:border-brand-student'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-500 font-medium mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Loại tài liệu & Quyền hiển thị */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Loại tài liệu"
            options={DOCUMENT_TYPE_OPTIONS}
            required
            error={errors.document_type}
            disabled={updateMutation.isPending}
            value={watch('document_type')}
            onChange={(e) => setValue('document_type', e.target.value)}
          />

          <Select
            label="Phạm vi hiển thị"
            options={VISIBILITY_OPTIONS}
            required
            error={errors.visibility}
            disabled={updateMutation.isPending}
            value={watch('visibility')}
            onChange={(e) => setValue('visibility', e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
