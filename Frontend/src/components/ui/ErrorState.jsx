/**
 * ErrorState.jsx
 * Component hiển thị cảnh báo lỗi khi tải dữ liệu từ API (Fetch Error).
 *
 * Tính năng:
 *  - Cung cấp nút "Thử lại" (`onRetry`) giúp gọi lại API / `refetch()` từ TanStack Query.
 *  - Giao diện đỏ dịu chuẩn UX/UI cảnh báo.
 */
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '#/components/ui/Button';

const ErrorState = ({
  title = 'Không thể tải dữ liệu',
  message = 'Đã xảy ra lỗi trong quá trình kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng và thử lại.',
  onRetry,
  retryText = 'Thử lại ngay',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-10 border border-red-200 bg-red-50/50 rounded-2xl my-4 ${className}`.trim()}
    >
      {/* Icon Wrapper */}
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3.5 shadow-sm">
        <AlertCircle className="w-6 h-6" />
      </div>

      {/* Title & Message */}
      <h3 className="text-base sm:text-lg font-bold text-red-900 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-red-700/80 max-w-md mt-1 mb-5 leading-relaxed">
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <Button
          type="button"
          variant="secondary"
          onClick={onRetry}
          icon={RefreshCw}
          size="sm"
          className="border-red-300 text-red-800 hover:bg-red-100/70"
        >
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default React.memo(ErrorState);
