/**
 * ============================================
 * UPDATE PROFILE REQUEST DTO
 * ============================================
 * Validate dữ liệu đầu vào khi người dùng cập nhật thông tin cá nhân.
 * Các trường có thể cập nhật: full_name, phone, dob.
 */

import { validatePhone, validateDob } from "#utils/validationHelper.js";

/**
 * Kiểm tra tính hợp lệ của request cập nhật profile.
 * @param {Object} body - Body từ client gửi lên
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateUpdateProfileRequest = (body) => {
    const errors = [];

    // 1. Validate full_name (nếu có truyền lên)
    if (body.full_name !== undefined) {
        if (!body.full_name || String(body.full_name).trim() === "") {
            errors.push("Họ và tên không được để trống.");
        } else if (String(body.full_name).trim().length < 2 || String(body.full_name).trim().length > 100) {
            errors.push("Họ và tên phải có từ 2 đến 100 ký tự.");
        }
    }

    // 2. Validate phone (nếu có truyền lên)
    if (body.phone !== undefined && body.phone !== null && String(body.phone).trim() !== "") {
        const phoneCheck = validatePhone(body.phone);
        if (!phoneCheck.isValid) {
            errors.push(phoneCheck.message);
        }
    }

    // 3. Validate dob (nếu có truyền lên)
    if (body.dob !== undefined && body.dob !== null && String(body.dob).trim() !== "") {
        const dobCheck = validateDob(body.dob);
        if (!dobCheck.isValid) {
            errors.push(dobCheck.message);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
