/**
 * ============================================
 * UPLOAD MIDDLEWARE - Quản lý tải lên tệp tin
 * ============================================
 * Cấu hình thư viện Multer & Cloudinary để xử lý multipart/form-data.
 * Chia làm 2 bộ lọc chuyên biệt:
 * 1. uploadDocument: dành cho tài liệu học tập (pdf, docx, pptx, zip) - tối đa 50MB (Lưu lên folder studyhub/documents)
 * 2. uploadAvatar: dành cho ảnh đại diện (jpg, jpeg, png, webp) - tối đa 5MB (Lưu lên folder studyhub/avatars)
 */

import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { UPLOAD_CONFIG } from "#config/constants.js";

dotenv.config();

// ==========================================
// CẤU HÌNH CLOUDINARY SDK
// ==========================================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// 1. CẤU HÌNH LƯU TRỮ TÀI LIỆU (DOCUMENT)
// ==========================================
const documentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
        const safeOriginalName = file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_");
        return {
            folder: "studyhub/documents",
            resource_type: "raw", // Dùng 'raw' cho tất cả file tài liệu (PDF, DOCX, PPTX, ZIP) để giữ nguyên cấu trúc nhị phân
            type: "upload",
            access_mode: "public",
            public_id: `${Date.now()}-${safeOriginalName}.${ext}`,
        };
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
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const safeOriginalName = file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_");
        return {
            folder: "studyhub/avatars",
            type: "upload",
            access_mode: "public",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            public_id: `${Date.now()}-${safeOriginalName}`,
            transformation: [{ width: 500, height: 500, crop: "limit" }],
        };
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

