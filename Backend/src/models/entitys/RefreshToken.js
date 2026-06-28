/**
 * ============================================
 * ENTITY: RefreshToken (Quản lý phiên đăng nhập)
 * ============================================
 * Bảng: refresh_tokens
 * Mô tả: Lưu Refresh Token của User để cấp lại Access Token.
 * Quan hệ:
 *   - ManyToOne → User (token thuộc user nào) — ON DELETE CASCADE
 */

import { EntitySchema } from "typeorm";

export const RefreshToken = new EntitySchema({
    name: "RefreshToken",
    tableName: "refresh_tokens",
    columns: {
        // === Khóa chính, tự tăng ===
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        // === Nội dung token - Unique ===
        token: {
            type: "varchar",
            length: 500,
            unique: true,
            nullable: false,
        },
        // === Thời gian hết hạn token ===
        expires_at: {
            type: "timestamp",
            nullable: false,
        },
        // === Thời gian tạo token ===
        created_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        // === Token thuộc User nào (FK → users.id) — Xóa user sẽ xóa token ===
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "user_id" },
            inverseSide: "refreshTokens",
            nullable: false,
            onDelete: "CASCADE",
        },
    },
});
