/**
 * ============================================
 * ACADEMIC RESPONSE DTOs - Map entity → response
 * ============================================
 * Chuyển đổi các Entity học thuật (Cohort, Faculty, Major, Subject)
 * thành object response sạch sẽ trước khi trả về cho client.
 *
 * Lý do tách riêng DTO:
 *   - Kiểm soát rõ ràng dữ liệu nào được phép trả về.
 *   - Tránh lộ các trường nội bộ hoặc quan hệ ngược (users, documents).
 *   - Frontend nhận cấu trúc phẳng, dễ render, không phụ thuộc schema DB.
 */

// ==========================================
// COHORT (Khóa học)
// ==========================================

/**
 * Map Cohort entity → response.
 * @param {Object} entity
 * @returns {Object}
 */
export const toCohortResponse = (entity) => {
    if (!entity) return null;
    return {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        start_year: entity.start_year,
        end_year: entity.end_year,
    };
};

// ==========================================
// FACULTY (Khoa)
// ==========================================

/**
 * Map Faculty entity → response.
 * @param {Object} entity
 * @returns {Object}
 */
export const toFacultyResponse = (entity) => {
    if (!entity) return null;
    return {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        description: entity.description || null,
    };
};

// ==========================================
// MAJOR (Ngành học)
// ==========================================

/**
 * Map Major entity → response.
 * Trả kèm faculty_code phẳng để Frontend biết ngành thuộc khoa nào.
 * @param {Object} entity
 * @returns {Object}
 */
export const toMajorResponse = (entity) => {
    if (!entity) return null;
    return {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        description: entity.description || null,
        faculty_code: entity.faculty?.code || null,
        faculty_name: entity.faculty?.name || null,
    };
};

// ==========================================
// SUBJECT (Môn học)
// ==========================================

/**
 * Map Subject entity → response.
 * Trả kèm danh sách majors phẳng [{ code, name }].
 * @param {Object} entity
 * @returns {Object}
 */
export const toSubjectResponse = (entity) => {
    if (!entity) return null;
    return {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        description: entity.description || null,
        majors: Array.isArray(entity.majors)
            ? entity.majors.map((m) => ({ code: m.code, name: m.name }))
            : [],
    };
};
