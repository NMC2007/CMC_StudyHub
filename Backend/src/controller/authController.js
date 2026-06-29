/**
 * ============================================
 * AUTH CONTROLLER - Tầng điều khiển Authentication
 * ============================================
 * Nhận request từ Routes, gọi tầng Service xử lý,
 * wrap kết quả bằng APIResponse chuẩn hóa và gửi về cho client.
 *
 * Mọi response (thành công hay lỗi) đều qua toAPIResponse().
 * Lỗi không mong muốn sẽ được đẩy tới Global Error Handler qua next(error).
 */

import { toAPIResponse } from "#models/dto/response/APIResponse.js";
import * as authService from "#service/authService.js";

// ==========================================
// 1. ĐĂNG KÝ TÀI KHOẢN
// ==========================================
/**
 * POST /api/v1/auth/register
 * Nhận body → gọi authService.register → trả APIResponse
 */
export const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        // Đẩy lỗi không mong muốn tới Global Error Handler
        next(error);
    }
};

// ==========================================
// 2. ĐĂNG NHẬP
// ==========================================
/**
 * POST /api/v1/auth/login
 * Nhận body { identifier, password } → gọi authService.login → trả APIResponse
 */
export const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3. LÀM MỚI ACCESS TOKEN
// ==========================================
/**
 * POST /api/v1/auth/refresh
 * Nhận body { refreshToken } → gọi authService.refreshAccessToken → trả APIResponse
 */
export const refreshToken = async (req, res, next) => {
    try {
        const result = await authService.refreshAccessToken(req.body.refreshToken);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4. ĐĂNG XUẤT
// ==========================================
/**
 * POST /api/v1/auth/logout
 * Nhận body { refreshToken } → gọi authService.logout → trả APIResponse
 */
export const logout = async (req, res, next) => {
    try {
        const result = await authService.logout(req.body.refreshToken);

        return res
            .status(result.statusCode)
            .json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) {
        next(error);
    }
};