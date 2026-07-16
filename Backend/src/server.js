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
import groupRouter from "./routes/groupRouters.js";
import cronRouter from "./routes/cronRouters.js";
import adminRouter from "./routes/adminRouters.js";
import { initCronJobs } from "./jobs/cronJobs.js";
import { errorHandler } from "./advice/errorHandler.js";

// === Load biến môi trường từ file .env ===
dotenv.config();

const PORT = process.env.SERVER_PORT || 8081;
const allowedOrigins = (process.env.FRONTEND_BASE_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());

const app = express();

// ==========================================
// CẤU HÌNH CORS
// ==========================================
// Cho phép Frontend React gửi request đến Backend.
// credentials: true → cho phép gửi cookie/token qua cross-origin request.
app.use(cors({
    origin: (origin, callback) => {
        const isAllowedOrigin = !origin ||
            allowedOrigins.includes(origin) ||
            /\.vercel\.app$/.test(origin) ||
            /\.wangganh\.id\.vn$/.test(origin) ||
            /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d{1,5}$/.test(origin);

        if (isAllowedOrigin) {
            callback(null, true);
        } else {
            console.warn(`⚠️ [CORS Blocked] Origin bị từ chối: "${origin}". Vui lòng kiểm tra lại địa chỉ trong FRONTEND_BASE_URL (.env)`);
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
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
app.use("/api/v1/groups", groupRouter);
app.use("/api/v1/admin/cron", cronRouter);
app.use("/api/v1/admin", adminRouter);

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
    // Khởi động bộ lập lịch Node-Cron
    initCronJobs();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
        console.log(`🌐 CORS: Đã cho phép [ ${allowedOrigins.join(", ")} ] Truy cập`);
        console.log(`📡 LAN: Truy cập từ mạng nội bộ qua http://<IP_LAN_MÁY_BẠN>:${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Không thể khởi động server:", error.message);
    process.exit(1);
});