/**
 * ============================================
 * UPLOAD MIDDLEWARE - Quản lý tải lên tệp tin
 * ============================================
 * Cấu hình thư viện Multer để xử lý multipart/form-data.
 * Chia làm 2 bộ lọc chuyên biệt:
 * 1. uploadDocument: dành cho tài liệu học tập (pdf, docx, pptx, zip) - tối đa 50MB
 * 2. uploadAvatar: dành cho ảnh đại diện (jpg, jpeg, png, webp) - tối đa 5MB
 */

import multer from "multer";
import path from "path";
import fs from "fs";
import { UPLOAD_CONFIG } from "#config/constants.js";

// === Hàm tạo thư mục nếu chưa tồn tại ===
const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// ==========================================
// 1. CẤU HÌNH LƯU TRỮ TÀI LIỆU (DOCUMENT)
// ==========================================
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), "public/uploads/documents");
        ensureDirectoryExistence(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const safeOriginalName = file.originalname.replace(/\s+/g, "_");
        const uniqueSuffix = `${Date.now()}-${safeOriginalName}`;
        cb(null, uniqueSuffix);
    },
});

const documentFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (UPLOAD_CONFIG.DOC.ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(UPLOAD_CONFIG.DOC.ERROR_MESSAGE), false);
    }
};

export const uploadDocument = multer({
    storage: documentStorage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: UPLOAD_CONFIG.DOC.MAX_SIZE_BYTES,
    },
});

// ==========================================
// 2. CẤU HÌNH LƯU TRỮ ẢNH ĐẠI DIỆN (AVATAR)
// ==========================================
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), "public/uploads/avatars");
        ensureDirectoryExistence(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const safeOriginalName = file.originalname.replace(/\s+/g, "_");
        const uniqueSuffix = `${Date.now()}-${safeOriginalName}`;
        cb(null, uniqueSuffix);
    },
});

const avatarFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (UPLOAD_CONFIG.AVATAR.ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(UPLOAD_CONFIG.AVATAR.ERROR_MESSAGE), false);
    }
};

export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: avatarFileFilter,
    limits: {
        fileSize: UPLOAD_CONFIG.AVATAR.MAX_SIZE_BYTES,
    },
});
