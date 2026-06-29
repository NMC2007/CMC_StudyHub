/**
 * ============================================
 * LOGIN REQUEST DTO - Validate dữ liệu đăng nhập
 * ============================================
 * Kiểm tra dữ liệu đăng nhập từ request body.
 * Sử dụng trường `identifier` duy nhất để nhận email HOẶC username.
 * Backend tự nhận diện: nếu chứa "@" → email, ngược lại → username.
 * Tự động trim() và toLowerCase() trước khi xử lý.
 */

import { validateRequired } from "#utils/validationHelper.js";

/**
 * Validate toàn bộ request body đăng nhập.
 * @param {Object} body - Request body từ client { identifier, password }
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateLoginRequest = (body) => {
    const errors = [];

    // === 1. Trim & chuẩn hóa dữ liệu đầu vào ===
    if (body.identifier) body.identifier = String(body.identifier).trim().toLowerCase();

    // === 2. Validate trường identifier (email hoặc username) ===
    const identifierCheck = validateRequired(body.identifier, "Tên đăng nhập hoặc Email (identifier)");
    if (!identifierCheck.isValid) errors.push(identifierCheck.message);

    // === 3. Validate trường password ===
    const passwordCheck = validateRequired(body.password, "Mật khẩu (password)");
    if (!passwordCheck.isValid) errors.push(passwordCheck.message);

    return {
        isValid: errors.length === 0,
        errors,
    };
};
