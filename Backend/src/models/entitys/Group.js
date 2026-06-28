/**
 * ============================================
 * ENTITY: Group (Nhóm học tập)
 * ============================================
 * Bảng: groups
 * Mô tả: Nhóm học tập nội bộ, dùng chia sẻ tài liệu (không chat).
 * Quan hệ:
 *   - ManyToOne → User/owner — ON DELETE CASCADE
 *   - OneToMany → GroupMember
 */

import { EntitySchema } from "typeorm";

export const Group = new EntitySchema({
    name: "Group",
    tableName: "groups",
    columns: {
        id: { type: "int", primary: true, generated: true },
        // === Tên nhóm ===
        name: { type: "varchar", length: 150, nullable: false },
        // === Mô tả nhóm (tuỳ chọn) ===
        description: { type: "text", nullable: true },
        // === Thời gian tạo nhóm ===
        created_at: { type: "timestamp", default: () => "CURRENT_TIMESTAMP" },
    },
    relations: {
        // === Người tạo nhóm (FK → users.id) ===
        owner: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "owner_id" },
            inverseSide: "ownedGroups",
            nullable: false,
            onDelete: "CASCADE",
        },
        // === Thành viên nhóm ===
        members: {
            type: "one-to-many",
            target: "GroupMember",
            inverseSide: "group",
        },
    },
});
