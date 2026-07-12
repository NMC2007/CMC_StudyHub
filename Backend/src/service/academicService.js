/**
 * ============================================
 * ACADEMIC SERVICE - Tầng nghiệp vụ Academic
 * ============================================
 * Xử lý logic nghiệp vụ cho CRUD cấu trúc học thuật.
 * Bao gồm: Validate input, kiểm tra trùng mã code,
 * kiểm tra tồn tại entity cha (Faculty cho Major, Major + Cohort cho Subject).
 *
 * Quy tắc:
 *   - Mọi hàm trả về { statusCode, message, data, errors } để Controller đóng gói qua toAPIResponse.
 *   - Tất cả response data phải qua DTO trước khi trả về (không trả entity thô).
 */

import * as repo from "#repository/academicRepository.js";
import {
    toCohortResponse,
    toFacultyResponse,
    toMajorResponse,
    toSubjectResponse,
} from "#models/dto/response/AcademicResponseDTO.js";

// ==========================================
// COHORT SERVICE
// ==========================================

export const getAllCohorts = async () => {
    const cohorts = await repo.findAllCohorts();
    return {
        statusCode: 200,
        message: "Lấy danh sách khóa học thành công.",
        data: cohorts.map(toCohortResponse),
        errors: null,
    };
};

export const createCohort = async (body) => {
    let { code, name, start_year, end_year } = body;

    // Validate bắt buộc và không rỗng
    if (!code || typeof code !== "string" || !code.trim() || !name || typeof name !== "string" || !name.trim() || start_year === undefined || end_year === undefined) {
        return { statusCode: 400, message: "Thiếu thông tin bắt buộc hoặc mã khóa học (code) bị rỗng.", data: null, errors: ["Missing Required Fields"] };
    }
    code = code.trim();
    name = name.trim();

    // Kiểm tra trùng mã khóa học
    const existing = await repo.findCohortByCode(code);
    if (existing) {
        return { statusCode: 409, message: `Mã khóa học '${code}' đã tồn tại. Vui lòng chọn mã khác.`, data: null, errors: ["Duplicate Cohort Code"] };
    }

    const created = await repo.createCohort({ code, name, start_year, end_year });
    return {
        statusCode: 201,
        message: "Tạo khóa học thành công!",
        data: toCohortResponse(created),
        errors: null,
    };
};

export const updateCohort = async (id, body) => {
    const existing = await repo.findCohortById(id);
    if (!existing) {
        return { statusCode: 404, message: "Không tìm thấy khóa học.", data: null, errors: ["Cohort Not Found"] };
    }

    // Nếu đổi code, kiểm tra trùng với khóa khác
    if (body.code && body.code !== existing.code) {
        const duplicate = await repo.findCohortByCode(body.code);
        if (duplicate) {
            return { statusCode: 409, message: `Mã khóa học '${body.code}' đã được sử dụng.`, data: null, errors: ["Duplicate Cohort Code"] };
        }
    }

    const updateData = {};
    if (body.code !== undefined) updateData.code = body.code;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.start_year !== undefined) updateData.start_year = body.start_year;
    if (body.end_year !== undefined) updateData.end_year = body.end_year;

    const updated = await repo.updateCohort(id, updateData);
    return {
        statusCode: 200,
        message: "Cập nhật khóa học thành công!",
        data: toCohortResponse(updated),
        errors: null,
    };
};

export const deleteCohort = async (id) => {
    const existing = await repo.findCohortById(id);
    if (!existing) {
        return { statusCode: 404, message: "Không tìm thấy khóa học.", data: null, errors: ["Cohort Not Found"] };
    }

    await repo.deleteCohort(id);
    return { statusCode: 200, message: `Đã xóa khóa học '${existing.code}' thành công.`, data: null, errors: null };
};

// ==========================================
// FACULTY SERVICE
// ==========================================

export const getAllFaculties = async () => {
    const faculties = await repo.findAllFaculties();
    return {
        statusCode: 200,
        message: "Lấy danh sách khoa thành công.",
        data: faculties.map(toFacultyResponse),
        errors: null,
    };
};

export const createFaculty = async (body) => {
    let { code, name, description } = body;

    // Validate bắt buộc và không rỗng
    if (!code || typeof code !== "string" || !code.trim() || !name || typeof name !== "string" || !name.trim()) {
        return { statusCode: 400, message: "Thiếu thông tin bắt buộc hoặc mã khoa (code) bị rỗng.", data: null, errors: ["Missing Required Fields"] };
    }
    code = code.trim();
    name = name.trim();

    // Kiểm tra trùng mã khoa
    const existing = await repo.findFacultyByCode(code);
    if (existing) {
        return { statusCode: 409, message: `Mã khoa '${code}' đã tồn tại. Vui lòng chọn mã khác.`, data: null, errors: ["Duplicate Faculty Code"] };
    }

    const created = await repo.createFaculty({ code, name, description: description ? description.trim() : null });
    return {
        statusCode: 201,
        message: "Tạo khoa thành công!",
        data: toFacultyResponse(created),
        errors: null,
    };
};

