/**
 * ============================================
 * ENTITY: GroupMember (Thành viên nhóm)
 * ============================================
 * Bảng: group_members
 * Mô tả: Bảng trung gian N-N giữa Group và User.
 *         Khóa chính tổ hợp: (group_id, user_id).
 * Quan hệ:
 *   - ManyToOne → Group — ON DELETE CASCADE
 *   - ManyToOne → User — ON DELETE CASCADE
 */

import { EntitySchema } from "typeorm";

export const GroupMember = new EntitySchema({
    name: "GroupMember",
    tableName: "group_members",
    columns: {
        group_id: {
            type: "int",
            primary: true,
        },
        user_id: {
            type: "int",
            primary: true,
        },
        joined_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },
    relations: {
        group: {
            type: "many-to-one",
            target: "Group",
            joinColumn: { name: "group_id" },
            inverseSide: "members",
            onDelete: "CASCADE",
        },
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: { name: "user_id" },
            inverseSide: "groupMemberships",
            onDelete: "CASCADE",
        },
    },
});
