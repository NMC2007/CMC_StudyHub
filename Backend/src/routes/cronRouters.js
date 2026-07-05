/**
 * ============================================
 * CRON ROUTES - Đăng ký các API bảo trì hệ thống cho Admin
 * ============================================
 * Tiền tố: /api/v1/admin/cron
 * Yêu cầu đăng nhập (jwtFilter) và kiểm tra quyền Admin (rbac).
 */

import express from "express";
import { jwtFilter } from "#config/security/jwtFilter.js";
import { rbac } from "#config/security/rbacMiddleware.js";
import { triggerTrashCleanup, triggerTokenCleanup } from "#controller/cronController.js";

const cronRouter = express.Router();

cronRouter.use(jwtFilter);

// @route  POST /api/v1/admin/cron/trigger/trash-cleanup
// @desc   Chạy thủ công tác vụ dọn dẹp tài liệu trong thùng rác quá hạn (Chỉ Admin)
cronRouter.post("/trigger/trash-cleanup", rbac("ADMIN"), triggerTrashCleanup);

// @route  POST /api/v1/admin/cron/trigger/token-cleanup
// @desc   Chạy thủ công tác vụ dọn dẹp Refresh Token hết hạn (Chỉ Admin)
cronRouter.post("/trigger/token-cleanup", rbac("ADMIN"), triggerTokenCleanup);

export default cronRouter;