export const updateFaculty = async (id, body) => {
    const existing = await repo.findFacultyById(id);
    if (!existing) {
        return { statusCode: 404, message: "Không tìm thấy khoa.", data: null, errors: ["Faculty Not Found"] };
    }

    if (body.code && body.code !== existing.code) {
        const duplicate = await repo.findFacultyByCode(body.code);
        if (duplicate) {
            return { statusCode: 409, message: `Mã khoa '${body.code}' đã được sử dụng.`, data: null, errors: ["Duplicate Faculty Code"] };
        }
    }

    const updateData = {};
    if (body.code !== undefined) updateData.code = body.code;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;

    const updated = await repo.updateFaculty(id, updateData);
    return {
        statusCode: 200,
        message: "Cập nhật khoa thành công!",
        data: toFacultyResponse(updated),
        errors: null,
    };
};

export const deleteFaculty = async (id) => {
    const existing = await repo.findFacultyById(id);
    if (!existing) {
        return { statusCode: 404, message: "Không tìm thấy khoa.", data: null, errors: ["Faculty Not Found"] };
    }

    await repo.deleteFaculty(id);
    return { statusCode: 200, message: `Đã xóa khoa '${existing.code}' thành công.`, data: null, errors: null };
};

// ==========================================
// MAJOR SERVICE
// ==========================================

export const getAllMajors = async (facultyCode) => {
    const majors = await repo.findAllMajors(facultyCode);
    return {
        statusCode: 200,
        message: facultyCode
            ? `Lấy danh sách ngành thuộc khoa '${facultyCode}' thành công.`
            : "Lấy danh sách tất cả ngành học thành công.",
        data: majors.map(toMajorResponse),
        errors: null,
    };
};

export const createMajor = async (body) => {
    let { code, name, description, faculty_code } = body;

    // Validate bắt buộc và không rỗng
    if (!code || typeof code !== "string" || !code.trim() || !name || typeof name !== "string" || !name.trim() || !faculty_code || typeof faculty_code !== "string" || !faculty_code.trim()) {
        return { statusCode: 400, message: "Thiếu thông tin bắt buộc hoặc mã ngành (code) bị rỗng.", data: null, errors: ["Missing Required Fields"] };
    }
    code = code.trim();
    name = name.trim();
    faculty_code = faculty_code.trim();

    // Kiểm tra khoa cha tồn tại
    const faculty = await repo.findFacultyByCode(faculty_code);
    if (!faculty) {
        return { statusCode: 404, message: `Không tìm thấy khoa với mã '${faculty_code}'.`, data: null, errors: ["Faculty Not Found"] };
    }

    // Kiểm tra trùng mã ngành
    const existing = await repo.findMajorByCode(code);
    if (existing) {
        return { statusCode: 409, message: `Mã ngành '${code}' đã tồn tại. Vui lòng chọn mã khác.`, data: null, errors: ["Duplicate Major Code"] };
    }

    const created = await repo.createMajor({
        code,
        name,
        description: description ? description.trim() : null,
        faculty: { id: faculty.id },
    });

    // Reload để lấy đầy đủ relation faculty
    const result = await repo.findMajorById(created.id);
    return {
        statusCode: 201,
        message: "Tạo ngành học thành công!",
        data: toMajorResponse(result),
        errors: null,
    };
};

export const updateMajor = async (id, body) => {
    const existing = await repo.findMajorById(id);
    if (!existing) {
        return { statusCode: 404, message: "Không tìm thấy ngành học.", data: null, errors: ["Major Not Found"] };
    }

    if (body.code && body.code !== existing.code) {
        const duplicate = await repo.findMajorByCode(body.code);
        if (duplicate) {
            return { statusCode: 409, message: `Mã ngành '${body.code}' đã được sử dụng.`, data: null, errors: ["Duplicate Major Code"] };
        }
    }

    const updateData = {};
    if (body.code !== undefined) updateData.code = body.code;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;

    // Nếu đổi khoa cha
    if (body.faculty_code !== undefined) {
        const faculty = await repo.findFacultyByCode(body.faculty_code);
        if (!faculty) {
            return { statusCode: 404, message: `Không tìm thấy khoa với mã '${body.faculty_code}'.`, data: null, errors: ["Faculty Not Found"] };
        }
        updateData.faculty = { id: faculty.id };
    }

    const updated = await repo.updateMajor(id, updateData);
    return {
        statusCode: 200,
        message: "Cập nhật ngành học thành công!",
        data: toMajorResponse(updated),
        errors: null,
    };
};

