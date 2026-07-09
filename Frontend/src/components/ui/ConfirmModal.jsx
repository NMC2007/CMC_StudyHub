/**
 * ConfirmModal.jsx
 * Component Modal xác nhận hành động nguy hiểm hoặc quan trọng (Xóa tài liệu, Giải tán nhóm...).
 *
 * Tính năng:
 *  - Sử dụng bên dưới là `Modal.jsx`.
 *  - Hỗ trợ 2 variant chính: `danger` (Màu đỏ cảnh báo) và `primary` (Màu xanh chuẩn).
 *  - Tích hợp sẵn 2 nút hủy và xác nhận, hỗ trợ prop `loading` để hiển thị spinner trên nút xác nhận khi đang call API.
 */
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import Modal from '#/components/ui/Modal';
import Button from '#/components/ui/Button';

const ConfirmModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Xác nhận hành động',
  description,
  children,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  loading = false,
}) => {
  const isDanger = variant === 'danger';
  const Icon = isDanger ? AlertTriangle : Info;

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      size="sm"
      closeOnBackdrop={!loading}
    >
      <div className="flex flex-col items-center text-center gap-3 py-2">
        {/* Icon cảnh báo */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            isDanger
              ? 'bg-red-100 text-red-600'
              : 'bg-brand-student-light text-brand-student'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Tiêu đề & Nội dung mô tả */}
        <h3 className="text-lg font-bold text-slate-800 mt-1">{title}</h3>

        {description ? (
          <p className="text-sm text-slate-500 max-w-xs">{description}</p>
        ) : (
          children && <div className="text-sm text-slate-500 w-full">{children}</div>
        )}

        {/* Buttons Action */}
        <div className="flex items-center justify-center gap-3 w-full mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(ConfirmModal);
