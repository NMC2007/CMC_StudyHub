/**
 * CreateGroupModal.jsx
 * Modal tạo Nhóm học tập mới (Study Group).
 *
 * Tính năng (STUDYHUB_FE.md Mục 14 & 20):
 *  - Form validation bằng React Hook Form + Zod (`createGroupSchema`).
 *  - Nhập Tên nhóm (`name`) và Mô tả (`description`).
 *  - Người tạo tự động trở thành Trưởng nhóm (Crown) với quyền quản lý thành viên và giải tán nhóm.
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Plus } from 'lucide-react';

import Modal from '#/components/ui/Modal';
import Button from '#/components/ui/Button';
import Input from '#/components/ui/Input';
import { useCreateGroup } from '#/hooks/useGroups';
import { createGroupSchema } from '#/utils/validators';

export default function CreateGroupModal({
  isOpen = false,
  onClose = () => {},
}) {
  const createMutation = useCreateGroup();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        description: '',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    const body = {
      name: data.name.trim(),
      description: data.description ? data.description.trim() : '',
    };

    createMutation.mutate(body, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo nhóm học tập mới"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            icon={Plus}
            onClick={handleSubmit(onSubmit)}
            loading={createMutation.isPending}
          >
            Tạo nhóm ngay
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Tên nhóm */}
        <Input
          label="Tên nhóm học tập (*)"
          placeholder="VD: Nhóm ôn thi Java OOP K23, Lớp cấu trúc dữ liệu..."
          icon={Users}
          required
          error={errors.name}
          disabled={createMutation.isPending}
          {...register('name')}
        />

        {/* Mô tả ngắn */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mô tả mục tiêu nhóm
          </label>
          <textarea
            placeholder="Chia sẻ tài liệu, bài tập, thảo luận kiến thức xoay quanh môn học..."
            rows={3}
            disabled={createMutation.isPending}
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
      </form>
    </Modal>
  );
}
