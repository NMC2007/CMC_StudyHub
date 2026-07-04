/**
 * ============================================
 * USER REPOSITORY - Tầng truy vấn Database cho User Profile
 * ============================================
 */

import { AppDataSource } from "#config/db.js";

const userRepository = AppDataSource.getRepository("User");

/**
 * Tìm user theo ID (kèm quan hệ Khóa, Khoa, Ngành).
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findUserProfileById = async (id) => {
    return await userRepository.findOne({
        where: { id },
        relations: { cohort: true, faculty: true, major: true },
    });
};

/**
 * Tìm user theo số điện thoại (trừ user hiện tại ra).
 * @param {string} phone
 * @param {number} currentUserId
 * @returns {Promise<Object|null>}
 */
export const findUserByPhoneExcludingId = async (phone, currentUserId) => {
    const user = await userRepository.findOneBy({ phone });
    if (user && user.id !== currentUserId) {
        return user;
    }
    return null;
};

/**
 * Cập nhật thông tin user trong DB.
 * @param {number} id
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateUserById = async (id, updateData) => {
    await userRepository.update(id, {
        ...updateData,
        updated_at: new Date(),
    });
    return await findUserProfileById(id);
};

/**
 * Lấy danh sách toàn bộ người dùng (kèm quan hệ).
 * @returns {Promise<Object[]>}
 */
export const findAllUsersProfile = async () => {
    return await userRepository.find({
        relations: { cohort: true, faculty: true, major: true },
        order: { id: "DESC" },
    });
};
