/**
 * ============================================
 * GROUP RESPONSE DTO - Chuẩn hóa dữ liệu trả về của Nhóm học tập
 * ============================================
 */

import { toUserResponse } from "#models/dto/response/UserResponseDTO.js";

/**
 * Map Group entity sang object response chuẩn.
 * @param {Object} entity
 * @param {number|null} currentUserId
 * @returns {Object|null}
 */
export const toGroupResponse = (entity, currentUserId = null) => {
    if (!entity) return null;

    const isOwner = currentUserId ? entity.owner?.id === currentUserId : false;

    let members = [];
    let isMember = isOwner;

    if (Array.isArray(entity.members)) {
        members = entity.members
            .map((m) => (m.user ? toUserResponse(m.user) : null))
            .filter(Boolean);
        if (currentUserId && !isMember) {
            isMember = entity.members.some((m) => m.user_id === currentUserId || m.user?.id === currentUserId);
        }
    } else if (typeof entity.is_member === "boolean") {
        isMember = entity.is_member;
    }

    let memberCount = 0;
    if (typeof entity.member_count === "number") {
        memberCount = entity.member_count;
    } else if (entity.member_count !== undefined && entity.member_count !== null) {
        memberCount = Number(entity.member_count);
    } else if (Array.isArray(entity.members)) {
        memberCount = entity.members.length;
    }

    return {
        id: entity.id,
        name: entity.name,
        description: entity.description || null,
        created_at: entity.created_at,
        is_owner: isOwner,
        is_member: isMember,
        owner: entity.owner
            ? {
                id: entity.owner.id,
                full_name: entity.owner.full_name,
                username: entity.owner.username,
                avatar: entity.owner.avatar || null,
                role: entity.owner.role,
            }
            : null,
        member_count: memberCount,
        members: members.length > 0 ? members : undefined,
    };
};

/**
 * Map danh sách Group entities sang mảng response.
 * @param {Array} entities
 * @param {number|null} currentUserId
 * @returns {Array}
 */
export const toGroupListResponse = (entities, currentUserId = null) => {
    if (!Array.isArray(entities)) return [];
    return entities.map((e) => toGroupResponse(e, currentUserId));
};
