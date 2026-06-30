/**
 * ============================================
 * ENTITY: Subject (Môn học)
 * ============================================
 * Bảng: subjects
 * Mô tả: Lưu thông tin môn học chung của trường.
 * Quan hệ:
 *   - ManyToMany → Major (một môn có thể thuộc nhiều ngành học) qua bảng subject_majors
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
        // === Mã môn học (VD: IT3011) - Unique ===
        code: {
            type: "varchar",
            length: 30,
            unique: true,
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
        // === Môn thuộc những Ngành nào (ManyToMany qua subject_majors) ===
        majors: {
            type: "many-to-many",
            target: "Major",
            inverseSide: "subjects",
            joinTable: {
                name: "subject_majors",
                joinColumn: {
                    name: "subject_id",
                    referencedColumnName: "id",
                },
                inverseJoinColumn: {
                    name: "major_id",
                    referencedColumnName: "id",
                },
            },
        },
        // === Một môn có nhiều tài liệu ===
        documents: {
            type: "one-to-many",
            target: "Document",
            inverseSide: "subject",
        },
    },
});
