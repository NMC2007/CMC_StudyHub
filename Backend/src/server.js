/**
 * ============================================
 * SERVER.JS - Entry Point của StudyHub Backend
 * ============================================
 * Cấu hình:
 *   - Express: Middleware xử lý JSON, URL-encoded
 *   - CORS: Cho phép Frontend (port 5173) truy cập API
 *   - TypeORM: Kết nối PostgreSQL, synchronize schema, ghi log SQL
 *   - Routes: Đăng ký các router theo tiền tố /api/v1/*
 */

import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRouters.js";

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

// === Middleware parse request body ===
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================
// ĐĂNG KÝ ROUTES
// ==========================================
app.use("/api/v1/auth", authRouter);

// ==========================================
// KHỞI ĐỘNG SERVER VỚI TYPEORM
// ==========================================
// connectDB() sẽ khởi tạo TypeORM DataSource (synchronize + logging).
// Chỉ khi kết nối DB thành công, server mới bắt đầu lắng nghe request.
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
        console.log(`🌐 CORS: Đã cho phép http://localhost:5173`);
    });
}).catch((error) => {
    console.error("❌ Không thể khởi động server:", error.message);
    process.exit(1);
});