/**
 * ============================================
 * USER SERVICE - Tầng nghiệp vụ User Profile
 * ============================================
 */

import fs from "fs";
import path from "path";
import {
    findUserProfileById,
    findUserByPhoneExcludingId,
    updateUserById,
} from "#repository/userRepository.js";
import { validateUpdateProfileRequest } from "#models/dto/request/UpdateProfileRequestDTO.js";
import { toUserResponse } from "#models/dto/response/UserResponseDTO.js";

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
            message: "Vui lòng chọn file ảnh hợp lệ (.jpg, .jpeg, .png, .webp, tối đa 5MB).",
            data: null,
            errors: ["Missing Avatar File"],
        };
    }

    // 1. Tìm user hiện tại
    const currentUser = await findUserProfileById(userId);
    if (!currentUser) {
        // Xóa file vừa upload nếu user không tồn tại
        try {
            fs.unlinkSync(file.path);
        } catch (e) {}

        return {
            statusCode: 404,
            message: "Người dùng không tồn tại.",
            data: null,
            errors: ["User Not Found"],
        };
    }

    // 2. Xóa ảnh cũ vật lý nếu có (và là file nội bộ trong thư mục public/uploads/avatars/)
    if (currentUser.avatar && currentUser.avatar.startsWith("/uploads/avatars/")) {
        // Loại bỏ dấu '/' đầu chuỗi để path.join tương thích hoàn hảo trên Windows/Linux
        const relativeAvatarPath = currentUser.avatar.startsWith("/") ? currentUser.avatar.slice(1) : currentUser.avatar;
        const oldFilePath = path.join(process.cwd(), "public", relativeAvatarPath);
        if (fs.existsSync(oldFilePath)) {
            try {
                fs.unlinkSync(oldFilePath);
            } catch (err) {
                console.warn(`⚠️ Không thể xóa file avatar cũ: ${oldFilePath}`, err.message);
            }
        }
    }

    // 3. Cập nhật đường dẫn avatar mới trong DB (dọn dẹp file mới upload nếu lỗi DB)
    let updatedUser;
    try {
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        updatedUser = await updateUserById(userId, { avatar: avatarUrl });
    } catch (dbError) {
        try {
            if (file && file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        } catch (cleanupError) {}
        throw dbError;
    }

    return {
        statusCode: 200,
        message: "Cập nhật ảnh đại diện thành công!",
        data: toUserResponse(updatedUser),
        errors: null,
    };
};
