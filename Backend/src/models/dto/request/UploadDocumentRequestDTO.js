/**
 * ============================================
 * UPLOAD DOCUMENT REQUEST DTO - Validate dữ liệu upload tài liệu
 * ============================================
 * Kiểm tra các trường bắt buộc khi user gửi request upload tài liệu.
 * Các trường: title, subject_id (bắt buộc), cohort_id, faculty_id, major_id,
 *             document_type, visibility, description (tùy chọn).
 */

import { validateRequired } from "#utils/validationHelper.js";

// Danh sách loại tài liệu hợp lệ
const VALID_DOC_TYPES = ["DOCUMENT", "ASSIGNMENT", "EXAM", "SLIDE", "REFERENCE"];

// Danh sách quyền truy cập hợp lệ cho API upload chung (không chấp nhận GROUP)
const VALID_VISIBILITIES = ["PUBLIC", "PRIVATE"];

/**
 * Validate request body cho API upload tài liệu.
 * @param {Object} body - Request body từ client
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateUploadDocumentRequest = (body) => {
    const errors = [];

    // === title — bắt buộc ===
    const titleCheck = validateRequired(body.title, "Tiêu đề tài liệu (title)");
    if (!titleCheck.isValid) errors.push(titleCheck.message);

    // === subject_id — bắt buộc (tài liệu phải gắn với 1 môn học) ===
    const subjectCheck = validateRequired(body.subject_id, "Mã môn học (subject_id)");
    if (!subjectCheck.isValid) errors.push(subjectCheck.message);

    // === document_type — tùy chọn, nhưng nếu có phải hợp lệ ===
    if (body.document_type) {
        const docType = String(body.document_type).trim().toUpperCase();
        if (!VALID_DOC_TYPES.includes(docType)) {
            errors.push(`Loại tài liệu không hợp lệ. Chỉ chấp nhận: ${VALID_DOC_TYPES.join(", ")}.`);
        }
    }

    // === visibility — tùy chọn, nhưng nếu có phải hợp lệ ===
    if (body.visibility) {
        const vis = String(body.visibility).trim().toUpperCase();
        if (vis === "GROUP") {
            errors.push("Để đăng tải tài liệu nội bộ nhóm (GROUP), vui lòng sử dụng API dành riêng cho Nhóm học tập (/api/v1/groups/:id/documents/upload).");
        } else if (!VALID_VISIBILITIES.includes(vis)) {
            errors.push(`Quyền truy cập không hợp lệ. Chỉ chấp nhận: ${VALID_VISIBILITIES.join(", ")}.`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : null,
    };
};

/**
 * Validate request body cho API cập nhật tài liệu.
 * Cho phép sửa: title, description, visibility, document_type.
 * @param {Object} body
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateUpdateDocumentRequest = (body) => {
    const errors = [];

    // Ít nhất phải có 1 trường để cập nhật
    const hasTitle = body.title !== undefined;
    const hasDescription = body.description !== undefined;
    const hasVisibility = body.visibility !== undefined;
    const hasDocType = body.document_type !== undefined;

    if (!hasTitle && !hasDescription && !hasVisibility && !hasDocType) {
        errors.push("Vui lòng cung cấp ít nhất một trường để cập nhật (title, description, visibility, document_type).");
    }

    // === title — nếu có thì không được rỗng ===
    if (hasTitle) {
        const titleCheck = validateRequired(body.title, "Tiêu đề tài liệu (title)");
        if (!titleCheck.isValid) errors.push(titleCheck.message);
    }

    // === document_type — nếu có thì phải hợp lệ ===
    if (hasDocType && body.document_type) {
        const docType = String(body.document_type).trim().toUpperCase();
        if (!VALID_DOC_TYPES.includes(docType)) {
            errors.push(`Loại tài liệu không hợp lệ. Chỉ chấp nhận: ${VALID_DOC_TYPES.join(", ")}.`);
        }
    }

    // === visibility — nếu có thì phải hợp lệ ===
    if (hasVisibility && body.visibility) {
        const vis = String(body.visibility).trim().toUpperCase();
        if (vis === "GROUP") {
            errors.push("Không thể chuyển quyền truy cập sang nội bộ nhóm (GROUP) ở API chung. Vui lòng chia sẻ vào nhóm thông qua API của Nhóm học tập.");
        } else if (!VALID_VISIBILITIES.includes(vis)) {
            errors.push(`Quyền truy cập không hợp lệ. Chỉ chấp nhận: ${VALID_VISIBILITIES.join(", ")}.`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : null,
    };
};
