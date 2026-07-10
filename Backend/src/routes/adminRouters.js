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
import { getSystemStats } from "#controller/adminController.js";

const adminRouter = express.Router();

// Áp dụng middleware bảo định danh và phân quyền cho toàn bộ adminRouter
adminRouter.use(jwtFilter);
adminRouter.use(rbac("ADMIN"));

// @route  GET /api/v1/admin/stats
// @desc   Lấy thống kê hệ thống (tổng user, tài liệu, nhóm, views)
// @access Private (Chỉ ADMIN)
adminRouter.get("/stats", getSystemStats);

export default adminRouter;
