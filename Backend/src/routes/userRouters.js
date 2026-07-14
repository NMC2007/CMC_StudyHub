/**
 * ============================================
 * USER ROUTES - Đăng ký các API quản lý Profile
 * ============================================
 * Tiền tố: /api/v1/users (được đăng ký trong server.js)
 * Mọi route ở đây đều yêu cầu đăng nhập (jwtFilter).
 */

import express from "express";
import { getProfile, updateProfile, updateAvatar, getAllUsers, searchUsers, getUserById } from "#controller/userController.js";
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
// @desc   Lấy thông tin chi tiết của user theo id
// @access Private (Mọi User)
userRouter.get("/:id", getUserById);

export default userRouter;
