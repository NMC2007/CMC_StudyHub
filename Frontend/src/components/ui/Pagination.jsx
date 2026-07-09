/**
 * Pagination.jsx
 * Component phân trang server-side chuẩn UX.
 *
 * Tính năng:
 *  - Tự động rút gọn trang với dấu ba chấm (`...`) khi tổng số trang > 7.
 *  - Nút Trước/Sau (Previous/Next) kèm kiểm tra trạng thái disable khi ở trang đầu hoặc trang cuối.
 *  - Dynamic Theming: Nút trang hiện tại đổi màu theo Role (Student/Lecturer/Admin).
 */
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '#/stores/useAuthStore';

const Pagination = ({
  page = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  disabled = false,
  className = '',
}) => {
  const role = useAuthStore((state) => state.role);

  if (totalPages <= 1) return null;

  // Thuật toán tạo danh sách số trang thông minh
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiện trang 1
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      // Luôn hiện trang cuối
      pages.push(totalPages);
    }
    return pages;
  };

  const getActiveRoleStyles = () => {
    if (role === 'LECTURER') {
      return 'bg-brand-lecturer text-white font-bold shadow-sm border-brand-lecturer';
    }
    if (role === 'ADMIN') {
      return 'bg-brand-admin text-white font-bold shadow-sm border-brand-admin';
    }
    return 'bg-brand-student text-white font-bold shadow-sm border-brand-student';
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 w-full pt-4 border-t border-slate-100 text-sm select-none ${className}`.trim()}
      role="navigation"
      aria-label="Phân trang"
    >
      {/* Thông tin số lượng */}
      <div className="text-xs text-slate-500 font-medium">
        {typeof totalItems === 'number' ? (
          <span>
            Hiển thị trang <strong className="text-slate-800">{page}</strong> trên tổng số{' '}
            <strong className="text-slate-800">{totalPages}</strong> trang ({totalItems} mục)
          </span>
        ) : (
          <span>
            Trang <strong className="text-slate-800">{page}</strong> / {totalPages}
          </span>
        )}
      </div>

      {/* Buttons Phân trang */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => page > 1 && !disabled && onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Number Buttons */}
        {pages.map((p, index) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-slate-400 font-medium"
              >
                ...
              </span>
            );
          }

          const isCurrent = p === page;

          return (
            <button
              key={p}
              type="button"
              onClick={() => p !== page && !disabled && onPageChange(p)}
              disabled={disabled || isCurrent}
              className={`min-w-[36px] h-9 px-3 rounded-xl border flex items-center justify-center text-xs transition-all duration-200 ${
                isCurrent
                  ? getActiveRoleStyles()
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => page < totalPages && !disabled && onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Trang tiếp theo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default React.memo(Pagination);
