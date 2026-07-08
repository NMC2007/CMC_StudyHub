/**
 * Select.jsx
 * Component Dropdown Select nguyên tử (Atomic Select).
 *
 * Tính năng:
 *  - Hỗ trợ React forwardRef để làm việc mượt mà với React Hook Form.
 *  - Hỗ trợ truyền mảng options: [{ value: 1, label: 'Khóa 2026', disabled: false }] hoặc mảng chuỗi đơn giản.
 *  - Hỗ trợ placeholder (option mặc định với giá trị rỗng).
 *  - Tự động hiển thị Label, Helper Text và Thông báo lỗi Zod bên dưới.
 */
import React, { forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

const Select = forwardRef(
  (
    {
      label,
      error,
      options = [],
      placeholder = 'Vui lòng chọn...',
      helperText,
      className = '',
      wrapperClassName = '',
      id,
      disabled = false,
      required = false,
      ...restProps
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
    const errorMessage = typeof error === 'string' ? error : error?.message;

    // Base styling
    const baseSelectStyles =
      'w-full px-3.5 py-2 text-sm text-slate-800 bg-white border rounded-xl transition-all duration-200 outline-none appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed pr-10';

    const stateStyles = errorMessage
      ? 'border-red-500 text-red-900 focus:ring-2 focus:ring-red-200 focus:border-red-500'
      : 'border-slate-300 focus:ring-2 focus:ring-brand-student/20 focus:border-brand-student hover:border-slate-400';

    return (
      <div className={`w-full flex flex-col gap-1.5 ${wrapperClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-slate-700 select-none flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-red-500 font-bold">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`${baseSelectStyles} ${stateStyles} ${className}`.trim()}
            {...restProps}
          >
            {/* Placeholder option */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {/* Render danh sách options */}
            {options.map((opt, index) => {
              const isObject = typeof opt === 'object' && opt !== null;
              const val = isObject ? opt.value : opt;
              const lbl = isObject ? opt.label : opt;
              const isDisabled = isObject ? opt.disabled : false;

              return (
                <option key={`${val}-${index}`} value={val} disabled={isDisabled}>
                  {lbl}
                </option>
              );
            })}
          </select>

          {/* Chevron Down Icon mũi tên dropdown */}
          <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>

        {/* Thông báo lỗi Zod validation */}
        {errorMessage ? (
          <p className="text-xs text-red-500 font-medium flex items-center gap-1 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default React.memo(Select);
