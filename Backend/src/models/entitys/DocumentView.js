/**
 * ============================================
 * ENTITY: DocumentView (Lượt xem tài liệu)
 * ============================================
 * Bảng: document_views
 * Mô tả: Ghi lại lượt xem tài liệu. Không có UNIQUE → 1 user có thể xem nhiều lần.
 * Quan hệ:
 *   - ManyToOne → User — ON DELETE CASCADE
 *   - ManyToOne → Document — ON DELETE CASCADE
 */

import { EntitySchema } from "typeorm";

export const DocumentView = new EntitySchema({
    name: "DocumentView",
    tableName: "document_views",
    columns: {
        id: { type: "int", primary: true, generated: true },
        user_id: { type: "int", nullable: false },
        document_id: { type: "int", nullable: false },
        // === Thời gian xem (thay vì created_at, dùng viewed_at theo schema gốc) ===
        viewed_at: { type: "timestamp", default: () => "CURRENT_TIMESTAMP" },
    },
    relations: {
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "user_id" },
            inverseSide: "views",
            nullable: false,
            onDelete: "CASCADE",
        },
        document: {
            type: "many-to-one",
            target: "Document",
            joinColumn: { name: "document_id" },
            inverseSide: "views",
            nullable: false,
            onDelete: "CASCADE",
        },
    },
});
