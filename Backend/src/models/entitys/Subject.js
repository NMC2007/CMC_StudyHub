/**
 * ============================================
 * ENTITY: Subject (Môn học)
 * ============================================
 * Bảng: subjects
 * Mô tả: Lưu thông tin môn học, thuộc một Khóa + Ngành.
 * Quan hệ:
 *   - ManyToOne → Cohort (môn thuộc khóa nào) — ON DELETE CASCADE
 *   - ManyToOne → Major (môn thuộc ngành nào) — ON DELETE CASCADE
 *   - OneToMany → Document (một môn có nhiều tài liệu)
 */

import { EntitySchema } from "typeorm";

export const Subject = new EntitySchema({
    name: "Subject",
    tableName: "subjects",
    columns: {
        // === Khóa chính, tự tăng ===
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        // === Mã môn học (VD: IT3011) ===
        code: {
            type: "varchar",
            length: 30,
            nullable: false,
        },
        // === Tên môn (VD: Lập trình Java) ===
        name: {
            type: "varchar",
            length: 150,
            nullable: false,
        },
        // === Mô tả môn học (tuỳ chọn) ===
        description: {
            type: "text",
            nullable: true,
        },
    },
    relations: {
        // === Môn thuộc Khóa nào (FK → cohorts.id) ===
        cohort: {
            type: "many-to-one",
            target: "Cohort",
            joinColumn: { name: "cohort_id" },
            inverseSide: "subjects",
            nullable: false,
            onDelete: "CASCADE",
        },
        // === Môn thuộc Ngành nào (FK → majors.id) ===
        major: {
            type: "many-to-one",
            target: "Major",
            joinColumn: { name: "major_id" },
            inverseSide: "subjects",
            nullable: false,
            onDelete: "CASCADE",
        },
        // === Một môn có nhiều tài liệu ===
        documents: {
            type: "one-to-many",
            target: "Document",
            inverseSide: "subject",
        },
    },
});
