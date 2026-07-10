/**
 * ============================================
 * ADMIN CONTROLLER - Tầng điều khiển Quản trị Hệ thống
 * ============================================
 * Cung cấp các API tổng hợp dữ liệu, thống kê hệ thống dành riêng cho Admin.
 */

import os from "os";
import { AppDataSource } from "#config/db.js";
import { toAPIResponse } from "#models/dto/response/APIResponse.js";
import * as userService from "#service/userService.js";

/**
 * GET /api/v1/admin/stats
 * Lấy các chỉ số thống kê tổng quan của hệ thống phục vụ Admin Dashboard.
 */
export const getSystemStats = async (req, res, next) => {
    try {
        const userRepo = AppDataSource.getRepository("User");
        const documentRepo = AppDataSource.getRepository("Document");
        const groupRepo = AppDataSource.getRepository("Group");

        // 1. Đếm tổng số lượng Users trong hệ thống
        const totalUsers = await userRepo.count();

        // 2. Đếm tổng số lượng Tài liệu đang lưu hành (chưa bị xóa mềm)
        const totalDocuments = await documentRepo.count({
            where: { is_deleted: false }
        });

        // 3. Đếm tổng số lượng Nhóm học tập
        const totalGroups = await groupRepo.count();

        // 4. Tính tổng lượt xem (view_count) của toàn bộ tài liệu chưa xóa mềm
        const viewResult = await documentRepo
            .createQueryBuilder("doc")
            .select("SUM(doc.view_count)", "total_views")
            .where("doc.is_deleted = :isDeleted", { isDeleted: false })
            .getRawOne();

        const totalViews = viewResult && viewResult.total_views ? Number(viewResult.total_views) : 0;

        const statsData = {
            total_users: totalUsers,
            total_documents: totalDocuments,
            total_groups: totalGroups,
            total_views: totalViews
        };

        return res
            .status(200)
            .json(toAPIResponse(200, "Lấy thống kê hệ thống thành công.", statsData, null));
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/v1/admin/users/:id/status
 * Cập nhật trạng thái người dùng (Chỉ Admin).
 */
export const updateUserStatus = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res
                .status(400)
                .json(toAPIResponse(400, "ID người dùng không hợp lệ.", null, "Invalid User ID"));
        }

        const { status } = req.body;
        if (!status) {
            return res
                .status(400)
                .json(toAPIResponse(400, "Vui lòng cung cấp trường status trong body.", null, "Missing Status Field"));
        }

        const result = await userService.updateUserStatus(userId, status);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/admin/system/health
 * Lấy thông số giám sát sức khỏe hệ thống (RAM, CPU, Uptime, Trạng thái DB).
 */
export const getSystemHealth = async (req, res, next) => {
    try {
        const isDbConnected = AppDataSource.isInitialized;
        const memoryUsage = process.memoryUsage();
        const uptimeSeconds = process.uptime();
        const cpuLoad = os.loadavg();

        const totalRamMb = Math.round(os.totalmem() / (1024 * 1024));
        const freeRamMb = Math.round(os.freemem() / (1024 * 1024));
        const usedHeapMb = Math.round(memoryUsage.heapUsed / (1024 * 1024));

        const healthData = {
            status: isDbConnected ? "UP" : "DOWN",
            database: isDbConnected ? "Connected" : "Disconnected",
            memory: {
                total_mb: totalRamMb,
                free_mb: freeRamMb,
                heap_used_mb: usedHeapMb,
            },
            cpu_load: {
                load_1m: cpuLoad[0] || 0,
                load_5m: cpuLoad[1] || 0,
                load_15m: cpuLoad[2] || 0,
            },
            uptime_seconds: Math.round(uptimeSeconds),
        };

        return res
            .status(200)
            .json(toAPIResponse(200, "Kiểm tra sức khỏe hệ thống thành công.", healthData, null));
    } catch (error) {
        next(error);
    }
};
