/**
 * ============================================
 * ADMIN CONTROLLER - Tầng điều khiển Quản trị Hệ thống
 * ============================================
 * Cung cấp các API tổng hợp dữ liệu, thống kê hệ thống dành riêng cho Admin.
 */

import { AppDataSource } from "#config/db.js";
import { toAPIResponse } from "#models/dto/response/APIResponse.js";

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
