/**
 * ============================================
 * FRONTEND CONSTANTS - Cấu hình hằng số toàn cục
 * ============================================
 * Gom nhóm các giới hạn upload, định dạng file hợp lệ và thông báo lỗi.
 */

export const UPLOAD_CONFIG = {
  DOC: {
    MAX_SIZE_MB: 50,
    MAX_SIZE_BYTES: 50 * 1024 * 1024,
    ACCEPTED_EXTENSIONS: ['.pdf', '.docx', '.pptx', '.zip'],
    ACCEPTED_MIME_TYPES: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    LABEL: 'Hỗ trợ: .pdf, .docx, .pptx, .zip (tối đa 50MB)',
    ERROR_MESSAGE: 'Vui lòng chọn file tài liệu hợp lệ (.pdf, .docx, .pptx, .zip, tối đa 50MB).',
  },
  AVATAR: {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
    ACCEPTED_MIME_TYPES: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    LABEL: 'Hỗ trợ: .jpg, .png, .webp (tối đa 5MB)',
    ERROR_MESSAGE: 'Vui lòng chọn file ảnh hợp lệ (.jpg, .jpeg, .png, .webp, tối đa 5MB).',
  },
};
