/**
 * ============================================
 * USER RESPONSE DTO - Map entity → response an toàn
 * ============================================
 * Chuyển đổi User entity từ Database thành object response.
 * BẢO MẬT: Loại bỏ hoàn toàn trường `password_hash` và `updated_at`
 * trước khi gửi về cho client.
 */

/**
 * Map User entity sang object response an toàn.
 * @param {Object} userEntity - User entity truy vấn từ TypeORM
 * @returns {Object} - User response (đã loại bỏ password_hash)
 */
export const toUserResponse = (userEntity) => {
    if (!userEntity) return null;

    return {
        id: userEntity.id,
        full_name: userEntity.full_name,
        username: userEntity.username,
        email: userEntity.email,
        phone: userEntity.phone || null,
        dob: userEntity.dob || null,
        role: userEntity.role,
        avatar: userEntity.avatar || null,
        cohort_id: userEntity.cohort?.id || null,
        cohort_code: userEntity.cohort?.code || null,
        faculty_id: userEntity.faculty?.id || null,
        faculty_code: userEntity.faculty?.code || null,
        major_id: userEntity.major?.id || null,
        major_code: userEntity.major?.code || null,
        created_at: userEntity.created_at,
    };
};
