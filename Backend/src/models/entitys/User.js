/**
 * ============================================
 * ENTITY: User (Người dùng)
 * ============================================
 * Bảng: users
 * Mô tả: Lưu thông tin người dùng hệ thống (Admin, Lecturer, Student).
 * Quan hệ:
 *   - ManyToOne → Cohort (sinh viên thuộc khóa nào) — ON DELETE SET NULL
 *   - ManyToOne → Faculty (người dùng thuộc khoa nào) — ON DELETE SET NULL
 *   - ManyToOne → Major (sinh viên thuộc ngành nào) — ON DELETE SET NULL
 *   - OneToMany → RefreshToken, Document, Group, GroupMember,
 *                 DocumentLike, Bookmark, DocumentView
 *
 * Lưu ý: Trường 'role' sử dụng PostgreSQL ENUM type: user_role ('ADMIN','LECTURER','STUDENT').
 *         TypeORM sẽ tự tạo enum type khi synchronize.
 */

import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        // === Khóa chính, tự tăng ===
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        // === Họ tên đầy đủ ===
        full_name: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        // === Tên đăng nhập - Unique ===
        username: {
            type: "varchar",
            length: 50,
            unique: true,
            nullable: false,
        },
        // === Mã người dùng (Mã SV/GV/Admin) - Unique ===
        code: {
            type: "varchar",
            length: 11,
            unique: true,
            nullable: false,
        },
        // === Email - Unique ===
        email: {
            type: "varchar",
            length: 100,
            unique: true,
            nullable: false,
        },
        // === Số điện thoại - Unique, tuỳ chọn ===
        phone: {
            type: "varchar",
            length: 20,
            unique: true,
            nullable: true,
        },
        // === Ngày sinh (tuỳ chọn) ===
        dob: {
            type: "date",
            nullable: true,
        },
        // === Mật khẩu đã hash (bcrypt) ===
        password_hash: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        // === Vai trò: ADMIN | LECTURER | STUDENT (PostgreSQL ENUM) ===
        role: {
            type: "enum",
            enum: ["ADMIN", "LECTURER", "STUDENT"],
            enumName: "user_role",
            nullable: false,
        },
        // === Trạng thái tài khoản: ACTIVE | INACTIVE | BANNED (PostgreSQL ENUM) ===
        status: {
            type: "enum",
            enum: ["ACTIVE", "INACTIVE", "BANNED"],
            enumName: "user_status",
            default: "ACTIVE",
            nullable: false,
        },
        // === Đường dẫn ảnh đại diện (VD: /public/avatars/abc.png) ===
        avatar: {
            type: "varchar",
            length: 255,
            nullable: true,
        },
        // === Thời gian tạo tài khoản ===
        created_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
        // === Thời gian cập nhật gần nhất ===
        updated_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        // === Sinh viên thuộc Khóa nào (FK → cohorts.id) — Chỉ bắt buộc với STUDENT ===
        cohort: {
            type: "many-to-one",
            target: "Cohort",
            joinColumn: { name: "cohort_id" },
            inverseSide: "users",
            nullable: true,
            onDelete: "SET NULL",
        },
        // === Người dùng thuộc Khoa nào (FK → faculties.id) ===
        faculty: {
            type: "many-to-one",
            target: "Faculty",
            joinColumn: { name: "faculty_id" },
            inverseSide: "users",
            nullable: true,
            onDelete: "SET NULL",
        },
        // === Sinh viên thuộc Ngành nào (FK → majors.id) ===
        major: {
            type: "many-to-one",
            target: "Major",
            joinColumn: { name: "major_id" },
            inverseSide: "users",
            nullable: true,
            onDelete: "SET NULL",
        },
        // === Một user có nhiều refresh tokens ===
        refreshTokens: {
            type: "one-to-many",
            target: "RefreshToken",
            inverseSide: "user",
        },
        // === Một user sở hữu nhiều tài liệu ===
        documents: {
            type: "one-to-many",
            target: "Document",
            inverseSide: "owner",
        },
        // === Một user sở hữu nhiều nhóm ===
        ownedGroups: {
            type: "one-to-many",
            target: "Group",
            inverseSide: "owner",
        },
        // === Một user tham gia nhiều nhóm (qua bảng group_members) ===
        groupMemberships: {
            type: "one-to-many",
            target: "GroupMember",
            inverseSide: "user",
        },
        // === Một user có nhiều lượt thích ===
        likes: {
            type: "one-to-many",
            target: "DocumentLike",
            inverseSide: "user",
        },
        // === Một user có nhiều bookmark ===
        bookmarks: {
            type: "one-to-many",
            target: "Bookmark",
            inverseSide: "user",
        },
        // === Một user có nhiều lượt xem ===
        views: {
            type: "one-to-many",
            target: "DocumentView",
            inverseSide: "user",
        },
    },
});
