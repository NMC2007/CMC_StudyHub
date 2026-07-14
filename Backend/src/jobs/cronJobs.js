/**
 * ============================================
 * CRON JOBS MODULE - Tác vụ chạy ngầm định kỳ
 * ============================================
 * Nhiệm vụ:
 *   1. Dọn dẹp thùng rác (Trash Cleanup): Xóa vĩnh viễn tài liệu trong thùng rác > 15 ngày
 *      kèm xóa file vật lý trên ổ đĩa để giải phóng dung lượng.
 *   2. Dọn dẹp Refresh Token hết hạn (Token Cleanup): Xóa các bản ghi refresh_tokens cũ.
 */

import cron from "node-cron";
import fs from "fs";
import path from "path";
import { AppDataSource } from "#config/db.js";
import { findExpiredTrashDocumentsRepo, hardDeleteDocumentById } from "#repository/documentRepository.js";

/**
 * Thực hiện nghiệp vụ dọn dẹp tài liệu trong thùng rác quá hạn (Mặc định > 15 ngày).
 * Hàm này được tách riêng để có thể gọi tự động qua Cron hoặc kích hoạt thủ công qua API Admin.
 * @param {number} days - Số ngày giới hạn trong thùng rác
 * @returns {Promise<{ deletedCount: number, filesRemovedCount: number }>}
 */
export const runTrashCleanupTask = async (days = 15) => {
    try {
        const expiredDocs = await findExpiredTrashDocumentsRepo(days);
        let deletedCount = 0;
        let filesRemovedCount = 0;

        for (const doc of expiredDocs) {
            // Bước 1: Xóa file vật lý khỏi ổ đĩa
            if (doc.file_url) {
                // Biến đổi relative url (/uploads/documents/xxx.pdf) thành absolute path
                const relativePath = doc.file_url.startsWith("/") ? doc.file_url.slice(1) : doc.file_url;
                const absolutePath = path.join(process.cwd(), relativePath);
                try {
                    await fs.promises.unlink(absolutePath);
                    filesRemovedCount++;
                } catch (fileErr) {
                    if (fileErr.code !== "ENOENT") {
                        console.warn(`⚠️ [Trash Cleanup] Không thể xóa file vật lý: ${absolutePath}`, fileErr.message);
                    }
                }
            }

            // Bước 2: Xóa vĩnh viễn khỏi Database
            await hardDeleteDocumentById(doc.id);
            deletedCount++;
        }

        if (deletedCount > 0) {
            const timeDesc = days === 0 ? "toàn bộ (0 ngày)" : `quá hạn ${days} ngày`;
            console.info(`🧹 [CronJob - Trash Cleanup] Đã dọn dẹp vĩnh viễn ${deletedCount} tài liệu ${timeDesc} (${filesRemovedCount} file vật lý).`);
        }

        return { deletedCount, filesRemovedCount };
    } catch (error) {
        console.error("❌ [CronJob - Trash Cleanup Error]:", error);
        throw error;
    }
};

/**
 * Thực hiện nghiệp vụ dọn dẹp Refresh Token đã hết hạn trong database.
 * @returns {Promise<{ deletedTokensCount: number }>}
 */
export const runTokenCleanupTask = async () => {
    try {
        const refreshTokenRepo = AppDataSource.getRepository("RefreshToken");
        const result = await refreshTokenRepo
            .createQueryBuilder()
            .delete()
            .where("expires_at <= :now", { now: new Date() })
            .execute();

        const deletedTokensCount = result.affected || 0;
        if (deletedTokensCount > 0) {
            console.info(`🧹 [CronJob - Token Cleanup] Đã xóa ${deletedTokensCount} Refresh Token hết hạn.`);
        }

        return { deletedTokensCount };
    } catch (error) {
        console.error("❌ [CronJob - Token Cleanup Error]:", error);
        throw error;
    }
};

/**
 * Khởi động các lịch trình Cron Jobs định kỳ của hệ thống.
 */
export const initCronJobs = () => {
    // Lịch trình: Chạy vào lúc 02:00 AM mỗi ngày (0 2 * * *)
    cron.schedule("0 2 * * *", async () => {
        console.info("⏰ [Node-Cron Scheduler] Bắt đầu chạy các tác vụ bảo trì định kỳ lúc 02:00 AM...");
        await runTrashCleanupTask(15);
        await runTokenCleanupTask();
        console.info("✅ [Node-Cron Scheduler] Hoàn tất các tác vụ bảo trì định kỳ.");
    });

    console.info("🚀 [Node-Cron] Đã khởi động bộ lập lịch tự động dọn dẹp Thùng rác (>15 ngày) & Token lúc 02:00 sáng hàng ngày.");
};
