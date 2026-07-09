/**
 * EmptyState.jsx
 * Component hiển thị trạng thái danh sách trống hoặc không tìm thấy kết quả.
 *
 * Tính năng:
 *  - Tùy chỉnh icon (mặc định là FolderOpen), tiêu đề, mô tả.
 *  - Hỗ trợ nút hành động nhanh (`actionText` + `onAction`) ví dụ: "+ Upload tài liệu ngay".
 */
import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from '#/components/ui/Button';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'Chưa có dữ liệu',
  description = 'Danh sách hiện tại đang trống. Hãy thực hiện thao tác để thêm mới dữ liệu vào hệ thống.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 my-4 ${className}`.trim()}
    >
      {/* Icon Wrapper */}
      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mb-4 animate-in zoom-in-90 duration-300">
        <Icon className="w-7 h-7" />
      </div>

      {/* Title & Description */}
      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      {/* Optional Call To Action Button */}
      {actionText && onAction && (
        <Button
          type="button"
          variant="primary"
          onClick={onAction}
          size="md"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default React.memo(EmptyState);
