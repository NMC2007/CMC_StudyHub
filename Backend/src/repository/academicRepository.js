/**
 * ============================================
 * ACADEMIC REPOSITORY - Tầng truy vấn Database
 * ============================================
 * Chịu trách nhiệm thao tác trực tiếp với các bảng cấu trúc học thuật:
 * cohorts, faculties, majors, subjects qua TypeORM.
 * Tầng này KHÔNG chứa logic nghiệp vụ — chỉ thực hiện CRUD thuần túy.
 */

import { AppDataSource } from "#config/db.js";

const cohortRepo = AppDataSource.getRepository("Cohort");
const facultyRepo = AppDataSource.getRepository("Faculty");
const majorRepo = AppDataSource.getRepository("Major");
const subjectRepo = AppDataSource.getRepository("Subject");

// ==========================================
// COHORT (Khóa học)
// ==========================================

export const findAllCohorts = async () => {
    return await cohortRepo.find({ order: { start_year: "DESC" } });
};

export const findCohortById = async (id) => {
    return await cohortRepo.findOneBy({ id });
};

export const findCohortByCode = async (code) => {
    return await cohortRepo.findOneBy({ code });
};

export const createCohort = async (data) => {
    const entity = cohortRepo.create(data);
    return await cohortRepo.save(entity);
};

export const updateCohort = async (id, data) => {
    await cohortRepo.update(id, data);
    return await findCohortById(id);
};

export const deleteCohort = async (id) => {
    return await cohortRepo.delete(id);
};

// ==========================================
// FACULTY (Khoa)
// ==========================================

export const findAllFaculties = async () => {
    return await facultyRepo.find({ order: { code: "ASC" } });
};

export const findFacultyById = async (id) => {
    return await facultyRepo.findOneBy({ id });
};

export const findFacultyByCode = async (code) => {
    return await facultyRepo.findOneBy({ code });
};

export const createFaculty = async (data) => {
    const entity = facultyRepo.create(data);
    return await facultyRepo.save(entity);
};

export const updateFaculty = async (id, data) => {
    await facultyRepo.update(id, data);
    return await findFacultyById(id);
};

export const deleteFaculty = async (id) => {
    return await facultyRepo.delete(id);
};

// ==========================================
// MAJOR (Ngành học)
// ==========================================

/**
 * Lấy danh sách ngành học.
 * Nếu có faculty_code, lọc theo khoa tương ứng. Không có thì lấy tất cả.
 * Luôn eager load quan hệ faculty để DTO trả về faculty_code/name.
 */
export const findAllMajors = async (facultyCode) => {
    const where = {};
    if (facultyCode) {
        where.faculty = { code: facultyCode };
    }
    return await majorRepo.find({
        where,
        relations: { faculty: true },
        order: { code: "ASC" },
    });
};

export const findMajorById = async (id) => {
    return await majorRepo.findOne({
        where: { id },
        relations: { faculty: true },
    });
};

export const findMajorByCode = async (code) => {
    return await majorRepo.findOne({
        where: { code },
        relations: { faculty: true },
    });
};

export const createMajor = async (data) => {
    const entity = majorRepo.create(data);
    return await majorRepo.save(entity);
};

export const updateMajor = async (id, data) => {
    await majorRepo.update(id, data);
    return await findMajorById(id);
};

export const deleteMajor = async (id) => {
    return await majorRepo.delete(id);
};

// ==========================================
// SUBJECT (Môn học)
// ==========================================

/**
 * Lấy danh sách môn học.
 * Hỗ trợ lọc theo major_code (ngành).
 * Luôn eager load quan hệ majors để DTO trả về đầy đủ.
 */
export const findAllSubjects = async (majorCode) => {
    const where = {};
    if (majorCode) {
        where.majors = { code: majorCode };
    }
    return await subjectRepo.find({
        where,
        relations: { majors: true },
        order: { code: "ASC" },
    });
};

export const findSubjectById = async (id) => {
    return await subjectRepo.findOne({
        where: { id },
        relations: { majors: true },
    });
};

export const findSubjectByCode = async (code) => {
    return await subjectRepo.findOne({
        where: { code },
        relations: { majors: true },
    });
};

export const createSubject = async (data) => {
    const entity = subjectRepo.create(data);
    return await subjectRepo.save(entity);
};

export const updateSubject = async (id, data) => {
    // Nếu cập nhật majors, TypeORM save cần đối tượng có id
    const entity = await subjectRepo.findOne({ where: { id }, relations: { majors: true } });
    if (!entity) return null;
    Object.assign(entity, data);
    await subjectRepo.save(entity);
    return await findSubjectById(id);
};

export const deleteSubject = async (id) => {
    return await subjectRepo.delete(id);
};
