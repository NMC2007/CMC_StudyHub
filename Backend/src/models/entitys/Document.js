/**
 * ============================================
 * ENTITY: Document (Tài liệu học tập)
 * ============================================
 * Bảng: documents
 * Mô tả: Quản lý tài liệu tải lên hệ thống (PDF, DOCX, PPTX, ZIP).
 *         Hỗ trợ Soft Delete (xóa mềm) qua cờ is_deleted + deleted_at.
 * Quan hệ:
 *   - ManyToOne → Cohort, Faculty, Major (ON DELETE SET NULL)
 *   - ManyToOne → Subject (ON DELETE CASCADE)
 *   - ManyToOne → User/owner (ON DELETE CASCADE)
 *   - OneToMany → DocumentLike, Bookmark, DocumentView
 *
 * Lưu ý: Trường 'visibility' sử dụng PostgreSQL ENUM: doc_visibility ('PUBLIC','GROUP','PRIVATE').
 */

import { EntitySchema } from "typeorm";

export const Document = new EntitySchema({
    name: "Document",
    tableName: "documents",
    columns: {
        // === Khóa chính, tự tăng ===
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        // === Tiêu đề tài liệu ===
        title: {
            type: "varchar",
            length: 200,
            nullable: false,
        },
        // === Mô tả tài liệu (tuỳ chọn) ===
        description: {
            type: "text",
            nullable: true,
        },
        // === Loại tài liệu: DOCUMENT, ASSIGNMENT, EXAM, SLIDE, REFERENCE ===
        document_type: {
            type: "varchar",
            length: 30,
            nullable: true,
        },
        // === Quyền truy cập: PUBLIC | GROUP | PRIVATE (PostgreSQL ENUM) ===
        visibility: {
            type: "enum",
            enum: ["PUBLIC", "GROUP", "PRIVATE"],
            enumName: "doc_visibility",
            default: "PUBLIC",
        },
        // === Đường dẫn tệp trên server (VD: /public/docs/file.pdf) ===
        file_url: {
            type: "varchar",
            length: 255,
            nullable: false,
        },
        // === Dung lượng file (tính bằng byte) ===
        file_size: {
            type: "int",
            nullable: true,
        },
        // === Định dạng file: pdf, docx, pptx, zip ===
        file_type: {
            type: "varchar",
            length: 50,
            nullable: true,
        },
        // === Số lượt tải xuống ===
        download_count: {
            type: "int",
            default: 0,
        },
        // === Số lượt thích (Like count cache) ===
        like_count: {
            type: "int",
            default: 0,
        },
        // === Số lượt xem (View count cache) ===
        view_count: {
            type: "int",
            default: 0,
        },
        // === Cờ xóa mềm (Soft Delete) ===
        is_deleted: {
            type: "boolean",
            default: false,
        },
        // === Thời gian chuyển vào thùng rác (null = chưa xóa) ===
        deleted_at: {
            type: "timestamp",
            nullable: true,
        },
        // === Thời gian tạo tài liệu ===
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
        // === Tài liệu thuộc Khóa nào (FK → cohorts.id) ===
        cohort: {
            type: "many-to-one",
            target: "Cohort",
            joinColumn: { name: "cohort_id" },
            inverseSide: "documents",
            nullable: true,
            onDelete: "SET NULL",
        },
        // === Tài liệu thuộc Khoa nào (FK → faculties.id) ===
        faculty: {
            type: "many-to-one",
            target: "Faculty",
            joinColumn: { name: "faculty_id" },
            inverseSide: "documents",
            nullable: true,
            onDelete: "SET NULL",
        },
        // === Tài liệu thuộc Ngành nào (FK → majors.id) ===
        major: {
            type: "many-to-one",
            target: "Major",
            joinColumn: { name: "major_id" },
            inverseSide: "documents",
            nullable: true,
            onDelete: "SET NULL",
        },
        // === Tài liệu thuộc Môn nào (FK → subjects.id) — Bắt buộc ===
        subject: {
            type: "many-to-one",
            target: "Subject",
            joinColumn: { name: "subject_id" },
            inverseSide: "documents",
            nullable: false,
            onDelete: "CASCADE",
        },
        // === Người sở hữu tài liệu (FK → users.id) — Bắt buộc ===
        owner: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "owner_id" },
            inverseSide: "documents",
            nullable: false,
            onDelete: "CASCADE",
        },
        // === Một tài liệu có nhiều lượt thích ===
        likes: {
            type: "one-to-many",
            target: "DocumentLike",
            inverseSide: "document",
        },
        // === Một tài liệu có nhiều bookmark ===
        bookmarks: {
            type: "one-to-many",
            target: "Bookmark",
            inverseSide: "document",
        },
        // === Một tài liệu có nhiều lượt xem ===
        views: {
            type: "one-to-many",
            target: "DocumentView",
            inverseSide: "document",
        },
    },
});
