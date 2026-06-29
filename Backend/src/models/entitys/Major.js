/**
 * ============================================
 * ENTITY: Major (Ngành học)
 * ============================================
 * Bảng: majors
 * Mô tả: Lưu thông tin ngành học, thuộc một Khoa.
 * Quan hệ:
 *   - ManyToOne → Faculty (ngành thuộc khoa nào) — ON DELETE CASCADE
 *   - OneToMany → Subject (một ngành có nhiều môn)
 *   - OneToMany → User (người dùng thuộc ngành nào)
 *   - OneToMany → Document (tài liệu thuộc ngành nào)
 */

import { EntitySchema } from "typeorm";

export const Major = new EntitySchema({
    name: "Major",
    tableName: "majors",
    columns: {
        // === Khóa chính, tự tăng ===
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        // === Mã ngành (VD: BIT, SE) - Unique ===
        code: {
            type: "varchar",
            length: 30,
            unique: true,
            nullable: false,
        },
        // === Tên ngành (VD: Kỹ thuật Phần mềm) ===
        name: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        // === Mô tả ngành (tuỳ chọn) ===
        description: {
            type: "text",
            nullable: true,
        },
    },
    relations: {
        // === Ngành thuộc Khoa nào (FK → faculties.id) ===
        faculty: {
            type: "many-to-one",
            target: "Faculty",
            joinColumn: { name: "faculty_id" },
            inverseSide: "majors",
            nullable: false,
            onDelete: "CASCADE",
        },
        // === Một ngành có nhiều môn học ===
        subjects: {
            type: "one-to-many",
            target: "Subject",
            inverseSide: "major",
        },
        // === Một ngành có nhiều người dùng ===
        users: {
            type: "one-to-many",
            target: "User",
            inverseSide: "major",
        },
        // === Một ngành có nhiều tài liệu ===
        documents: {
            type: "one-to-many",
            target: "Document",
            inverseSide: "major",
        },
    },
});
