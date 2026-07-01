/**
 * ============================================
 * DOCUMENT ROUTES - Đăng ký các API quản lý Tài liệu
 * ============================================
 * Tiền tố: /api/v1/documents (được đăng ký trong server.js)
 *
 * Phân quyền:
 *   - GET /search: Yêu cầu đăng nhập (jwtFilter) — mọi role đều được tìm kiếm.
 *   - GET /:id: Yêu cầu đăng nhập (jwtFilter) — mọi role đều được xem chi tiết.
 *   - POST /upload: Yêu cầu đăng nhập (jwtFilter) — mọi role đều được upload.
 *                   Upload Guard nghiệp vụ được kiểm tra trong Service (không phải middleware).
 *   - PUT /:id: Yêu cầu đăng nhập (jwtFilter) — quyền Owner/Admin kiểm tra trong Service.
 *   - DELETE /:id: Yêu cầu đăng nhập (jwtFilter) — Soft delete, quyền Owner/Admin kiểm tra trong Service.
 *   - POST /:id/restore: Yêu cầu đăng nhập (jwtFilter) — quyền Owner/Admin kiểm tra trong Service.
 *
 * Lý do không dùng rbac() ở route level cho PUT/DELETE/restore:
 *   Vì quyền không chỉ phụ thuộc vào role (STUDENT/LECTURER/ADMIN) mà còn phụ thuộc vào
 *   ownership (chủ sở hữu tài liệu). Logic này nằm ở Service layer để tránh query DB 2 lần.
 */

import express from "express";
import {
    uploadDocument,
    getDocumentDetail,
    updateDocument,
    softDeleteDocument,
    restoreDocument,
    searchDocuments,
    toggleLike,
    toggleBookmark,
    getBookmarkedDocuments,
    getLikedDocuments,
} from "#controller/documentController.js";
import { jwtFilter } from "#config/security/jwtFilter.js";
import { uploadDocument as uploadDocumentMiddleware } from "#config/security/uploadMiddleware.js";

const documentRouter = express.Router();

// Áp dụng jwtFilter cho tất cả các endpoint trong router này
documentRouter.use(jwtFilter);

// ==========================================
// API TÌM KIẾM & DANH SÁCH TƯƠNG TÁC (đặt TRƯỚC /:id để tránh nhầm param id)
// ==========================================

// @route  GET /api/v1/documents/search
// @desc   Tìm kiếm tài liệu với bộ lọc đa điều kiện
documentRouter.get("/search", searchDocuments);

// @route  GET /api/v1/documents/bookmarks
// @desc   Lấy danh sách tài liệu đã bookmark của user hiện tại (kèm tìm kiếm & phân trang)
documentRouter.get("/bookmarks", getBookmarkedDocuments);

// @route  GET /api/v1/documents/likes
// @desc   Lấy danh sách tài liệu đã like của user hiện tại (kèm tìm kiếm & phân trang)
documentRouter.get("/likes", getLikedDocuments);

// ==========================================
// API CRUD TÀI LIỆU & TƯƠNG TÁC THEO ID
// ==========================================

// @route  POST /api/v1/documents/upload
// @desc   Upload tài liệu mới
documentRouter.post("/upload", uploadDocumentMiddleware.single("file"), uploadDocument);

// @route  POST /api/v1/documents/:id/like
// @desc   Thích hoặc bỏ thích tài liệu
documentRouter.post("/:id/like", toggleLike);

// @route  POST /api/v1/documents/:id/bookmark
// @desc   Đánh dấu hoặc gỡ đánh dấu tài liệu
documentRouter.post("/:id/bookmark", toggleBookmark);

// @route  GET /api/v1/documents/:id
// @desc   Lấy chi tiết tài liệu + tự động ghi nhận lượt xem
documentRouter.get("/:id", getDocumentDetail);

// @route  PUT /api/v1/documents/:id
// @desc   Cập nhật thông tin tài liệu (title, description, visibility, document_type)
// @access Private — Chỉ Owner hoặc ADMIN (kiểm tra trong Service)
documentRouter.put("/:id", updateDocument);

// @route  DELETE /api/v1/documents/:id
// @desc   Xóa mềm tài liệu (chuyển vào thùng rác)
// @access Private — Chỉ Owner hoặc ADMIN (kiểm tra trong Service)
documentRouter.delete("/:id", softDeleteDocument);

// @route  POST /api/v1/documents/:id/restore
// @desc   Khôi phục tài liệu từ thùng rác
// @access Private — Chỉ Owner hoặc ADMIN (kiểm tra trong Service)
documentRouter.post("/:id/restore", restoreDocument);

export default documentRouter;
