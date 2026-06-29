/**
 * ============================================
 * JWT PROVIDER - Tiện ích xử lý JSON Web Token
 * ============================================
 * File này chứa các pure functions (hàm thuần túy) chịu trách nhiệm:
 * - Tạo Access Token (ngắn hạn - 15 phút)
 * - Tạo Refresh Token (dài hạn - 7 ngày)
 * - Giải mã và xác minh tính hợp lệ của Token
 * - Tính toán ngày hết hạn để lưu vào Database
 */

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";

/**
 * Tạo Access Token mới từ thông tin người dùng (payload).
 * @param {Object} payload - Dữ liệu muốn mã hóa vào token (ví dụ: { id, role, cohort_id, faculty_id, major_id })
 * @returns {string} - Chuỗi Access Token
 */
export const generateAccessToken = (payload) => {
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn });
};

/**
 * Tạo Refresh Token mới từ thông tin người dùng (payload).
 * @param {Object} payload - Dữ liệu muốn mã hóa vào token (thường chỉ cần { id })
 * @returns {string} - Chuỗi Refresh Token
 */
export const generateRefreshToken = (payload) => {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn });
};

/**
 * Xác minh và giải mã Access Token.
 * @param {string} token - Chuỗi Access Token cần kiểm tra
 * @returns {Object} - Payload đã được giải mã nếu hợp lệ
 * @throws {Error} - Ném ra lỗi nếu token hết hạn hoặc sai chữ ký
 */
export const verifyAccessToken = (token) => {
    return jwt.verify(token, ACCESS_SECRET);
};

/**
 * Xác minh và giải mã Refresh Token.
 * @param {string} token - Chuỗi Refresh Token cần kiểm tra
 * @returns {Object} - Payload đã được giải mã nếu hợp lệ
 * @throws {Error} - Ném ra lỗi nếu token hết hạn hoặc sai chữ ký
 */
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_SECRET);
};

/**
 * Tính toán thời điểm hết hạn (Date object) từ số ngày cho trước.
 * Dùng để lưu cột `expires_at` vào bảng `refresh_tokens` trong Database.
 * @param {number} days - Số ngày hiệu lực
 * @returns {Date} - Thời điểm hết hạn
 */
export const getExpirationDate = (days) => {
    const defaultDays = parseInt(process.env.REFRESH_TOKEN_DAYS, 10) || 7;
    const effectiveDays = days !== undefined ? days : defaultDays;
    const date = new Date();
    date.setDate(date.getDate() + effectiveDays);
    return date;
};
