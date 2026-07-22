/**
 * ============================================
 * USER ROUTES - Đăng ký các API quản lý Profile
 * ============================================
 * Tiền tố: /api/v1/users (được đăng ký trong server.js)
 * Mọi route ở đây đều yêu cầu đăng nhập (jwtFilter).
 *
 * LƯU Ý THỨ TỰ ROUTE:
 *   - /profile, /search phải đặt TRƯỚC /:id
 *     để Express không nhầm các chuỗi tĩnh ("profile", "search") là giá trị :id.
 */

import express from "express";
import { getProfile, updateProfile, updateAvatar, getAllUsers, searchUsers, getUserProfileById } from "#controller/userController.js";
import { jwtFilter } from "#config/security/jwtFilter.js";
import { rbac } from "#config/security/rbacMiddleware.js";
import { uploadAvatar } from "#config/security/uploadMiddleware.js";

const userRouter = express.Router();

// Áp dụng jwtFilter cho tất cả các endpoint trong router này
userRouter.use(jwtFilter);

// @route  GET /api/v1/users/profile
// @desc   Lấy thông tin tài khoản hiện tại
// @access Private
userRouter.get("/profile", getProfile);

// @route  PUT /api/v1/users/profile
// @desc   Cập nhật thông tin cá nhân (full_name, phone, dob)
// @access Private
userRouter.put("/profile", updateProfile);

// @route  PUT /api/v1/users/avatar
// @desc   Upload ảnh đại diện mới
// @access Private
userRouter.put("/avatar", uploadAvatar.single("avatar"), updateAvatar);

// @route  GET /api/v1/users
// @desc   Lấy danh sách toàn bộ người dùng
// @access Private (Mọi User)
userRouter.get("/", getAllUsers);

// @route  GET /api/v1/users/search
// @desc   Tìm kiếm người dùng theo tên, mã code, email, username, sđt
// @access Private (Mọi User)
userRouter.get("/search", searchUsers);

// @route  GET /api/v1/users/:id
// @desc   Lấy thông tin trang cá nhân của người dùng theo ID kèm danh sách tài liệu họ đã đăng tải
//         Tài liệu PRIVATE/GROUP bị lọc theo quyền truy cập của người xem
// @access Private (Mọi User đã đăng nhập)
userRouter.get("/:id", getUserProfileById);

export default userRouter;
