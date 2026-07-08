/**
 * ============================================
 * ACADEMIC ROUTES - Đăng ký các API cấu trúc học thuật
 * ============================================
 * Tiền tố: /api/v1/academic (được đăng ký trong server.js)
 *
 * Phân quyền:
 *   - GET endpoints: Yêu cầu đăng nhập (jwtFilter) — mọi user đã xác thực đều xem được.
 *   - POST/PUT/DELETE endpoints: ADMIN ONLY (jwtFilter + rbac("ADMIN"))
 *     → Chỉ Admin mới được quản lý danh mục học thuật.
 */

import express from "express";
import { jwtFilter } from "#config/security/jwtFilter.js";
import { rbac } from "#config/security/rbacMiddleware.js";
import * as ctrl from "#controller/academicController.js";

const academicRouter = express.Router();

// ==========================================
// COHORT (Khóa học)
// ==========================================

// @route  GET /api/v1/academic/cohorts
// @desc   Lấy danh sách tất cả khóa học
// @access Public (phục vụ form đăng ký và tra cứu)
academicRouter.get("/cohorts", ctrl.getAllCohorts);

// @route  POST /api/v1/academic/cohorts
// @desc   Tạo khóa học mới
// @access Admin
academicRouter.post("/cohorts", jwtFilter, rbac("ADMIN"), ctrl.createCohort);

// @route  PUT /api/v1/academic/cohorts/:id
// @desc   Cập nhật khóa học
// @access Admin
academicRouter.put("/cohorts/:id", jwtFilter, rbac("ADMIN"), ctrl.updateCohort);

// @route  DELETE /api/v1/academic/cohorts/:id
// @desc   Xóa khóa học
// @access Admin
academicRouter.delete("/cohorts/:id", jwtFilter, rbac("ADMIN"), ctrl.deleteCohort);

// ==========================================
// FACULTY (Khoa)
// ==========================================

// @route  GET /api/v1/academic/faculties
// @desc   Lấy danh sách tất cả khoa
// @access Public (phục vụ form đăng ký và tra cứu)
academicRouter.get("/faculties", ctrl.getAllFaculties);

// @route  POST /api/v1/academic/faculties
// @desc   Tạo khoa mới
// @access Admin
academicRouter.post("/faculties", jwtFilter, rbac("ADMIN"), ctrl.createFaculty);

// @route  PUT /api/v1/academic/faculties/:id
// @desc   Cập nhật khoa
// @access Admin
academicRouter.put("/faculties/:id", jwtFilter, rbac("ADMIN"), ctrl.updateFaculty);

// @route  DELETE /api/v1/academic/faculties/:id
// @desc   Xóa khoa
// @access Admin
academicRouter.delete("/faculties/:id", jwtFilter, rbac("ADMIN"), ctrl.deleteFaculty);

// ==========================================
// MAJOR (Ngành học)
// ==========================================

// @route  GET /api/v1/academic/majors?faculty_code=...
// @desc   Lấy danh sách ngành (lọc theo khoa nếu có query param)
// @access Public (phục vụ form đăng ký và tra cứu)
academicRouter.get("/majors", ctrl.getAllMajors);

// @route  POST /api/v1/academic/majors
// @desc   Tạo ngành mới (body cần faculty_code để liên kết khoa cha)
// @access Admin
academicRouter.post("/majors", jwtFilter, rbac("ADMIN"), ctrl.createMajor);

// @route  PUT /api/v1/academic/majors/:id
// @desc   Cập nhật ngành
// @access Admin
academicRouter.put("/majors/:id", jwtFilter, rbac("ADMIN"), ctrl.updateMajor);

// @route  DELETE /api/v1/academic/majors/:id
// @desc   Xóa ngành
// @access Admin
academicRouter.delete("/majors/:id", jwtFilter, rbac("ADMIN"), ctrl.deleteMajor);

// ==========================================
// SUBJECT (Môn học)
// ==========================================

// @route  GET /api/v1/academic/subjects?major_code=...
// @desc   Lấy danh sách môn học (lọc theo ngành nếu có query param)
// @access Public (phục vụ form đăng ký và tra cứu)
academicRouter.get("/subjects", ctrl.getAllSubjects);

// @route  POST /api/v1/academic/subjects
// @desc   Tạo môn học mới (body cần major_code + cohort_code)
// @access Admin
academicRouter.post("/subjects", jwtFilter, rbac("ADMIN"), ctrl.createSubject);

// @route  PUT /api/v1/academic/subjects/:id
// @desc   Cập nhật môn học
// @access Admin
academicRouter.put("/subjects/:id", jwtFilter, rbac("ADMIN"), ctrl.updateSubject);

// @route  DELETE /api/v1/academic/subjects/:id
// @desc   Xóa môn học
// @access Admin
academicRouter.delete("/subjects/:id", jwtFilter, rbac("ADMIN"), ctrl.deleteSubject);

export default academicRouter;
