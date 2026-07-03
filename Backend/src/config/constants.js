/**
 * ============================================
 * CONSTANTS - Cấu hình hằng số toàn cục StudyHub
 * ============================================
 * Gom nhóm cấu hình dung lượng và định dạng mở rộng cho upload file.
 */

export const UPLOAD_CONFIG = {
    DOC: {
        MAX_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
        ALLOWED_EXTENSIONS: [".pdf", ".docx", ".pptx", ".zip"],
        ERROR_MESSAGE: "Định dạng file không hợp lệ! Chỉ chấp nhận file: .pdf, .docx, .pptx, .zip",
    },
    AVATAR: {
        MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
        ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
        ERROR_MESSAGE: "Định dạng ảnh không hợp lệ! Chỉ chấp nhận ảnh: .jpg, .jpeg, .png, .webp",
    },
};
