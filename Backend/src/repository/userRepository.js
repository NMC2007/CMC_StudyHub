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
 * Lấy danh sách toàn bộ người dùng (kèm quan hệ, phân trang, lọc theo role & từ khóa).
 * @param {Object} queryParams - { page, limit, role, q }
 * @returns {Promise<{ users: Object[], total: number, page: number, totalPages: number }>}
 */
export const findAllUsersProfile = async (queryParams = {}) => {
    const page = Math.max(1, parseInt(queryParams.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(queryParams.limit) || 20));
    const skip = (page - 1) * limit;

    const query = userRepository
        .createQueryBuilder("u")
        .leftJoinAndSelect("u.cohort", "cohort")
        .leftJoinAndSelect("u.faculty", "faculty")
        .leftJoinAndSelect("u.major", "major");

    // Lọc theo Role
    if (queryParams.role && queryParams.role !== "ALL") {
        query.andWhere("u.role::text = :role", { role: queryParams.role });
    }

    // Tìm kiếm theo tên, mã code, email, username, phone
    if (queryParams.q) {
        query.andWhere(
            "(unaccent(u.full_name) ILIKE unaccent(:keyword) OR u.code ILIKE :keyword OR u.email ILIKE :keyword OR u.username ILIKE :keyword OR u.phone ILIKE :keyword)",
            { keyword: `%${queryParams.q}%` }
        );
    }

    query.orderBy("u.id", "DESC").skip(skip).take(limit);

    const [users, total] = await query.getManyAndCount();

    return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
    };
};
