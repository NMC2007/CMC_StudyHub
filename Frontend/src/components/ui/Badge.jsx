/**
 * Badge.jsx
 * Component Tag nhãn nguyên tử (Atomic Badge).
 *
 * Tính năng:
 *  - Hỗ trợ 4 chế độ hiển thị (variant):
 *    1. 'role': Tự động đổi màu theo Role (STUDENT = Xanh biển, LECTURER = Xanh lá, ADMIN = Đỏ).
 *    2. 'type': Tự động đổi màu theo Loại tài liệu (PDF, DOCX, EXAM, SLIDE, REFERENCE).
 *    3. 'visibility': Tự động đổi màu theo Phạm vi (PUBLIC, PRIVATE, GROUP) dùng hàm getVisibilityInfo.
 *    4. 'custom': Cho phép người dùng tự truyền className màu sắc tùy ý.
 *  - Hỗ trợ 2 kích thước: sm, md.
 */
import React from "react";
import {
  getRoleLabel,
  getDocumentTypeLabel,
  getVisibilityInfo,
} from "#/utils/formatters";

const Badge = ({
  children,
  variant = "custom",
  value,
  size = "md",
  className = "",
  ...restProps
}) => {
  // Base styling
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-full select-none whitespace-nowrap transition-colors duration-150";

  // Size styling
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] leading-tight gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  // Logic xác định màu và nhãn hiển thị theo variant
  const getBadgeContentAndStyle = () => {
    switch (variant) {
      case "role": {
        const roleStr = value || children;
        const label = getRoleLabel(roleStr);
        if (roleStr === "LECTURER") {
          return {
            label,
            style:
              "bg-brand-lecturer-light text-brand-lecturer-dark border border-brand-lecturer/20",
          };
        }
        if (roleStr === "ADMIN") {
          return {
            label,
            style:
              "bg-brand-admin-light text-brand-admin-dark border border-brand-admin/20",
          };
        }
        // Mặc định STUDENT
        return {
          label,
          style:
            "bg-brand-student-light text-brand-student-dark border border-brand-student/20",
        };
      }

      case "type": {
        const typeStr = value || children;
        const label = getDocumentTypeLabel(typeStr);
        // Phân màu theo loại tài liệu
        switch (typeStr) {
          case "DOCUMENT":
            return {
              label,
              style: "bg-blue-50 text-blue-700 border border-blue-200",
            };
          case "ASSIGNMENT":
            return {
              label,
              style: "bg-amber-50 text-amber-700 border border-amber-200",
            };
          case "EXAM":
            return {
              label,
              style: "bg-purple-50 text-purple-700 border border-purple-200",
            };
          case "SLIDE":
            return {
              label,
              style: "bg-rose-50 text-rose-700 border border-rose-200",
            };
          case "REFERENCE":
            return {
              label,
              style: "bg-emerald-50 text-emerald-700 border border-emerald-200",
            };
          default:
            return {
              label: typeStr,
              style: "bg-slate-100 text-slate-700 border border-slate-200",
            };
        }
      }

      case "visibility": {
        const visStr = value || children;
        const info = getVisibilityInfo(visStr);
        return {
          label: info.label,
          style: `${info.color} border border-current/10`,
        };
      }

      case "custom":
      default:
        return {
          label: children || value,
          style: "bg-slate-100 text-slate-700 border border-slate-200",
        };
    }
  };

  const { label, style } = getBadgeContentAndStyle();
  const combinedClassName =
    `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${style} ${className}`.trim();

  return (
    <span className={combinedClassName} {...restProps}>
      {label}
    </span>
  );
};

export default React.memo(Badge);
