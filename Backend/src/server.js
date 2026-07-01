/**
 * ============================================
 * SERVER.JS - Entry Point của StudyHub Backend
 * ============================================
 * Cấu hình:
 *   - Express: Middleware xử lý JSON, URL-encoded
 *   - CORS: Cho phép Frontend (port 5173) truy cập API
 *   - Cookie Parser: Parse cookie từ request
 *   - Static Files: Serve file tĩnh từ thư mục /public
 *   - TypeORM: Kết nối PostgreSQL, synchronize schema, ghi log SQL
 *   - Routes: Đăng ký các router theo tiền tố /api/v1/*
 *   - Global Error Handler: Bắt lỗi tập trung ở cuối chuỗi middleware
 */

import "reflect-metadata";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRouters.js";
import userRouter from "./routes/userRouters.js";
import academicRouter from "./routes/academicRouters.js";
import documentRouter from "./routes/documentRouters.js";
import { errorHandler } from "./advice/errorHandler.js";

// === Load biến môi trường từ file .env ===
dotenv.config();

const PORT = process.env.SERVER_PORT || 8081;

const app = express();

// ==========================================
// CẤU HÌNH CORS
// ==========================================
// Cho phép Frontend React (chạy tại port 5173) gửi request đến Backend.
// credentials: true → cho phép gửi cookie/token qua cross-origin request.
app.use(cors({
    origin: "http://localhost:" + process.env.FRONTEND_PORT,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// === Middleware parse cookie từ request ===
app.use(cookieParser());

// === Middleware parse request body ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// === Serve file tĩnh (avatar, tài liệu) từ thư mục /public ===
app.use(express.static("public"));

// ==========================================
// ĐĂNG KÝ ROUTES
// ==========================================
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/academic", academicRouter);
app.use("/api/v1/documents", documentRouter);

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
// Phải đặt SAU tất cả routes.
// Bắt mọi lỗi không xử lý được ở Controller/Service.
// Trả response chuẩn APIResponse, ngăn server bị crash.
app.use(errorHandler);

// ==========================================
// KHỞI ĐỘNG SERVER VỚI TYPEORM
// ==========================================
// connectDB() sẽ khởi tạo TypeORM DataSource (synchronize + logging).
// Chỉ khi kết nối DB thành công, server mới bắt đầu lắng nghe request.
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
        console.log(`🌐 CORS: Đã cho phép http://localhost:${process.env.FRONTEND_PORT}`);
    });
}).catch((error) => {
    console.error("❌ Không thể khởi động server:", error.message);
    process.exit(1);
});