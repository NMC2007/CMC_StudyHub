/**
 * academicApi.js
 * Các API call liên quan đến Cấu trúc Học thuật:
 * Cohort → Faculty → Major → Subject
 *
 * Phân loại 2 nhóm:
 *  1. Public/User: getCohorts, getFacultiesByCohort, getMajorsByFaculty, getSubjectsByMajor
 *     Dùng trong: RegisterPage (CascadeSelect), UploadModal, SearchPage
 *  2. Admin CRUD: Tạo/Sửa/Xóa từng bảng học thuật
 *     Dùng trong: /admin/academic
 */
import api from './axiosInstance';

// ─── PUBLIC / USER ────────────────────────────────────────────────────────────

/**
 * Lấy tất cả Khóa học.
 * @returns Promise — data.data: { cohorts: [] }
 */
export const getCohorts = () =>
  api.get('/academic/cohorts');

/**
 * Lấy Khoa theo Khóa học.
 * @param {number} cohortId
 * @returns Promise — data.data: { faculties: [] }
 */
export const getFacultiesByCohort = (cohortId) =>
  api.get(`/academic/cohorts/${cohortId}/faculties`);

/**
 * Lấy Ngành theo Khoa.
 * @param {number} facultyId
 * @returns Promise — data.data: { majors: [] }
 */
export const getMajorsByFaculty = (facultyId) =>
  api.get(`/academic/faculties/${facultyId}/majors`);

/**
 * Lấy Môn học theo Ngành.
 * @param {number} majorId
 * @returns Promise — data.data: { subjects: [] }
 */
export const getSubjectsByMajor = (majorId) =>
  api.get(`/academic/majors/${majorId}/subjects`);

// ─── ADMIN — COHORTS ──────────────────────────────────────────────────────────

export const createCohort = (body) =>
  api.post('/academic/cohorts', body);

export const updateCohort = (id, body) =>
  api.put(`/academic/cohorts/${id}`, body);

export const deleteCohort = (id) =>
  api.delete(`/academic/cohorts/${id}`);

// ─── ADMIN — FACULTIES ────────────────────────────────────────────────────────

export const getAllFaculties = () =>
  api.get('/academic/faculties');

export const createFaculty = (body) =>
  api.post('/academic/faculties', body);

export const updateFaculty = (id, body) =>
  api.put(`/academic/faculties/${id}`, body);

export const deleteFaculty = (id) =>
  api.delete(`/academic/faculties/${id}`);

// ─── ADMIN — MAJORS ───────────────────────────────────────────────────────────

export const getMajorsByFacultyAdmin = (facultyId) =>
  api.get(`/academic/faculties/${facultyId}/majors`);

export const createMajor = (body) =>
  api.post('/academic/majors', body);

export const updateMajor = (id, body) =>
  api.put(`/academic/majors/${id}`, body);

export const deleteMajor = (id) =>
  api.delete(`/academic/majors/${id}`);

// ─── ADMIN — SUBJECTS ─────────────────────────────────────────────────────────

export const getSubjectsByMajorAdmin = (majorId) =>
  api.get(`/academic/majors/${majorId}/subjects`);

export const createSubject = (body) =>
  api.post('/academic/subjects', body);

export const updateSubject = (id, body) =>
  api.put(`/academic/subjects/${id}`, body);

export const deleteSubject = (id) =>
  api.delete(`/academic/subjects/${id}`);
