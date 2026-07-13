/**
 * DocumentPreviewModal.jsx
 * Modal xem trước & chi tiết tài liệu thông minh theo định dạng file.
 *
 * Giải quyết 2 lỗi nghiêm trọng:
 *  1. Lỗi 404 khi mở tài liệu: Sử dụng `getFileUrl()` để chuẩn hóa đường dẫn
 *     tương đối từ Backend thành URL tuyệt đối (http://localhost:8081/uploads/...).
 *  2. Lượt xem (view_count) không tăng: Khi modal mở, hook `useDocumentDetail(id)`
 *     gọi API GET /documents/:id để Backend thực thi `recordView`, ghi nhận lượt
 *     xem vào DB. Sau đó đồng bộ view_count mới vào TanStack Query cache.
 *
 * Xử lý hiển thị thông minh theo định dạng tệp:
 *  - PDF / Hình ảnh (.jpg, .png, .webp): Nhúng iframe xem trực tiếp trong modal.
 *  - Word (.docx), PowerPoint (.pptx): Summary Card + hướng dẫn + nút Download.
 *  - Tệp nén (.zip): Summary Card + hướng dẫn + nút Download.
 *
 * Tuân thủ:
 *  - STUDYHUB_FE.md mục 2 (cấu trúc thư mục document/), mục 7.3 (Modal pattern),
 *    mục 19 (React.memo, useCallback), mục 21 (coding conventions).
 */
import React, { useEffect, useCallback } from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  ClipboardList,
  GraduationCap,
  Presentation,
  BookOpen,
  File as DefaultFileIcon,
  Archive,
  Eye,
  Heart,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useDocumentDetail } from '#/hooks/useDocuments';
import { getFileUrl, formatFileSize, formatCount, formatDate } from '#/utils/formatters';
import Badge from '#/components/ui/Badge';

// ─── Hằng số — Phân loại định dạng file ───────────────────────────────────────

/** Các định dạng có thể xem trực tiếp bằng iframe trong trình duyệt */
const PREVIEWABLE_TYPES = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']);

