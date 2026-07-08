/**
 * Button.jsx
 * Component Nút bấm nguyên tử (Atomic Button) tái sử dụng toàn dự án.
 *
 * Tính năng:
 *  - Hỗ trợ 4 variant: primary, secondary, danger, ghost.
 *  - Hỗ trợ 3 size: sm, md, lg.
 *  - Tự động thay đổi màu chủ đạo (primary) theo Role của người dùng (Student = Xanh biển, Lecturer = Xanh lá, Admin = Đỏ).
 *  - Trạng thái loading: Hiển thị icon xoay Loader2 và tự động disable nút.
 *  - Tích hợp tốt với các icon Lucide React.
 */
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '#/stores/useAuthStore';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon = null,
  className = '',
  type = 'button',
  onClick,
  ...restProps
}) => {
  // Lấy role hiện tại từ Zustand để áp dụng Dynamic Color Theming cho variant="primary"
  const role = useAuthStore((state) => state.role);

  // 1. Base styles chung cho mọi nút
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  // 2. Styles theo Kích thước (Size)
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5',
  };

  // 3. Styles theo Loại (Variant) & Role Theming
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': {
        if (role === 'LECTURER') {
          return 'bg-brand-lecturer hover:bg-brand-lecturer-dark text-white shadow-sm focus:ring-brand-lecturer/30';
        }
        if (role === 'ADMIN') {
          return 'bg-brand-admin hover:bg-brand-admin-dark text-white shadow-sm focus:ring-brand-admin/30';
        }
        // Mặc định là STUDENT (hoặc khi chưa đăng nhập như ở trang Login/Register) -> Xanh biển
        return 'bg-brand-student hover:bg-brand-student-dark text-white shadow-sm focus:ring-brand-student/30';
      }
      case 'secondary':
        return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-slate-300';
      case 'danger':
        return 'bg-brand-admin hover:bg-brand-admin-dark text-white shadow-sm focus:ring-brand-admin/30';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-200';
      default:
        return 'bg-brand-student hover:bg-brand-student-dark text-white shadow-sm focus:ring-brand-student/30';
    }
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${getVariantStyles()} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled || loading}
      onClick={onClick}
      {...restProps}
    >
      {/* Khi loading thì hiện Loader2 xoay, nếu không thì hiện Icon nếu có */}
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : Icon ? (
        typeof Icon === 'function' || typeof Icon === 'object' ? (
          <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        ) : (
          Icon
        )
      ) : null}

      <span>{children}</span>
    </button>
  );
};

export default React.memo(Button);
