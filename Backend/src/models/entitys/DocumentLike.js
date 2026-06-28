/**
 * ============================================
 * ENTITY: DocumentLike (Lượt thích tài liệu)
 * ============================================
 * Bảng: document_likes
 * Mô tả: Lưu lượt thích, mỗi user chỉ like 1 lần/document (UNIQUE).
 * Quan hệ:
 *   - ManyToOne → User — ON DELETE CASCADE
 *   - ManyToOne → Document — ON DELETE CASCADE
 */

import { EntitySchema } from "typeorm";

export const DocumentLike = new EntitySchema({
    name: "DocumentLike",
    tableName: "document_likes",
    columns: {
        id: { type: "int", primary: true, generated: true },
        // === Khai báo tường minh FK columns để UNIQUE constraint nhận diện được ===
        user_id: { type: "int", nullable: false },
        document_id: { type: "int", nullable: false },
        created_at: { type: "timestamp", default: () => "CURRENT_TIMESTAMP" },
    },
    relations: {
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "user_id" },
            inverseSide: "likes",
            nullable: false,
            onDelete: "CASCADE",
        },
        document: {
            type: "many-to-one",
            target: "Document",
            joinColumn: { name: "document_id" },
            inverseSide: "likes",
            nullable: false,
            onDelete: "CASCADE",
        },
    },
    // === Ràng buộc UNIQUE: 1 user chỉ like 1 document 1 lần ===
    uniques: [{ columns: ["user_id", "document_id"] }],
});
