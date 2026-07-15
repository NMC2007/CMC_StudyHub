/**
 * ============================================
 * AUTH ROUTES - Đăng ký các API xác thực
 * ============================================
 * Tiền tố: /api/v1/auth (được đăng ký trong server.js)
 *
 * Lưu ý: Các route auth là PUBLIC APIs — không cần
 * jwtFilter hay rbac middleware vì người dùng chưa đăng nhập
 * vẫn phải truy cập được.
 */

import express from "express";
import { sendOtp, register, login, refreshToken, logout } from "#controller/authController.js";

const authRouter = express.Router();

// @route  POST /api/v1/auth/send-otp
// @desc   Gửi mã OTP 6 số xác thực email trước khi đăng ký
// @access Public
authRouter.post("/send-otp", sendOtp);

// @route  POST /api/v1/auth/register
// @desc   Đăng ký tài khoản mới (yêu cầu mã OTP hợp lệ)
// @access Public
authRouter.post("/register", register);

// @route  POST /api/v1/auth/login
// @desc   Đăng nhập (email hoặc username)
// @access Public
authRouter.post("/login", login);

// @route  POST /api/v1/auth/refresh
// @desc   Làm mới Access Token bằng Refresh Token
// @access Public
authRouter.post("/refresh", refreshToken);

// @route  POST /api/v1/auth/logout
// @desc   Đăng xuất (xóa Refresh Token khỏi DB)
// @access Public
authRouter.post("/logout", logout);

export default authRouter;