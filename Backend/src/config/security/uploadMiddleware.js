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
        // Tên file unique: timestamp + tên gốc (đã thay thế khoảng trắng bằng dấu gạch dưới)
        const safeOriginalName = file.originalname.replace(/\s+/g, "_");
        const uniqueSuffix = `${Date.now()}-${safeOriginalName}`;
        cb(null, uniqueSuffix);
    },
});

const documentFileFilter = (req, file, cb) => {
    // Các phần mở rộng cho phép
    const allowedExtensions = [".pdf", ".docx", ".pptx", ".zip"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Định dạng file không hợp lệ! Chỉ chấp nhận file: .pdf, .docx, .pptx, .zip"), false);
    }
};

export const uploadDocument = multer({
    storage: documentStorage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // Giới hạn 50MB
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
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Định dạng ảnh không hợp lệ! Chỉ chấp nhận ảnh: .jpg, .jpeg, .png, .webp"), false);
    }
};

export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: avatarFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
    },
});
