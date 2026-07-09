/**
 * TrashCard.jsx
 * Component Card hiển thị tài liệu đã bị xóa mềm (nằm trong Thùng rác).
 *
 * Tính năng:
 *  - Hiển thị ngày xóa (`deleted_at`) và cảnh báo số ngày còn lại trước khi xóa vĩnh viễn (`getDaysUntilPermanentDelete`).
 *  - Nút "Khôi phục tài liệu" (`onRestore`) gọi lại hàm khôi phục ở trang cha.
 */
import React from 'react';
import { RotateCcw, AlertTriangle, FileText, Clock } from 'lucide-react';
import Badge from '#/components/ui/Badge';
import Button from '#/components/ui/Button';
import { formatDate, getDaysUntilPermanentDelete } from '#/utils/formatters';

const TrashCard = ({
  document: doc,
  onRestore,
  isRestoring = false,
  className = '',
}) => {
  if (!doc) return null;

  const daysLeft = getDaysUntilPermanentDelete(doc.deleted_at, 15);
  const isUrgent = daysLeft <= 3;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-all duration-200 flex flex-col justify-between gap-4 ${
        isUrgent ? 'bg-red-50/20 border-red-200' : ''
      } ${className}`.trim()}
    >
      {/* Top Header: Badge Type & Days Left Warning */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant="type" value={doc.document_type || 'DOCUMENT'} size="sm" />

        {/* Warning Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isUrgent
              ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {daysLeft > 0
              ? `Xóa vĩnh viễn sau ${daysLeft} ngày`
              : 'Sắp bị xóa vĩnh viễn'}
          </span>
        </div>
      </div>

      {/* Body: Title & Deleted At info */}
      <div className="flex flex-col gap-1.5 min-h-0">
        <h3 className="text-base font-bold text-slate-800 line-clamp-2 leading-snug">
          {doc.title}
        </h3>

        {doc.description && (
          <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
            {doc.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Đã xóa vào: {formatDate(doc.deleted_at)}</span>
        </div>
      </div>

      {/* Footer: Restore Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
        <Button
          type="button"
          variant="primary"
          size="sm"
          icon={RotateCcw}
          onClick={() => onRestore && onRestore(doc)}
          loading={isRestoring}
          className="w-full sm:w-auto"
        >
          Khôi phục tài liệu
        </Button>
      </div>
    </div>
  );
};

export default React.memo(TrashCard);
