/**
 * ============================================
 * ADMIN ROUTES - Đăng ký các API quản trị hệ thống
 * ============================================
 * Tiền tố: /api/v1/admin (được đăng ký trong server.js)
 * Yêu cầu đăng nhập (jwtFilter) và quyền ADMIN (rbac("ADMIN")).
 */

import express from "express";
import { jwtFilter } from "#config/security/jwtFilter.js";
import { rbac } from "#config/security/rbacMiddleware.js";
import { getSystemStats, getSystemHealth, updateUserStatus } from "#controller/adminController.js";

const adminRouter = express.Router();

// Áp dụng middleware bảo định danh và phân quyền cho toàn bộ adminRouter
adminRouter.use(jwtFilter);
adminRouter.use(rbac("ADMIN"));

// @route  GET /api/v1/admin/stats
// @desc   Lấy thống kê hệ thống (tổng user, tài liệu, nhóm, views)
// @access Private (Chỉ ADMIN)
adminRouter.get("/stats", getSystemStats);

// @route  GET /api/v1/admin/system/health
// @desc   Lấy thông số giám sát sức khỏe hệ thống (RAM, CPU, Uptime, Trạng thái DB)
// @access Private (Chỉ ADMIN)
adminRouter.get("/system/health", getSystemHealth);

// @route  PATCH /api/v1/admin/users/:id/status
// @desc   Cập nhật trạng thái người dùng (ACTIVE, INACTIVE, BANNED)
// @access Private (Chỉ ADMIN)
adminRouter.patch("/users/:id/status", updateUserStatus);

export default adminRouter;
