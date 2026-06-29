/**
 * ============================================
 * AUTH REPOSITORY - Tầng truy vấn Database
 * ============================================
 * Chịu trách nhiệm thao tác trực tiếp với bảng `users` và `refresh_tokens`
 * thông qua TypeORM DataSource (AppDataSource).
 * Tầng này KHÔNG chứa logic nghiệp vụ — chỉ thực hiện CRUD thuần túy.
 */

import { AppDataSource } from "#config/db.js";
import { User } from "#models/entitys/User.js";
import { RefreshToken } from "#models/entitys/RefreshToken.js";
import { Cohort } from "#models/entitys/Cohort.js";
import { Faculty } from "#models/entitys/Faculty.js";
import { Major } from "#models/entitys/Major.js";

// === Lấy Repository instances từ TypeORM DataSource ===
const userRepository = AppDataSource.getRepository("User");
const refreshTokenRepository = AppDataSource.getRepository("RefreshToken");
const cohortRepository = AppDataSource.getRepository("Cohort");
const facultyRepository = AppDataSource.getRepository("Faculty");
const majorRepository = AppDataSource.getRepository("Major");

// ==========================================
// CÁC HÀM TRUY VẤN BẢNG USERS
// ==========================================

/**
 * Tìm user theo email.
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export const findUserByEmail = async (email) => {
    return await userRepository.findOne({
        where: { email },
        relations: { cohort: true, faculty: true, major: true },
    });
};

/**
 * Tìm user theo username.
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
export const findUserByUsername = async (username) => {
    return await userRepository.findOne({
        where: { username },
        relations: { cohort: true, faculty: true, major: true },
    });
};

/**
 * Tìm user theo số điện thoại (dùng để check trùng khi đăng ký).
 * @param {string} phone
 * @returns {Promise<Object|null>}
 */
export const findUserByPhone = async (phone) => {
    return await userRepository.findOneBy({ phone });
};

/**
 * Tìm user theo ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findUserById = async (id) => {
    return await userRepository.findOne({
        where: { id },
        relations: { cohort: true, faculty: true, major: true },
    });
};

/**
 * Tạo user mới và lưu vào Database.
 * @param {Object} userData - Dữ liệu user (đã hash password)
 * @returns {Promise<Object>} - User entity đã được lưu (có id)
 */
export const createUser = async (userData) => {
    const newUser = userRepository.create(userData);
    return await userRepository.save(newUser);
};

// ==========================================
// CÁC HÀM TRUY VẤN CẤU TRÚC HỌC THUẬT THEO CODE
// ==========================================

export const findCohortByCode = async (code) => {
    return await cohortRepository.findOneBy({ code });
};

export const findFacultyByCode = async (code) => {
    return await facultyRepository.findOneBy({ code });
};

export const findMajorByCode = async (code) => {
    return await majorRepository.findOneBy({ code });
};

// ==========================================
// CÁC HÀM TRUY VẤN BẢNG REFRESH_TOKENS
// ==========================================

/**
 * Lưu Refresh Token vào Database.
 * @param {number} userId - ID của user sở hữu token
 * @param {string} token - Chuỗi Refresh Token
 * @param {Date} expiresAt - Thời điểm hết hạn
 * @returns {Promise<Object>}
 */
export const saveRefreshToken = async (userId, token, expiresAt) => {
    const newToken = refreshTokenRepository.create({
        user: { id: userId },
        token,
        expires_at: expiresAt,
    });
    return await refreshTokenRepository.save(newToken);
};

/**
 * Tìm Refresh Token trong Database (kèm relation user).
 * @param {string} token - Chuỗi Refresh Token cần tìm
 * @returns {Promise<Object|null>}
 */
export const findRefreshToken = async (token) => {
    return await refreshTokenRepository.findOne({
        where: { token },
        relations: ["user"],
    });
};

/**
 * Xóa một Refresh Token cụ thể (đăng xuất thiết bị hiện tại).
 * @param {string} token - Chuỗi Refresh Token cần xóa
 * @returns {Promise<Object>} - Kết quả xóa từ TypeORM
 */
export const deleteRefreshToken = async (token) => {
    return await refreshTokenRepository.delete({ token });
};

/**
 * Xóa tất cả Refresh Token của một user (đăng xuất mọi thiết bị).
 * Dùng khi user login lại — xóa token cũ trước khi tạo token mới.
 * @param {number} userId - ID của user
 * @returns {Promise<Object>} - Kết quả xóa từ TypeORM
 */
export const deleteRefreshTokensByUserId = async (userId) => {
    return await refreshTokenRepository.delete({ user: { id: userId } });
};
