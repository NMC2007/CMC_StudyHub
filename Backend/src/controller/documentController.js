/**
 * ============================================
 * DOCUMENT CONTROLLER - Tầng điều khiển Tài liệu
 * ============================================
 * Tiếp nhận HTTP request, gọi Service, bọc lỗi try-catch, trả response chuẩn APIResponse.
 * Phòng thủ bổ sung: nếu có exception bất ngờ khi upload,
 * Controller tự xóa file rác trước khi đẩy lỗi vào Global Error Handler.
 */

import fs from "fs";
import { toAPIResponse } from "#models/dto/response/APIResponse.js";
import * as documentService from "#service/documentService.js";

// ==========================================
// 1. UPLOAD TÀI LIỆU
// ==========================================

/**
 * POST /api/v1/documents/upload
 * Upload tài liệu mới. Kèm Upload Guard cho STUDENT.
 */
export const uploadDocument = async (req, res, next) => {
    try {
        const user = req.user;
        const result = await documentService.uploadDocument(user, req.file, req.body);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        // Phòng thủ: xóa file rác nếu exception xảy ra ngoài tầm kiểm soát của Service
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {}
        }
        next(error);
    }
};

// ==========================================
// 2. LẤY CHI TIẾT TÀI LIỆU
// ==========================================

/**
 * GET /api/v1/documents/:id
 * Lấy thông tin chi tiết tài liệu theo ID.
 */
export const getDocumentDetail = async (req, res, next) => {
    try {
        const documentId = parseInt(req.params.id);
        if (!documentId || isNaN(documentId)) {
            return res
                .status(400)
                .json(toAPIResponse(400, "ID tài liệu không hợp lệ.", null, ["Invalid Document ID"]));
        }

        const user = req.user || null;
        const result = await documentService.getDocumentDetail(documentId, user);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3. CẬP NHẬT TÀI LIỆU
// ==========================================

/**
 * PUT /api/v1/documents/:id
 * Cập nhật thông tin tài liệu (title, description, visibility, document_type).
 * Chỉ Owner hoặc ADMIN.
 */
export const updateDocument = async (req, res, next) => {
    try {
        const documentId = parseInt(req.params.id);
        if (!documentId || isNaN(documentId)) {
            return res
                .status(400)
                .json(toAPIResponse(400, "ID tài liệu không hợp lệ.", null, ["Invalid Document ID"]));
        }

        const user = req.user;
        const result = await documentService.updateDocument(documentId, user, req.body);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4. XÓA MỀM TÀI LIỆU
// ==========================================

/**
 * DELETE /api/v1/documents/:id
 * Xóa mềm tài liệu (chuyển vào thùng rác).
 * Chỉ Owner hoặc ADMIN.
 */
export const softDeleteDocument = async (req, res, next) => {
    try {
        const documentId = parseInt(req.params.id);
        if (!documentId || isNaN(documentId)) {
            return res
                .status(400)
                .json(toAPIResponse(400, "ID tài liệu không hợp lệ.", null, ["Invalid Document ID"]));
        }

        const user = req.user;
        const result = await documentService.softDeleteDocument(documentId, user);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 5. KHÔI PHỤC TÀI LIỆU
// ==========================================

/**
 * POST /api/v1/documents/:id/restore
 * Khôi phục tài liệu từ thùng rác.
 * Chỉ Owner hoặc ADMIN.
 */
export const restoreDocument = async (req, res, next) => {
    try {
        const documentId = parseInt(req.params.id);
        if (!documentId || isNaN(documentId)) {
            return res
                .status(400)
                .json(toAPIResponse(400, "ID tài liệu không hợp lệ.", null, ["Invalid Document ID"]));
        }

        const user = req.user;
        const result = await documentService.restoreDocument(documentId, user);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 6. TÌM KIẾM & LỌC NÂNG CAO
// ==========================================

/**
 * GET /api/v1/documents/search
 * Tìm kiếm tài liệu với bộ lọc đa điều kiện và phân trang.
 */
export const searchDocuments = async (req, res, next) => {
    try {
        const user = req.user || null;
        const result = await documentService.searchDocuments(req.query, user);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 7. MODULE TƯƠNG TÁC TÀI LIỆU (LIKE & BOOKMARK)
// ==========================================

/**
 * POST /api/v1/documents/:id/like
 * Thích hoặc bỏ thích tài liệu.
 */
export const toggleLike = async (req, res, next) => {
    try {
        const documentId = parseInt(req.params.id);
        if (!documentId || isNaN(documentId)) {
            return res
                .status(400)
                .json(toAPIResponse(400, "ID tài liệu không hợp lệ.", null, ["Invalid Document ID"]));
        }

        const user = req.user;
        const result = await documentService.toggleLikeDocument(documentId, user);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/documents/:id/bookmark
 * Đánh dấu hoặc gỡ đánh dấu tài liệu.
 */
export const toggleBookmark = async (req, res, next) => {
    try {
        const documentId = parseInt(req.params.id);
        if (!documentId || isNaN(documentId)) {
            return res
                .status(400)
                .json(toAPIResponse(400, "ID tài liệu không hợp lệ.", null, ["Invalid Document ID"]));
        }

        const user = req.user;
        const result = await documentService.toggleBookmarkDocument(documentId, user);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/documents/bookmarks
 * Lấy danh sách tài liệu đã bookmark của user hiện tại (kèm tìm kiếm & phân trang).
 */
export const getBookmarkedDocuments = async (req, res, next) => {
    try {
        const user = req.user;
        const queryParams = { ...req.query, is_bookmarked: true };
        const result = await documentService.searchDocuments(queryParams, user);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/documents/likes
 * Lấy danh sách tài liệu đã like của user hiện tại (kèm tìm kiếm & phân trang).
 */
export const getLikedDocuments = async (req, res, next) => {
    try {
        const user = req.user;
        const queryParams = { ...req.query, is_liked: true };
        const result = await documentService.searchDocuments(queryParams, user);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};
