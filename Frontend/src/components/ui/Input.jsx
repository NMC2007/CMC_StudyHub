/**
 * Input.jsx
 * Component Input nhập liệu nguyên tử (Atomic Input).
 *
 * Tính năng:
 *  - Hỗ trợ React forwardRef để tích hợp liền mạch với React Hook Form.
 *  - Tự động hiển thị Label, Helper Text và Thông báo lỗi validation (Zod error).
 *  - Hỗ trợ Icon bên trái hoặc bên phải (Ví dụ: icon tìm kiếm, icon email, icon mắt ẩn/hiện mật khẩu).
 *  - Viền đỏ cảnh báo và đổi màu text khi có lỗi xảy ra.
 */
import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon = null,
      iconPosition = 'left',
      rightElement = null,
      className = '',
      wrapperClassName = '',
      id,
      type = 'text',
      disabled = false,
      required = false,
      ...restProps
    },
    ref
  ) => {
    // Tạo ID ngẫu nhiên nếu không truyền vào (phục vụ accessibility cho label & input)
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    // Trích xuất câu thông báo lỗi (hỗ trợ cả string thuần lẫn object error từ React Hook Form)
    const errorMessage = typeof error === 'string' ? error : error?.message;

    // Base styling cho thẻ input
    const baseInputStyles =
      'w-full px-3.5 py-2 text-sm text-slate-800 bg-white border rounded-xl transition-all duration-200 outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed read-only:bg-slate-50 read-only:cursor-not-allowed read-only:text-slate-500 placeholder:text-slate-400';

    // Styling theo trạng thái Lỗi / Bình thường
    const stateStyles = errorMessage
      ? 'border-red-500 text-red-900 focus:ring-2 focus:ring-red-200 focus:border-red-500'
      : 'border-slate-300 focus:ring-2 focus:ring-brand-student/20 focus:border-brand-student hover:border-slate-400';

    // Styling padding khi có Icon bên trái hoặc phần tử bên phải
    const paddingStyles = `${Icon && iconPosition === 'left' ? 'pl-10' : ''} ${rightElement || (Icon && iconPosition === 'right') ? 'pr-10' : ''}`;

    return (
      <div className={`w-full flex flex-col gap-1.5 ${wrapperClassName}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 select-none flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-red-500 font-bold">*</span>}
          </label>
        )}

        {/* Input Container (để chứa Icon và Input) */}
        <div className="relative flex items-center w-full">
          {/* Left Icon */}
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
          )}

          {/* Thẻ Input chính */}
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            className={`${baseInputStyles} ${stateStyles} ${paddingStyles} ${className}`.trim()}
            {...restProps}
          />

          {/* Right Icon hoặc Right Element (như nút xem mật khẩu) */}
          {rightElement ? (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightElement}
            </div>
          ) : Icon && iconPosition === 'right' ? (
            <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
          ) : null}
        </div>

        {/* Thông báo lỗi Zod validation */}
        {errorMessage ? (
          <p className="text-xs text-red-500 font-medium flex items-center gap-1 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </p>
        ) : helperText ? (
          /* Helper Text mô tả thêm (nếu không có lỗi) */
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default React.memo(Input);
