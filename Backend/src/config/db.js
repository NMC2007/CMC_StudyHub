/**
 * ============================================
 * CẤU HÌNH TYPEORM DATASOURCE
 * ============================================
 * Thay thế cấu hình pg Pool bằng TypeORM DataSource.
 * TypeORM sẽ tự động đồng bộ schema -> DB khi synchronize = true.
 * Mọi câu lệnh SQL sẽ được ghi log ra console nhờ logging = true.
 */

import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

// === Import tất cả Entities ===
import { Cohort } from "#models/entitys/Cohort.js";
import { Faculty } from "#models/entitys/Faculty.js";
import { Major } from "#models/entitys/Major.js";
import { Subject } from "#models/entitys/Subject.js";
import { User } from "#models/entitys/User.js";
import { RefreshToken } from "#models/entitys/RefreshToken.js";
import { Document } from "#models/entitys/Document.js";
import { Group } from "#models/entitys/Group.js";
import { GroupMember } from "#models/entitys/GroupMember.js";
import { DocumentLike } from "#models/entitys/DocumentLike.js";
import { Bookmark } from "#models/entitys/Bookmark.js";
import { DocumentView } from "#models/entitys/DocumentView.js";
import { OtpVerification } from "#models/entitys/OtpVerification.js";
import { GroupDocument } from "#models/entitys/GroupDocument.js";

dotenv.config();

/**
 * AppDataSource - Kết nối chính tới PostgreSQL thông qua TypeORM.
 *
 * - type: "postgres"         → Sử dụng driver PostgreSQL
 * - host/port/username/...   → Đọc từ file .env
 * - synchronize: true        → Tự động đồng bộ schema Entity -> DB (chỉ dùng ở dev)
 * - logging: true            → Ghi log tất cả SQL query ra console mỗi khi có request
 * - entities: [...]          → Danh sách Entity classes để TypeORM quản lý
 */
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // === synchronize: Tự động tạo/cập nhật bảng theo Entity (CHỈ DÙNG KHI DEV) ===
    synchronize: process.env.DB_SYNCHRONIZE === "true",

    // === logging: Ghi log mọi câu lệnh SQL ra console ===
    logging: process.env.DB_LOGGING === "true",

    // === Danh sách tất cả các Entity trong hệ thống ===
    entities: [
        Cohort,
        Faculty,
        Major,
        Subject,
        User,
        RefreshToken,
        Document,
        Group,
        GroupMember,
        GroupDocument,
        DocumentLike,
        Bookmark,
        DocumentView,
        OtpVerification,
    ],
});


/**
 * connectDB - Hàm khởi tạo kết nối TypeORM DataSource.
 * Gọi hàm này trong server.js trước khi app.listen().
 */
export const connectDB = async () => {
    try {
        await AppDataSource.initialize();
        console.log("✅ TypeORM: Kết nối PostgreSQL thành công!");
        console.log("📋 TypeORM: Synchronize schema đã được bật (dev mode).");
        console.log("📝 TypeORM: SQL Logging đã được bật.");

        // === ĐẢM BẢO TẠO BẢNG otp_verifications (Phòng trường hợp DB_SYNCHRONIZE=false hoặc nodemon không reload .env) ===
        await AppDataSource.query(`
            CREATE TABLE IF NOT EXISTS "otp_verifications" (
                "id" SERIAL PRIMARY KEY,
                "email" VARCHAR(100) NOT NULL,
                "otp_code" VARCHAR(6) NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "is_used" BOOLEAN NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS "IDX_OTP_EMAIL" ON "otp_verifications" ("email");
        `);
        console.log("🛠️ TypeORM: Đã kiểm tra & đảm bảo bảng otp_verifications tồn tại trong DB.");
    } catch (error) {
        console.error("❌ TypeORM: Kết nối thất bại:", error.message);
        throw error;
    }
};