/** Ánh xạ định dạng file sang icon Lucide và nhãn hiển thị */
const FILE_TYPE_CONFIG = {
  pdf: {
    icon: FileText,
    label: 'PDF Document',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  docx: {
    icon: FileText,
    label: 'Microsoft Word (.docx)',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  doc: {
    icon: FileText,
    label: 'Microsoft Word (.doc)',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  pptx: {
    icon: Presentation,
    label: 'Microsoft PowerPoint (.pptx)',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  ppt: {
    icon: Presentation,
    label: 'Microsoft PowerPoint (.ppt)',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  zip: {
    icon: Archive,
    label: 'Tệp nén (.zip)',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
};

// ─── Icon theo document_type (nghiệp vụ StudyHub) ─────────────────────────────
const getDocTypeIcon = (type) => {
  switch (type) {
    case 'DOCUMENT':   return <FileText className="w-4 h-4 text-blue-600" />;
    case 'ASSIGNMENT': return <ClipboardList className="w-4 h-4 text-amber-600" />;
    case 'EXAM':       return <GraduationCap className="w-4 h-4 text-purple-600" />;
    case 'SLIDE':      return <Presentation className="w-4 h-4 text-rose-600" />;
    case 'REFERENCE':  return <BookOpen className="w-4 h-4 text-emerald-600" />;
    default:           return <DefaultFileIcon className="w-4 h-4 text-slate-500" />;
  }
};

// ─── Lấy cấu hình hiển thị theo file_type (phần mở rộng file) ────────────────
const getFileConfig = (fileType) => {
  const normalized = (fileType || '').toLowerCase().replace('.', '');
  return FILE_TYPE_CONFIG[normalized] || {
    icon: DefaultFileIcon,
    label: `Tệp ${normalized || 'tài liệu'}`,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
  };
};

// ─── Kiểm tra file có thể xem trực tiếp bằng iframe không ────────────────────
const isPreviewable = (fileType) => {
  const normalized = (fileType || '').toLowerCase().replace('.', '');
  return PREVIEWABLE_TYPES.has(normalized);
};

// ─── Khu vực Xem Trước: iframe cho PDF/ảnh ───────────────────────────────────
const PreviewIframe = ({ fileUrl, title }) => (
  <div className="flex-1 min-h-0 flex flex-col">
    <iframe
      src={fileUrl}
      title={`Xem trước: ${title}`}
      className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 min-h-[520px]"
      style={{ minHeight: '520px' }}
    />
  </div>
);

// ─── Khu vực Download Card: cho .docx/.pptx/.zip ─────────────────────────────
const DownloadCard = ({ fileType, fileUrl, fileName, fileSize }) => {
  const config = getFileConfig(fileType);
  const FileIcon = config.icon;

  const handleDownload = () => {
    // Tạo thẻ <a> ngầm kích hoạt tải về, tránh mở tab mới
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || `tai-lieu.${fileType}`;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const messageMap = {
    docx: 'Tài liệu Word (.docx) cần được tải về máy để hiển thị với đúng định dạng và font chữ của tác giả.',
    doc:  'Tài liệu Word (.doc) cần được tải về máy để hiển thị với đúng định dạng và font chữ của tác giả.',
    pptx: 'Bài trình chiếu PowerPoint (.pptx) cần được tải về máy để hiển thị với đầy đủ hiệu ứng và định dạng chuẩn.',
    ppt:  'Bài trình chiếu PowerPoint (.ppt) cần được tải về máy để hiển thị với đầy đủ hiệu ứng và định dạng chuẩn.',
    zip:  'Tệp nén (.zip) chứa gói nhiều tài liệu bên trong. Vui lòng tải về máy và giải nén để sử dụng nội dung.',
  };
  const normalizedType = (fileType || '').toLowerCase().replace('.', '');
  const message = messageMap[normalizedType] || 'Định dạng tệp này cần được tải về máy để xem.';

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-6">
      {/* Icon lớn */}
      <div className={`w-24 h-24 rounded-3xl ${config.bg} ${config.border} border-2 flex items-center justify-center mb-6 shadow-sm`}>
        <FileIcon className={`w-12 h-12 ${config.color}`} />
      </div>

      {/* Label định dạng */}
      <span className={`text-sm font-bold px-3 py-1 rounded-full ${config.bg} ${config.color} border ${config.border} mb-4`}>
        {config.label}
      </span>

      {/* Thông báo hướng dẫn */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 max-w-md text-center">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">{message}</p>
      </div>

      {/* Kích thước file */}
      {fileSize && (
        <p className="text-xs text-slate-400 mb-5">
          Kích thước: <span className="font-semibold text-slate-600">{formatFileSize(fileSize)}</span>
        </p>
      )}

      {/* Nút Download chính */}
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-student hover:bg-brand-student-dark text-white font-semibold text-sm shadow-md shadow-brand-student/20 transition-all duration-200 active:scale-[0.98]"
      >
        <Download className="w-4 h-4" />
        Tải về máy ({config.label})
      </button>
    </div>
  );
};

// ─── COMPONENT CHÍNH ─────────────────────────────────────────────────────────

/**
 * @param {boolean}  isOpen    - Trạng thái hiển thị modal
 * @param {Function} onClose   - Callback đóng modal
 * @param {Object}   document  - Object tài liệu từ DocumentCard (doc prop)
 */
const DocumentPreviewModal = ({ isOpen, onClose, document: doc }) => {
  const queryClient = useQueryClient();

  // Gọi API chi tiết tài liệu khi modal mở — kích hoạt recordView trên Backend.
  // enabled: !!isOpen — chỉ fetch khi modal đang mở, tránh fetch thừa khi modal đóng.
  const { data: detailData, isLoading } = useDocumentDetail(doc?.id, {
    enabled: !!isOpen && !!doc?.id,
  });

  // Sau khi API trả về view_count mới, đồng bộ vào tất cả cache ['documents']
  // để view_count trên DocumentCard ở màn hình phía sau tăng lên ngay lập tức.
  useEffect(() => {
    if (!detailData || !doc?.id) return;

    const newViewCount = detailData?.document?.view_count ?? detailData?.view_count;
    if (typeof newViewCount !== 'number') return;

    // Cập nhật view_count trong tất cả các cache ['documents'] chứa tài liệu này
    queryClient.setQueriesData({ queryKey: ['documents'] }, (oldData) => {
      if (!oldData) return oldData;

      const updateDoc = (d) => {
        if (!d || d.id !== doc.id) return d;
        return { ...d, view_count: newViewCount };
      };

      if (Array.isArray(oldData)) return oldData.map(updateDoc);
      if (oldData?.documents) return { ...oldData, documents: oldData.documents.map(updateDoc) };
      return oldData;
    });
  }, [detailData, doc?.id, queryClient]);

  // Đóng modal khi nhấn phím Escape — UX chuẩn STUDYHUB_FE.md mục 7.3
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Khóa cuộn trang khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !doc) return null;

  // Lấy thông tin chi tiết từ API (ưu tiên), fallback về prop gốc từ DocumentCard
  const docDetail = detailData?.document || detailData || doc;
  const fileUrl   = getFileUrl(docDetail.file_url || doc.file_url);
  const fileType  = (docDetail.file_type || doc.file_type || '').toLowerCase().replace('.', '');
  const canPreview = isPreviewable(fileType);

  // Tên file để download (lấy từ phần cuối của file_url)
  const rawUrl    = docDetail.file_url || doc.file_url || '';
  const fileName  = rawUrl.split('/').pop() || `tai-lieu.${fileType}`;

  return (
    // Backdrop — click ra ngoài đóng modal
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      aria-modal="true"
      role="dialog"
      aria-label={`Xem trước tài liệu: ${doc.title}`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative z-10 bg-white w-full sm:max-w-4xl max-h-[95dvh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          {/* Icon loại nghiệp vụ */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
            {getDocTypeIcon(doc.document_type)}
          </div>

          {/* Tiêu đề & metadata */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-800 line-clamp-2 leading-snug">
              {doc.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="type" value={doc.document_type} size="sm" />
              {doc.visibility && doc.visibility !== 'PUBLIC' && (
                <Badge variant="visibility" value={doc.visibility} size="sm" />
              )}
              {(doc.subject?.name || doc.subject_code) && (
                <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 rounded-md bg-slate-100">
                  {doc.subject?.code || doc.subject_code}
                  {doc.subject?.name ? ` · ${doc.subject.name}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Stats & Actions khi không ở trạng thái loading */}
          <div className="flex items-center gap-3 shrink-0">
            {/* View count */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <Eye className="w-3.5 h-3.5" />
              <span className="font-medium">
                {isLoading
                  ? '...'
                  : formatCount(docDetail?.view_count ?? doc?.view_count ?? 0)}
              </span>
            </div>
            {/* Like count */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <Heart className="w-3.5 h-3.5" />
              <span className="font-medium">{formatCount(doc.like_count || 0)}</span>
            </div>

            {/* Nút mở tab mới (chỉ khi có fileUrl) */}
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-400 hover:text-brand-student hover:bg-slate-100 transition-colors"
                title="Mở trong tab mới"
                aria-label="Mở tài liệu trong tab mới"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Nút tải về (chỉ khi có fileUrl) */}
            {fileUrl && (
              <a
                href={fileUrl}
                download={fileName}
                className="p-2 rounded-xl text-slate-400 hover:text-brand-student hover:bg-slate-100 transition-colors"
                title="Tải về máy"
                aria-label="Tải tài liệu về máy"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            {/* Nút đóng modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Đóng modal"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* ─── Thông tin tác giả & ngày đăng (dòng sub-header) ──────── */}
        {doc.owner && (
          <div className="px-5 py-2 border-b border-slate-100 flex items-center gap-2 text-xs text-slate-500 shrink-0 bg-slate-50/60">
            <span className="font-semibold text-slate-700">
              {doc.owner.full_name || doc.owner.username || 'Người dùng'}
            </span>
            <span className="text-slate-300">•</span>
            <span>{formatDate(doc.created_at)}</span>
            {doc.file_size && (
              <>
                <span className="text-slate-300">•</span>
                <span>{formatFileSize(doc.file_size)}</span>
              </>
            )}
          </div>
        )}

        {/* ─── Nội dung chính: Xem trước hoặc Download Card ─────────── */}
        <div className="flex-1 overflow-auto flex flex-col min-h-0">
          {isLoading ? (
            // Skeleton loading — chờ API detail trả về
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-brand-student animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Đang tải thông tin tài liệu...</p>
              </div>
            </div>
          ) : !fileUrl ? (
            // Không có URL tài liệu
            <div className="flex-1 flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <AlertCircle className="w-10 h-10" />
                <p className="text-sm font-medium">Tài liệu này không có file đính kèm.</p>
              </div>
            </div>
          ) : canPreview ? (
            // PDF / Hình ảnh — Nhúng iframe xem trực tiếp
            <div className="flex-1 min-h-0 p-4 flex flex-col">
              <PreviewIframe fileUrl={fileUrl} title={doc.title} />
            </div>
          ) : (
            // DOCX / PPTX / ZIP — Download Card với hướng dẫn
            <DownloadCard
              fileType={fileType}
              fileUrl={fileUrl}
              fileName={fileName}
              fileSize={docDetail?.file_size || doc?.file_size}
            />
          )}
        </div>

        {/* ─── Footer: Mô tả tài liệu (nếu có) ────────────────────── */}
        {doc.description && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              <span className="font-semibold text-slate-600">Mô tả: </span>
              {doc.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(DocumentPreviewModal);
