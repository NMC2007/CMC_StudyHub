/**
 * ============================================
 * ENTITY: Cohort (Khóa học)
 * ============================================
 * Bảng: cohorts
 * Mô tả: Lưu thông tin các khóa học (VD: K18, K19).
 * Quan hệ:
 *   - OneToMany → User (sinh viên thuộc khóa nào)
 *   - OneToMany → Subject (môn học thuộc khóa nào)
 *   - OneToMany → Document (tài liệu thuộc khóa nào)
 */

import { EntitySchema } from "typeorm";

export const Cohort = new EntitySchema({
    name: "Cohort",
    tableName: "cohorts",
    columns: {
        // === Khóa chính, tự tăng ===
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        // === Mã khóa học (VD: K18, K19) - Unique ===
        code: {
            type: "varchar",
            length: 20,
            unique: true,
            nullable: false,
        },
        // === Tên đầy đủ (VD: Khóa 2018) ===
        name: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        // === Năm bắt đầu ===
        start_year: {
            type: "int",
            nullable: false,
        },
        // === Năm kết thúc ===
        end_year: {
            type: "int",
            nullable: false,
        },
    },
    relations: {
        // === Một khóa có nhiều sinh viên ===
        users: {
            type: "one-to-many",
            target: "User",
            inverseSide: "cohort",
        },
        // === Một khóa có nhiều tài liệu ===
        documents: {
            type: "one-to-many",
            target: "Document",
            inverseSide: "cohort",
        },
    },
});
