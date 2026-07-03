/**
 * ============================================
 * GROUP ROUTES - Đăng ký các API Nhóm học tập
 * ============================================
 * Tiền tố: /api/v1/groups
 * Tất cả các API yêu cầu đăng nhập (jwtFilter).
 */

import express from "express";
import { jwtFilter } from "#config/security/jwtFilter.js";
import {
    createGroup,
    getMyGroups,
    getGroupDetail,
    addGroupMembers,
    removeGroupMember,
    disbandGroup,
    shareDocumentToGroup,
    removeDocumentFromGroup,
    getGroupDocuments,
    uploadGroupDocument,
} from "#controller/groupController.js";
import { uploadDocument as uploadDocumentMiddleware } from "#config/security/uploadMiddleware.js";

const groupRouter = express.Router();

// Tất cả các API quản lý nhóm đều yêu cầu xác thực JWT
groupRouter.use(jwtFilter);

// @route  POST /api/v1/groups
// @desc   Tạo nhóm học tập mới
groupRouter.post("/", createGroup);

// @route  GET /api/v1/groups
// @desc   Lấy danh sách nhóm của tôi (Sở hữu hoặc Tham gia)
groupRouter.get("/", getMyGroups);

// @route  GET /api/v1/groups/:id
// @desc   Lấy thông tin chi tiết nhóm & danh sách thành viên
groupRouter.get("/:id", getGroupDetail);

// @route  POST /api/v1/groups/:id/members
// @desc   Thêm nhiều thành viên vào nhóm (Chỉ Owner)
groupRouter.post("/:id/members", addGroupMembers);

// @route  DELETE /api/v1/groups/:id/members/:userId
// @desc   Xóa thành viên khỏi nhóm (Chỉ Owner)
groupRouter.delete("/:id/members/:userId", removeGroupMember);

// @route  DELETE /api/v1/groups/:id
// @desc   Giải tán nhóm học tập (Chỉ Owner hoặc Admin)
groupRouter.delete("/:id", disbandGroup);

// @route  POST /api/v1/groups/:id/documents
// @desc   Chia sẻ tài liệu vào nhóm
groupRouter.post("/:id/documents", shareDocumentToGroup);

// @route  POST /api/v1/groups/:id/documents/upload
// @desc   Upload tài liệu mới trực tiếp vào nhóm (mặc định tag GROUP)
groupRouter.post("/:id/documents/upload", uploadDocumentMiddleware.single("file"), uploadGroupDocument);

// @route  GET /api/v1/groups/:id/documents
// @desc   Lấy danh sách tài liệu chia sẻ trong nhóm
groupRouter.get("/:id/documents", getGroupDocuments);

// @route  DELETE /api/v1/groups/:id/documents/:documentId
// @desc   Gỡ tài liệu khỏi nhóm
groupRouter.delete("/:id/documents/:documentId", removeDocumentFromGroup);

export default groupRouter;
