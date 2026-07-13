/**
 * formatters.js
 * Các hàm tiện ích để format dữ liệu hiển thị trên UI.
 * Không có side-effects, không gọi API — pure functions.
 */

// ─── DATE & TIME ─────────────────────────────────────────────────────────────

/**
 * Format ngày theo định dạng ngắn: "07/07/2026"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateInput));
  } catch {
    return '—';
  }
};

/**
 * Format thời gian tương đối: "3 ngày trước", "vừa xong"
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
    const diffMs = new Date(dateInput) - new Date();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
    return rtf.format(diffDay, 'day');
  } catch {
    return formatDate(dateInput);
  }
};

/**
 * Tính số ngày còn lại trước khi xóa vĩnh viễn.
 * Dùng trong TrashCard.
 * @param {string|Date} deletedAt
 * @param {number} maxDays - Thường là 15
 * @returns {number} Số ngày còn lại (âm nếu đã quá hạn)
 */
export const getDaysUntilPermanentDelete = (deletedAt, maxDays = 15) => {
  if (!deletedAt) return maxDays;
  const deleteDate = new Date(deletedAt);
  const expireDate = new Date(deleteDate.getTime() + maxDays * 24 * 60 * 60 * 1000);
  const diffMs = expireDate - new Date();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// ─── FILE SIZE ────────────────────────────────────────────────────────────────

/**
 * Format kích thước file từ bytes sang dạng đọc được.
 * @param {number} bytes
 * @returns {string} "2.5 MB", "400 KB", "1.2 GB"
 */
export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '—';
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
  return `${value} ${sizes[i]}`;
};

// ─── DOCUMENT TYPE ────────────────────────────────────────────────────────────

/**
 * Map document_type sang tên hiển thị tiếng Việt.
 * @param {string} type
 * @returns {string}
 */
export const getDocumentTypeLabel = (type) => {
  const map = {
    DOCUMENT:   'Tài liệu',
    ASSIGNMENT: 'Bài tập',
    EXAM:       'Đề thi',
    SLIDE:      'Slide',
    REFERENCE:  'Tham khảo',
  };
  return map[type] || type;
};

/**
 * Map document_type sang tên icon Lucide React.
 * Component tự import icon theo tên này.
 * @param {string} type
 * @returns {string} Tên icon Lucide
 */
export const getFileIconName = (type) => {
  const map = {
    DOCUMENT:   'FileText',
    ASSIGNMENT: 'ClipboardList',
    EXAM:       'GraduationCap',
    SLIDE:      'Presentation',
    REFERENCE:  'BookOpen',
  };
  return map[type] || 'File';
};

/**
 * Map visibility sang label và màu hiển thị.
 * @param {string} visibility - 'PUBLIC' | 'PRIVATE' | 'GROUP'
 * @returns {{ label: string, color: string }}
 */
export const getVisibilityInfo = (visibility) => {
  const map = {
    PUBLIC:  { label: 'Công khai',  color: 'text-green-600 bg-green-50' },
    PRIVATE: { label: 'Riêng tư',   color: 'text-slate-600 bg-slate-100' },
    GROUP:   { label: 'Nhóm',       color: 'text-blue-600 bg-blue-50' },
  };
  return map[visibility] || { label: visibility, color: 'text-slate-600 bg-slate-100' };
};

// ─── ROLE & THEME ─────────────────────────────────────────────────────────────

/**
 * Trả về bộ màu sắc (CSS variable values) theo Role.
 * Dùng để áp dụng Dynamic Theming cho Layout, Button, Badge.
 *
 * @param {'STUDENT'|'LECTURER'|'ADMIN'} role
 * @returns {{ primary: string, light: string, dark: string, name: string }}
 */
export const getThemeColorByRole = (role) => {
  const themes = {
    STUDENT:  { primary: '#306bec', light: '#dbeafe', dark: '#1e40af', name: 'student' },
    LECTURER: { primary: '#22a853', light: '#dcfce7', dark: '#15803d', name: 'lecturer' },
    ADMIN:    { primary: '#e03c3c', light: '#fee2e2', dark: '#b91c1c', name: 'admin' },
  };
  return themes[role] || themes.STUDENT;
};

/**
 * Map role sang label tiếng Việt.
 * @param {string} role
 * @returns {string}
 */
export const getRoleLabel = (role) => {
  const map = {
    STUDENT:  'Sinh viên',
    LECTURER: 'Giảng viên',
    ADMIN:    'Quản trị viên',
  };
  return map[role] || role;
};

// ─── NUMBERS ─────────────────────────────────────────────────────────────────

/**
 * Format số lớn sang dạng rút gọn: 1200 → "1.2K", 1500000 → "1.5M"
 * Dùng cho like_count, view_count trên DocumentCard.
 * @param {number} num
 * @returns {string}
 */
export const formatCount = (num) => {
  if (!num && num !== 0) return '0';
  if (num < 1000) return String(num);
  if (num < 1_000_000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
  return `${(num / 1_000_000).toFixed(1).replace('.0', '')}M`;
};

// ─── AVATAR URL ───────────────────────────────────────────────────────────────

/**
 * Chuyển đổi đường dẫn avatar (tương đối từ backend hoặc tuyệt đối) thành URL đầy đủ hợp lệ.
 * @param {string} avatarPath
 * @returns {string|null}
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (typeof avatarPath !== 'string') return null;
  if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) return avatarPath;
  const origin = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8081';
  return `${origin}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
};

// ─── FILE URL ─────────────────────────────────────────────────────────────────

/**
 * Chuyển đổi đường dẫn file tài liệu (tương đối từ backend hoặc tuyệt đối) thành URL đầy đủ hợp lệ.
 * Dùng cho: DocumentPreviewModal (mở PDF, tải .docx/.pptx/.zip).
 * Logic tương tự getAvatarUrl — chuẩn hóa mọi đường dẫn về backend origin.
 *
 * @param {string} filePath - Đường dẫn file từ field `file_url` của API
 * @returns {string|null}
 *
 * @example
 * getFileUrl('/uploads/documents/abc.pdf')
 * // => 'http://localhost:8081/uploads/documents/abc.pdf'
 * getFileUrl('http://cdn.example.com/file.pdf')
 * // => 'http://cdn.example.com/file.pdf' (giữ nguyên nếu đã là URL tuyệt đối)
 */
export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (typeof filePath !== 'string') return null;
  if (filePath.startsWith('http') || filePath.startsWith('data:')) return filePath;
  const origin = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:8081';
  return `${origin}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
};
