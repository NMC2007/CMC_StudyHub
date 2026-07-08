/**
 * PageWrapper.jsx
 * Component bọc nội dung chuẩn hóa cho mỗi trang con bên trong AppLayout.
 *
 * Tính năng:
 *  - Padding nhất quán, max-width giới hạn.
 *  - Hiển thị tiêu đề trang (title) và hành động (actions) ở phía trên.
 *  - Dễ mở rộng: Thêm breadcrumb, subtitle sau này.
 */

export default function PageWrapper({ title, actions, children, className = '' }) {
  return (
    <div className={`p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto ${className}`.trim()}>
      {/* Header row: Title + Actions */}
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          {title && (
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">
              {title}
            </h1>
          )}
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}

      {/* Main content */}
      {children}
    </div>
  );
}
