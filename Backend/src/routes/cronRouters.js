/**
 * ============================================
 * CRON ROUTES - Đăng ký các API bảo trì hệ thống cho Admin
 * ============================================
 * Tiền tố: /api/v1/admin/cron
 * Yêu cầu đăng nhập (jwtFilter) và kiểm tra quyền Admin trong Controller.
 */

import express from "express";
import { jwtFilter } from "#config/security/jwtFilter.js";
import { triggerTrashCleanup, triggerTokenCleanup } from "#controller/cronController.js";

const cronRouter = express.Router();

cronRouter.use(jwtFilter);

// @route  POST /api/v1/admin/cron/trigger/trash-cleanup
// @desc   Chạy thủ công tác vụ dọn dẹp tài liệu trong thùng rác quá hạn (Chỉ Admin)
cronRouter.post("/trigger/trash-cleanup", triggerTrashCleanup);

// @route  POST /api/v1/admin/cron/trigger/token-cleanup
// @desc   Chạy thủ công tác vụ dọn dẹp Refresh Token hết hạn (Chỉ Admin)
cronRouter.post("/trigger/token-cleanup", triggerTokenCleanup);

export default cronRouter;
