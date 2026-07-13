/**
 * ============================================
 * REGISTER REQUEST DTO - Validate dữ liệu đăng ký
 * ============================================
 * Kiểm tra toàn bộ dữ liệu từ request body khi đăng ký tài khoản mới.
 * Nghiệp vụ đặc biệt sử dụng Business Code:
 *   - STUDENT: bắt buộc cohort_code, faculty_code, major_code
 *   - LECTURER: bắt buộc faculty_code
 *   - ADMIN: không cần thông tin học thuật
 * Tự động trim() và chuẩn hóa email/username (lowercase), codes (uppercase).
 */

import {
    validateRequired,
    validateEmail,
    validateUsername,
    validatePassword,
    validatePhone,
    validateRole,
    validateDob,
    validateUserCode,
} from "#utils/validationHelper.js";

/**
 * Validate toàn bộ request body đăng ký.
 * @param {Object} body - Request body từ client
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateRegisterRequest = (body) => {
    const errors = [];

    // === 1. Trim & chuẩn hóa dữ liệu đầu vào ===
    if (body.email) body.email = String(body.email).trim().toLowerCase();
    if (body.username) body.username = String(body.username).trim().toLowerCase();
    if (body.full_name) body.full_name = String(body.full_name).trim();
    if (body.phone) body.phone = String(body.phone).trim();
    if (body.code) body.code = String(body.code).trim().toUpperCase();
    if (body.cohort_code) body.cohort_code = String(body.cohort_code).trim().toUpperCase();
    if (body.faculty_code) body.faculty_code = String(body.faculty_code).trim().toUpperCase();
    if (body.major_code) body.major_code = String(body.major_code).trim().toUpperCase();

    // === 2. Validate các trường bắt buộc ===
    const fullNameCheck = validateRequired(body.full_name, "Họ tên (full_name)");
    if (!fullNameCheck.isValid) errors.push(fullNameCheck.message);
    else if (body.full_name.length > 100) errors.push("Họ tên không được vượt quá 100 ký tự.");

    const usernameCheck = validateUsername(body.username);
    if (!usernameCheck.isValid) errors.push(usernameCheck.message);

    const emailCheck = validateEmail(body.email);
    if (!emailCheck.isValid) errors.push(emailCheck.message);

    const passwordCheck = validatePassword(body.password);
    if (!passwordCheck.isValid) errors.push(passwordCheck.message);

    const dobCheck = validateDob(body.dob);
    if (!dobCheck.isValid) errors.push(dobCheck.message);

    const roleCheck = validateRole(body.role);
    if (!roleCheck.isValid) errors.push(roleCheck.message);

    // Validate code sau khi có role hợp lệ
    if (roleCheck.isValid) {
        const codeCheck = validateUserCode(body.code, body.role);
        if (!codeCheck.isValid) errors.push(codeCheck.message);
    }

    // === 3. Validate trường tùy chọn (phone) ===
    const phoneCheck = validatePhone(body.phone);
    if (!phoneCheck.isValid) errors.push(phoneCheck.message);

    // === 4. Validate thông tin học thuật theo role (Dùng Business Code) ===
    if (roleCheck.isValid) {
        const role = String(body.role).trim().toUpperCase();

        if (role === "STUDENT") {
            // Sinh viên: bắt buộc chọn Mã Khóa, Mã Khoa, Mã Ngành
            if (!body.cohort_code) errors.push("Sinh viên phải nhập Mã Khóa học (cohort_code).");
            if (!body.faculty_code) errors.push("Sinh viên phải nhập Mã Khoa (faculty_code).");
            if (!body.major_code) errors.push("Sinh viên phải nhập Mã Ngành (major_code).");
        }

        if (role === "LECTURER") {
            // Giảng viên: bắt buộc chọn Mã Khoa
            if (!body.faculty_code) errors.push("Giảng viên phải nhập Mã Khoa (faculty_code).");
        }

        // ADMIN: không cần thông tin học thuật
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
