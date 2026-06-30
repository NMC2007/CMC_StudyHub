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
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {}
        }
        next(error);
    }
};