export const deleteMajor = async (id) => {
    const existing = await repo.findMajorById(id);
    if (!existing) {
        return { statusCode: 404, message: "Không tìm thấy ngành học.", data: null, errors: ["Major Not Found"] };
    }

    await repo.deleteMajor(id);
    return { statusCode: 200, message: `Đã xóa ngành '${existing.code}' thành công.`, data: null, errors: null };
};

// ==========================================
// SUBJECT SERVICE
// ==========================================

export const getAllSubjects = async (majorCode, facultyCode) => {
    const subjects = await repo.findAllSubjects(majorCode, facultyCode);
    return {
        statusCode: 200,
        message: majorCode
            ? `Lấy danh sách môn học thuộc ngành '${majorCode}' thành công.`
            : facultyCode
            ? `Lấy danh sách môn học thuộc khoa '${facultyCode}' thành công.`
            : "Lấy danh sách tất cả môn học thành công.",
        data: subjects.map(toSubjectResponse),
        errors: null,
    };
};

export const createSubject = async (body) => {
    let { code, name, description } = body;
    let major_codes = body.major_codes || (body.major_code ? [body.major_code] : []);

    // Validate bắt buộc và không rỗng
    if (!code || typeof code !== "string" || !code.trim() || !name || typeof name !== "string" || !name.trim() || !Array.isArray(major_codes) || major_codes.length === 0) {
        return { statusCode: 400, message: "Thiếu thông tin bắt buộc hoặc danh sách ngành học (major_codes) bị trống.", data: null, errors: ["Missing Required Fields"] };
    }
    code = code.trim();
    name = name.trim();

    // Tìm các ngành tương ứng với major_codes
    const majors = [];
    for (const mCode of major_codes) {
        const trimmed = typeof mCode === "string" ? mCode.trim() : "";
        if (!trimmed) continue;
        const major = await repo.findMajorByCode(trimmed);
        if (!major) {
            return { statusCode: 404, message: `Không tìm thấy ngành với mã '${trimmed}'.`, data: null, errors: ["Major Not Found"] };
        }
        majors.push({ id: major.id });
    }

    if (majors.length === 0) {
        return { statusCode: 400, message: "Danh sách mã ngành không hợp lệ.", data: null, errors: ["Invalid Major Codes"] };
    }

    // Kiểm tra trùng mã môn học
    const existing = await repo.findSubjectByCode(code);
    if (existing) {
        return { statusCode: 409, message: `Mã môn học '${code}' đã tồn tại. Vui lòng chọn mã khác.`, data: null, errors: ["Duplicate Subject Code"] };
    }

    const created = await repo.createSubject({
        code,
        name,
        description: description ? description.trim() : null,
        majors,
    });

    // Reload để lấy đầy đủ relations
    const result = await repo.findSubjectById(created.id);
    return {
        statusCode: 201,
        message: "Tạo môn học thành công!",
        data: toSubjectResponse(result),
        errors: null,
    };
};

export const updateSubject = async (id, body) => {
    const existing = await repo.findSubjectById(id);
    if (!existing) {
        return { statusCode: 404, message: "Không tìm thấy môn học.", data: null, errors: ["Subject Not Found"] };
    }

    if (body.code && body.code !== existing.code) {
        const duplicate = await repo.findSubjectByCode(body.code);
        if (duplicate) {
            return { statusCode: 409, message: `Mã môn học '${body.code}' đã được sử dụng.`, data: null, errors: ["Duplicate Subject Code"] };
        }
    }

    const updateData = {};
    if (body.code !== undefined) updateData.code = body.code;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;

    let major_codes = body.major_codes || (body.major_code ? [body.major_code] : undefined);
    if (major_codes !== undefined) {
        if (!Array.isArray(major_codes) || major_codes.length === 0) {
            return { statusCode: 400, message: "Danh sách ngành học (major_codes) không hợp lệ.", data: null, errors: ["Invalid Major Codes"] };
        }
        const majors = [];
        for (const mCode of major_codes) {
            const trimmed = typeof mCode === "string" ? mCode.trim() : "";
            if (!trimmed) continue;
            const major = await repo.findMajorByCode(trimmed);
            if (!major) {
                return { statusCode: 404, message: `Không tìm thấy ngành với mã '${trimmed}'.`, data: null, errors: ["Major Not Found"] };
            }
            majors.push({ id: major.id });
        }
        updateData.majors = majors;
    }

    const updated = await repo.updateSubject(id, updateData);
    return {
        statusCode: 200,
        message: "Cập nhật môn học thành công!",
        data: toSubjectResponse(updated),
        errors: null,
    };
};

export const deleteSubject = async (id) => {
    const existing = await repo.findSubjectById(id);
    if (!existing) {
        return { statusCode: 404, message: "Không tìm thấy môn học.", data: null, errors: ["Subject Not Found"] };
    }

    await repo.deleteSubject(id);
    return { statusCode: 200, message: `Đã xóa môn học '${existing.code}' thành công.`, data: null, errors: null };
};
