/**
 * ============================================
 * ENTITY: Faculty (Khoa)
 * ============================================
 * Bảng: faculties
 * Mô tả: Lưu thông tin các Khoa trong trường.
 * Quan hệ:
 *   - OneToMany → Major (một khoa có nhiều ngành)
 *   - OneToMany → User (người dùng thuộc khoa nào)
 *   - OneToMany → Document (tài liệu thuộc khoa nào)
 */

import { EntitySchema } from "typeorm";

export const Faculty = new EntitySchema({
    name: "Faculty",
    tableName: "faculties",
    columns: {
        // === Khóa chính, tự tăng ===
        id: {
            type: "int",
            primary: true,
            generated: true,
        },
        // === Mã khoa (VD: CNTT, KT) - Unique ===
        code: {
            type: "varchar",
            length: 30,
            unique: true,
            nullable: false,
        },
        // === Tên khoa (VD: Khoa Công nghệ Thông tin) ===
        name: {
            type: "varchar",
            length: 100,
            nullable: false,
        },
        // === Mô tả khoa (tuỳ chọn) ===
        description: {
            type: "text",
            nullable: true,
        },
    },
    relations: {
        // === Một khoa có nhiều ngành học ===
        majors: {
            type: "one-to-many",
            target: "Major",
            inverseSide: "faculty",
        },
        // === Một khoa có nhiều người dùng ===
        users: {
            type: "one-to-many",
            target: "User",
            inverseSide: "faculty",
        },
        // === Một khoa có nhiều tài liệu ===
        documents: {
            type: "one-to-many",
            target: "Document",
            inverseSide: "faculty",
        },
    },
});
