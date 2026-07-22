/**
 * ============================================
 * USER CONTROLLER - Tầng điều khiển User Profile
 * ============================================
 */

import fs from "fs";
import { toAPIResponse } from "#models/dto/response/APIResponse.js";
import * as userService from "#service/userService.js";

/**
 * GET /api/v1/users/profile
 * Lấy thông tin tài khoản hiện tại (từ req.user.id do jwtFilter cung cấp)
 */
export const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await userService.getUserProfile(userId);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/users/profile
 * Cập nhật thông tin cá nhân (tên, số điện thoại, ngày sinh)
 */
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await userService.updateUserProfile(userId, req.body);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/users/avatar
 * Cập nhật ảnh đại diện từ Multer req.file
 */
export const updateAvatar = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await userService.updateUserAvatar(userId, req.file);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        if (req.file && req.file.path) {
            try {
                await fs.promises.unlink(req.file.path);
            } catch (e) {
                if (e.code !== "ENOENT") {
                    console.warn(`⚠️ [Controller Cleanup Warning] Không thể xóa file tạm avatar: ${req.file.path}`, e.message);
                }
            }
        }
        next(error);
    }
};

/**
 * GET /api/v1/users
 * Lấy danh sách toàn bộ người dùng kèm phân trang & bộ lọc
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const result = await userService.getAllUsers(req.query);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/users/search
 * Tìm kiếm người dùng theo từ khóa q (tên, mã code, email, username, phone)
 */
export const searchUsers = async (req, res, next) => {
    try {
        const result = await userService.getAllUsers(req.query);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/users/:id
 * Lấy thông tin trang cá nhân của người dùng theo ID (kèm danh sách tài liệu họ đã đăng).
 * Tài liệu PRIVATE và GROUP bị lọc theo quyền truy cập của người xem (currentUser).
 * @access Private — Yêu cầu jwtFilter (mọi người dùng đã đăng nhập)
 */
export const getUserProfileById = async (req, res, next) => {
    try {
        const targetUserId = parseInt(req.params.id);

        if (isNaN(targetUserId) || targetUserId <= 0) {
            return res
                .status(400)
                .json(toAPIResponse(400, "ID người dùng không hợp lệ.", null, ["Invalid User ID"]));
        }

        const result = await userService.getUserProfileWithDocuments(
            targetUserId,
            req.user,
            req.query
        );

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};
