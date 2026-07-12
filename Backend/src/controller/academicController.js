/**
 * ============================================
 * ACADEMIC CONTROLLER - Tầng điều khiển Academic
 * ============================================
 * Nhận request từ Routes, gọi tầng Service xử lý,
 * wrap kết quả bằng APIResponse chuẩn hóa và gửi về cho client.
 *
 * Phân nhóm theo 4 Entity: Cohort, Faculty, Major, Subject.
 * Mỗi nhóm gồm: getAll, create, update, delete.
 */

import { toAPIResponse } from "#models/dto/response/APIResponse.js";
import * as academicService from "#service/academicService.js";

// ==========================================
// COHORT (Khóa học)
// ==========================================

/** GET /api/v1/academic/cohorts */
export const getAllCohorts = async (req, res, next) => {
    try {
        const result = await academicService.getAllCohorts();
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** POST /api/v1/academic/cohorts [Admin] */
export const createCohort = async (req, res, next) => {
    try {
        const result = await academicService.createCohort(req.body);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** PUT /api/v1/academic/cohorts/:id [Admin] */
export const updateCohort = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await academicService.updateCohort(id, req.body);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** DELETE /api/v1/academic/cohorts/:id [Admin] */
export const deleteCohort = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await academicService.deleteCohort(id);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

// ==========================================
// FACULTY (Khoa)
// ==========================================

/** GET /api/v1/academic/faculties */
export const getAllFaculties = async (req, res, next) => {
    try {
        const result = await academicService.getAllFaculties();
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** POST /api/v1/academic/faculties [Admin] */
export const createFaculty = async (req, res, next) => {
    try {
        const result = await academicService.createFaculty(req.body);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** PUT /api/v1/academic/faculties/:id [Admin] */
export const updateFaculty = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await academicService.updateFaculty(id, req.body);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** DELETE /api/v1/academic/faculties/:id [Admin] */
export const deleteFaculty = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await academicService.deleteFaculty(id);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

// ==========================================
// MAJOR (Ngành học)
// ==========================================

/** GET /api/v1/academic/majors?faculty_code=... */
export const getAllMajors = async (req, res, next) => {
    try {
        const { faculty_code } = req.query;
        const result = await academicService.getAllMajors(faculty_code);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** POST /api/v1/academic/majors [Admin] */
export const createMajor = async (req, res, next) => {
    try {
        const result = await academicService.createMajor(req.body);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** PUT /api/v1/academic/majors/:id [Admin] */
export const updateMajor = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await academicService.updateMajor(id, req.body);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** DELETE /api/v1/academic/majors/:id [Admin] */
export const deleteMajor = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await academicService.deleteMajor(id);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

// ==========================================
// SUBJECT (Môn học)
// ==========================================

/** GET /api/v1/academic/subjects?major_code=...&faculty_code=... */
export const getAllSubjects = async (req, res, next) => {
    try {
        const { major_code, faculty_code } = req.query;
        const result = await academicService.getAllSubjects(major_code, faculty_code);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** POST /api/v1/academic/subjects [Admin] */
export const createSubject = async (req, res, next) => {
    try {
        const result = await academicService.createSubject(req.body);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** PUT /api/v1/academic/subjects/:id [Admin] */
export const updateSubject = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await academicService.updateSubject(id, req.body);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};

/** DELETE /api/v1/academic/subjects/:id [Admin] */
export const deleteSubject = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const result = await academicService.deleteSubject(id);
        return res.status(result.statusCode).json(toAPIResponse(result.statusCode, result.message, result.data, result.errors));
    } catch (error) { next(error); }
};
