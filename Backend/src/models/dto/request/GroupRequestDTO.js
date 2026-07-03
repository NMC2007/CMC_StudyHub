/**
 * ============================================
 * GROUP REQUEST DTO - Validate dữ liệu Group Module
 * ============================================
 */

import { validateRequired } from "#utils/validationHelper.js";

/**
 * Validate request body cho API tạo nhóm học tập.
 * @param {Object} body
 * @returns {{ isValid: boolean, errors: string[]|null }}
 */
export const validateCreateGroupRequest = (body) => {
    const errors = [];

    const nameCheck = validateRequired(body?.name, "Tên nhóm học tập (name)");
    if (!nameCheck.isValid) {
        errors.push(nameCheck.message);
    } else if (String(body.name).trim().length > 150) {
        errors.push("Tên nhóm học tập không được vượt quá 150 ký tự.");
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : null,
    };
};

/**
 * Validate request body cho API thêm thành viên vào nhóm.
 * @param {Object} body
 * @returns {{ isValid: boolean, errors: string[]|null }}
 */
export const validateAddGroupMembersRequest = (body) => {
    const errors = [];

    if (!body || !Array.isArray(body.user_ids) || body.user_ids.length === 0) {
        errors.push("Vui lòng cung cấp danh sách thành viên hợp lệ (mảng 'user_ids' không được rỗng).");
    } else {
        const invalidIds = body.user_ids.filter((id) => !Number.isInteger(Number(id)) || Number(id) <= 0);
        if (invalidIds.length > 0) {
            errors.push("Tất cả ID trong mảng 'user_ids' phải là số nguyên dương hợp lệ.");
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : null,
    };
};

/**
 * Validate request body cho API chia sẻ tài liệu vào nhóm.
 * @param {Object} body
 * @returns {{ isValid: boolean, errors: string[]|null }}
 */
export const validateShareDocumentRequest = (body) => {
    const errors = [];

    const docCheck = validateRequired(body?.document_id, "Mã tài liệu (document_id)");
    if (!docCheck.isValid) {
        errors.push(docCheck.message);
    } else if (!Number.isInteger(Number(body.document_id)) || Number(body.document_id) <= 0) {
        errors.push("Mã tài liệu 'document_id' phải là số nguyên dương.");
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : null,
    };
};
