/**
 * ============================================
 * ENTITY: GroupDocument (Tài liệu chia sẻ trong nhóm)
 * ============================================
 * Bảng: group_documents
 * Mô tả: Bảng trung gian N-N giữa Group và Document.
 *         Khóa chính tổ hợp: (group_id, document_id).
 * Quan hệ:
 *   - ManyToOne → Group — ON DELETE CASCADE
 *   - ManyToOne → Document — ON DELETE CASCADE
 *   - ManyToOne → User (người chia sẻ) — ON DELETE CASCADE
 */

import { EntitySchema } from "typeorm";

export const GroupDocument = new EntitySchema({
    name: "GroupDocument",
    tableName: "group_documents",
    columns: {
        group_id: {
            type: "int",
            primary: true,
        },
        document_id: {
            type: "int",
            primary: true,
        },
        shared_by_id: {
            type: "int",
            nullable: false,
        },
        shared_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        group: {
            type: "many-to-one",
            target: "Group",
            joinColumn: { name: "group_id" },
            inverseSide: "sharedDocuments",
            onDelete: "CASCADE",
        },
        document: {
            type: "many-to-one",
            target: "Document",
            joinColumn: { name: "document_id" },
            inverseSide: "groupShares",
            onDelete: "CASCADE",
        },
        sharedBy: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "shared_by_id" },
            onDelete: "CASCADE",
        },
    },
});
