/**
 * ============================================
 * USER SERVICE - Tầng nghiệp vụ User Profile
 * ============================================
 */

import fs from "fs";
import path from "path";
import { UPLOAD_CONFIG } from "#config/constants.js";
import {
    findUserProfileById,
    findUserByPhoneExcludingId,
    updateUserById,
    findAllUsersProfile,
} from "#repository/userRepository.js";
import { validateUpdateProfileRequest } from "#models/dto/request/UpdateProfileRequestDTO.js";
import { toUserResponse } from "#models/dto/response/UserResponseDTO.js";
import { deleteRefreshTokensByUserId } from "#repository/authRepository.js";
import { cleanupFile } from "#utils/uploadGuard.js";

/**
 * Lấy thông tin chi tiết của người dùng hiện tại.
 * @param {number} userId
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const getUserProfile = async (userId) => {
    const user = await findUserProfileById(userId);
    if (!user) {
        return {
            statusCode: 404,
            message: "Không tìm thấy người dùng.",
            data: null,
            errors: ["User Not Found"],
        };
    }

    return {
        statusCode: 200,
        message: "Lấy thông tin tài khoản thành công.",
        data: toUserResponse(user),
        errors: null,
    };
};

/**
 * Cập nhật thông tin cá nhân của người dùng.
 * @param {number} userId
 * @param {Object} body - Dữ liệu cập nhật (full_name, phone, dob)
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const updateUserProfile = async (userId, body) => {
    // 1. Validate DTO
    const validation = validateUpdateProfileRequest(body);
    if (!validation.isValid) {
        return {
            statusCode: 400,
            message: "Dữ liệu cập nhật không hợp lệ.",
            data: null,
            errors: validation.errors,
        };
    }

    // 2. Tìm user hiện tại
    const currentUser = await findUserProfileById(userId);
    if (!currentUser) {
        return {
            statusCode: 404,
            message: "Người dùng không tồn tại.",
            data: null,
            errors: ["User Not Found"],
        };
    }

    // 3. Nếu cập nhật số điện thoại, kiểm tra xem số điện thoại đã bị user khác dùng chưa
    if (body.phone !== undefined && body.phone !== null && String(body.phone).trim() !== "") {
        const existingPhone = await findUserByPhoneExcludingId(body.phone, userId);
        if (existingPhone) {
            return {
                statusCode: 409,
                message: "Số điện thoại này đã được sử dụng bởi tài khoản khác.",
                data: null,
                errors: ["Phone Number Conflict"],
            };
        }
    }

    // 4. Chuẩn bị object cập nhật chỉ với những trường được gửi lên
    const updateData = {};
    if (body.full_name !== undefined) updateData.full_name = body.full_name;
    if (body.phone !== undefined) updateData.phone = body.phone || null;
    if (body.dob !== undefined) updateData.dob = body.dob || null;

    // 5. Cập nhật vào DB
    const updatedUser = await updateUserById(userId, updateData);

    return {
        statusCode: 200,
        message: "Cập nhật thông tin cá nhân thành công!",
        data: toUserResponse(updatedUser),
        errors: null,
    };
};

/**
 * Cập nhật ảnh đại diện của người dùng.
 * @param {number} userId
 * @param {Object} file - File ảnh từ Multer req.file
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const updateUserAvatar = async (userId, file) => {
    if (!file) {
        return {
            statusCode: 400,
            message: UPLOAD_CONFIG.AVATAR.ERROR_MESSAGE,
            data: null,
            errors: ["Missing Avatar File"],
        };
    }

    // 1. Tìm user hiện tại
    const currentUser = await findUserProfileById(userId);
    if (!currentUser) {
        // Xóa file vừa upload nếu user không tồn tại
        if (file) {
            await cleanupFile(file);
        }

        return {
            statusCode: 404,
            message: "Người dùng không tồn tại.",
            data: null,
            errors: ["User Not Found"],
        };
    }

    // 2. Xóa ảnh cũ vật lý nếu có (và là file nội bộ trong thư mục public/uploads/avatars/)
    if (currentUser.avatar && currentUser.avatar.startsWith("/uploads/avatars/")) {
        const relativeAvatarPath = currentUser.avatar.startsWith("/") ? currentUser.avatar.slice(1) : currentUser.avatar;
        const oldFilePath = path.join(process.cwd(), "public", relativeAvatarPath);
        try {
            await fs.promises.unlink(oldFilePath);
        } catch (err) {
            if (err.code !== "ENOENT") {
                console.warn(`⚠️ [Cleanup Warning] Không thể xóa file avatar cũ: ${oldFilePath}`, err.message);
            }
        }
    }

    // 3. Cập nhật đường dẫn avatar mới trong DB (dọn dẹp file mới upload nếu lỗi DB)
    let updatedUser;
    try {
        const avatarUrl = file.path;
        updatedUser = await updateUserById(userId, { avatar: avatarUrl });
    } catch (dbError) {
        if (file) {
            await cleanupFile(file);
        }
        throw dbError;
    }

    return {
        statusCode: 200,
        message: "Cập nhật ảnh đại diện thành công!",
        data: toUserResponse(updatedUser),
        errors: null,
    };
};

/**
 * Lấy danh sách toàn bộ người dùng kèm phân trang và lọc.
 * @param {Object} queryParams - { page, limit, role, q }
 * @returns {Promise<{ statusCode: number, message: string, data: Object, errors: string[]|null }>}
 */
export const getAllUsers = async (queryParams = {}) => {
    const result = await findAllUsersProfile(queryParams);
    const mappedUsers = result.users.map(toUserResponse);

    return {
        statusCode: 200,
        message: "Lấy danh sách người dùng thành công.",
        data: {
            users: mappedUsers,
            pagination: {
                total: result.total,
                page: result.page,
                limit: Math.max(1, Math.min(100, parseInt(queryParams.limit) || 20)),
                totalPages: result.totalPages,
            },
        },
        errors: null,
    };
};

/**
 * Cập nhật trạng thái (status) của người dùng bởi Admin.
 * Nếu chuyển sang BANNED hoặc INACTIVE, tự động thu hồi toàn bộ Refresh Token của user.
 * @param {number} userId - ID của user cần cập nhật
 * @param {string} status - Trạng thái mới: ACTIVE | INACTIVE | BANNED
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const updateUserStatus = async (userId, status) => {
    const validStatuses = ["ACTIVE", "INACTIVE", "BANNED"];
    const normalizedStatus = String(status).trim().toUpperCase();

    if (!validStatuses.includes(normalizedStatus)) {
        return {
            statusCode: 400,
            message: "Trạng thái tài khoản không hợp lệ (Chỉ nhận ACTIVE, INACTIVE, BANNED).",
            data: null,
            errors: ["Invalid Status Value"],
        };
    }

    const targetUser = await findUserProfileById(userId);
    if (!targetUser) {
        return {
            statusCode: 404,
            message: "Người dùng không tồn tại.",
            data: null,
            errors: ["User Not Found"],
        };
    }

    const updatedUser = await updateUserById(userId, { status: normalizedStatus });

    // Nếu khóa hoặc tạm ngưng, thu hồi ngay tất cả Refresh Token của user đó
    if (normalizedStatus === "BANNED" || normalizedStatus === "INACTIVE") {
        await deleteRefreshTokensByUserId(userId);
    }

    return {
        statusCode: 200,
        message: `Cập nhật trạng thái tài khoản sang '${normalizedStatus}' thành công!`,
        data: toUserResponse(updatedUser),
        errors: null,
    };
};
