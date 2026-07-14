/**
 * ============================================
 * CRON CONTROLLER - Tầng điều khiển API Trigger tác vụ ngầm cho Admin
 * ============================================
 * Lưu ý: Kiểm tra quyền ADMIN đã được xử lý ở tầng Router (rbac middleware).
 */

import { toAPIResponse } from "#models/dto/response/APIResponse.js";
import { runTrashCleanupTask, runTokenCleanupTask } from "#jobs/cronJobs.js";

/**
 * POST /api/v1/admin/cron/trigger/trash-cleanup
 * Kích hoạt thủ công tác vụ dọn dẹp thùng rác (Chỉ Admin).
 */
export const triggerTrashCleanup = async (req, res, next) => {
    try {
        const rawDays = req.body?.days;
        const days = rawDays !== undefined && rawDays !== "" && !isNaN(rawDays) ? Number(rawDays) : 15;
        const result = await runTrashCleanupTask(days);

        const msg = days === 0
            ? "Kích hoạt thành công tác vụ dọn sạch toàn bộ tài liệu trong thùng rác."
            : `Kích hoạt thành công tác vụ dọn dẹp tài liệu quá hạn ${days} ngày trong thùng rác.`;

        return res
            .status(200)
            .json(toAPIResponse(200, msg, result, null));
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
        const result = await runTokenCleanupTask();

        return res
            .status(200)
            .json(toAPIResponse(200, "Kích hoạt thành công tác vụ dọn dẹp Refresh Token hết hạn.", result, null));
    } catch (error) {
        next(error);
    }
};
