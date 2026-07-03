/**
 * ============================================
 * CRON CONTROLLER - Tầng điều khiển API Trigger tác vụ ngầm cho Admin
 * ============================================
 */

import { toAPIResponse } from "#models/dto/response/APIResponse.js";
import { runTrashCleanupTask, runTokenCleanupTask } from "#jobs/cronJobs.js";

/**
 * POST /api/v1/admin/cron/trigger/trash-cleanup
 * Kích hoạt thủ công tác vụ dọn dẹp thùng rác (Chỉ Admin).
 */
export const triggerTrashCleanup = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "ADMIN") {
            return res
                .status(403)
                .json(toAPIResponse(403, "Từ chối truy cập.", null, ["Chỉ Quản trị viên (ADMIN) mới có quyền chạy tác vụ dọn rác."]));
        }

        const days = req.body?.days !== undefined ? Number(req.body.days) : 15;
        const result = await runTrashCleanupTask(days);

        return res
            .status(200)
            .json(toAPIResponse(200, `Kích hoạt thành công tác vụ dọn dẹp tài liệu quá hạn ${days} ngày trong thùng rác.`, result, null));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/admin/cron/trigger/token-cleanup
 * Kích hoạt thủ công tác vụ dọn dẹp Refresh Token hết hạn (Chỉ Admin).
 */
export const triggerTokenCleanup = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "ADMIN") {
            return res
                .status(403)
                .json(toAPIResponse(403, "Từ chối truy cập.", null, ["Chỉ Quản trị viên (ADMIN) mới có quyền chạy tác vụ dọn dẹp token."]));
        }

        const result = await runTokenCleanupTask();

        return res
            .status(200)
            .json(toAPIResponse(200, "Kích hoạt thành công tác vụ dọn dẹp Refresh Token hết hạn.", result, null));
    } catch (error) {
        next(error);
    }
};
