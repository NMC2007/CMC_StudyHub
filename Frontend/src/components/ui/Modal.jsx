/**
 * Modal.jsx
 * Component Modal (Hộp thoại popup) nguyên tử tái sử dụng toàn dự án.
 *
 * Tính năng:
 *  - Animation mượt mà: Backdrop mờ dần (`fade-in`), Modal trượt nhẹ lên (`zoom-in-95`).
 *  - Hỗ trợ phím ESC để đóng modal.
 *  - Hỗ trợ đóng khi click vào vùng nền (backdrop), có thể tắt qua `closeOnBackdrop = false`.
 *  - Đa dạng kích thước (`size`): sm (400px), md (550px), lg (700px), xl (900px), full.
 *  - Chuẩn A11y: `role="dialog"`, `aria-modal="true"`.
 */
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

const Modal = ({
  isOpen = false,
  onClose,
  title,
  icon: Icon = null,
  children,
  footer = null,
  size = 'md',
  closeOnBackdrop = true,
  className = '',
  bodyClassName = '',
}) => {
  // Lắng nghe phím ESC để đóng Modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Ngăn cuộn trang nền khi modal đang mở
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Content Box */}
      <div
        className={`w-full bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 ${
          sizeClasses[size] || sizeClasses.md
        } ${className}`.trim()}
        onClick={(e) => e.stopPropagation()} // Ngăn click bên trong modal bị lan ra backdrop
      >
        {/* Header (nếu có title hoặc nút đóng) */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <div className="w-8 h-8 rounded-xl bg-brand-student-light flex items-center justify-center text-brand-student shrink-0">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              )}
              {title && (
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  {title}
                </h3>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Đóng hộp thoại"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body Content */}
        <div className={`p-6 overflow-y-auto max-h-[75vh] ${bodyClassName}`}>
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Modal);
