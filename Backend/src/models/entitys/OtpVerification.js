/**
 * ============================================
 * ENTITY: OtpVerification (Xác thực Email bằng mã OTP)
 * ============================================
 * Bảng: otp_verifications
 * Mô tả: Lưu trữ mã OTP 6 chữ số được gửi tới email người dùng
 *         trong quá trình đăng ký tài khoản mới.
 *
 * Luồng:
 *   1. API send-otp sinh mã OTP → lưu vào bảng này → gửi email
 *   2. API register kiểm tra mã OTP khớp → đánh dấu is_used = true → tạo user
 *
 * Lưu ý:
 *   - Mỗi email chỉ giữ 1 OTP hoạt động tại một thời điểm (OTP cũ sẽ bị xóa khi gửi lại)
 *   - OTP hết hạn sau thời gian cấu hình OTP_EXPIRY_MINUTES trong .env (mặc định 10 phút)
 */

import { EntitySchema } from "typeorm";

export const OtpVerification = new EntitySchema({
    name: "OtpVerification",
    tableName: "otp_verifications",
    columns: {
        // === Khóa chính, tự tăng ===
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        // === Email nhận mã OTP (indexed để tra cứu nhanh) ===
        email: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        // === Mã OTP 6 chữ số ===
        otp_code: {
            type: "varchar",
            length: 6,
            nullable: false,
        },
        // === Thời gian hết hạn OTP ===
        expires_at: {
            type: "timestamp",
            nullable: false,
        },
        // === Đã sử dụng chưa (true = đã xác thực thành công, không thể dùng lại) ===
        is_used: {
            type: "boolean",
            default: false,
        },
        // === Thời gian tạo ===
        created_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    indices: [
        {
            name: "IDX_OTP_EMAIL",
            columns: ["email"],
        },
    ],
});
