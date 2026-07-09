/**
 * Tabs.jsx
 * Component điều hướng Tab nguyên tử (Atomic Tabs).
 *
 * Tính năng:
 *  - Hỗ trợ 2 variant: `pills` (nút bo tròn nền nhạt) và `underline` (gạch chân).
 *  - Dynamic Color Theming theo Role: Màu active tự động chuyển theo Student (Xanh biển), Lecturer (Xanh lá) hoặc Admin (Đỏ).
 *  - Hỗ trợ hiển thị Icon và Badge số lượng (`count`) trên từng tab.
 */
import React from 'react';
import { useAuthStore } from '#/stores/useAuthStore';

const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
}) => {
  const role = useAuthStore((state) => state.role);

  // Lấy màu sắc chủ đạo theo Role
  const getRoleStyles = (isActive) => {
    if (!isActive) {
      return variant === 'pills'
        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300';
    }

    if (variant === 'pills') {
      if (role === 'LECTURER') {
        return 'bg-brand-lecturer text-white shadow-sm font-semibold';
      }
      if (role === 'ADMIN') {
        return 'bg-brand-admin text-white shadow-sm font-semibold';
      }
      return 'bg-brand-student text-white shadow-sm font-semibold';
    }

    // Underline variant
    if (role === 'LECTURER') {
      return 'border-brand-lecturer text-brand-lecturer font-bold';
    }
    if (role === 'ADMIN') {
      return 'border-brand-admin text-brand-admin font-bold';
    }
    return 'border-brand-student text-brand-student font-bold';
  };

  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
        variant === 'underline' ? 'border-b border-slate-200' : 'p-1 bg-slate-100/80 rounded-2xl w-fit'
      } ${className}`.trim()}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange && onChange(tab.id)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm transition-all duration-200 select-none cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
              variant === 'pills'
                ? 'rounded-xl'
                : 'border-b-2 -mb-[1px] py-2.5'
            } ${getRoleStyles(isActive)}`}
          >
            {Icon && (
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
            )}
            <span>{tab.label}</span>

            {/* Badge đếm số lượng (nếu có) */}
            {typeof tab.count === 'number' && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-bold transition-colors ${
                  isActive
                    ? variant === 'pills'
                      ? 'bg-white/25 text-white'
                      : 'bg-brand-student text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(Tabs);
