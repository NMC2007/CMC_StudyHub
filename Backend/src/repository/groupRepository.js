/**
 * ============================================
 * GROUP REPOSITORY - Tầng truy vấn Database cho Nhóm học tập
 * ============================================
 * Quản lý các thao tác CRUD với bảng `groups`, `group_members`, và `group_documents`.
 */

import { AppDataSource } from "#config/db.js";

const groupRepo = AppDataSource.getRepository("Group");
const groupMemberRepo = AppDataSource.getRepository("GroupMember");
const groupDocumentRepo = AppDataSource.getRepository("GroupDocument");

/**
 * Tạo và lưu một nhóm học tập mới.
 * @param {Object} groupData - { name, description, owner: { id } }
 * @returns {Promise<Object>}
 */
export const saveGroup = async (groupData) => {
    const newGroup = groupRepo.create(groupData);
    return await groupRepo.save(newGroup);
};

/**
 * Tìm nhóm theo ID kèm thông tin chủ nhóm và danh sách thành viên.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export const findGroupById = async (id) => {
    return await groupRepo.findOne({
        where: { id },
        relations: {
            owner: true,
            members: {
                user: true,
            },
        },
    });
};

/**
 * Xóa cứng nhóm học tập (ON DELETE CASCADE tự dọn dẹp group_members & group_documents).
 * @param {number} id
 */
export const deleteGroupById = async (id) => {
    await groupRepo.delete(id);
};

/**
 * Thêm một thành viên vào nhóm.
 * @param {number} groupId
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export const addGroupMemberRepo = async (groupId, userId) => {
    const member = groupMemberRepo.create({
        group_id: groupId,
        user_id: userId,
    });
    return await groupMemberRepo.save(member);
};

/**
 * Thêm danh sách nhiều thành viên vào nhóm (kiểm tra bỏ qua thành viên đã tồn tại).
 * @param {number} groupId
 * @param {number[]} userIds
 */
export const addGroupMembersBatchRepo = async (groupId, userIds) => {
    const existingMembers = await groupMemberRepo.find({
        where: { group_id: groupId },
    });
    const existingUserIds = new Set(existingMembers.map((m) => m.user_id));

    const newMembers = [];
    for (const uid of userIds) {
        if (!existingUserIds.has(uid)) {
            newMembers.push(
                groupMemberRepo.create({
                    group_id: groupId,
                    user_id: uid,
                })
            );
        }
    }

    if (newMembers.length > 0) {
        await groupMemberRepo.save(newMembers);
    }
};

/**
 * Xóa một thành viên ra khỏi nhóm.
 * @param {number} groupId
 * @param {number} userId
 */
export const removeGroupMemberRepo = async (groupId, userId) => {
    await groupMemberRepo.delete({ group_id: groupId, user_id: userId });
};

/**
 * Lấy danh sách các nhóm mà người dùng sở hữu hoặc đang là thành viên.
 * @param {number} userId
 * @returns {Promise<Array>}
 */
export const findGroupsByUserIdRepo = async (userId) => {
    const { entities, raw } = await groupRepo
        .createQueryBuilder("group")
        .leftJoinAndSelect("group.owner", "owner")
        .leftJoin("group.members", "member")
        .addSelect("(SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = group.id)", "member_count")
        .where("owner.id = :userId OR member.user_id = :userId", { userId })
        .orderBy("group.created_at", "DESC")
        .getRawAndEntities();

    return entities.map((group) => {
        const rawRow = raw.find((r) => Number(r.group_id ?? r.id) === Number(group.id));
        const count = rawRow && rawRow.member_count ? Number(rawRow.member_count) : 0;
        return {
            ...group,
            member_count: count,
            is_member: true,
        };
    });
};

/**
 * Lấy danh sách toàn bộ nhóm trong hệ thống (Dành cho Quản trị viên).
 * @param {number} currentUserId - ID user Admin (để tính cờ is_member)
 * @returns {Promise<Array>}
 */
export const findAllGroupsRepo = async (currentUserId) => {
    const { entities, raw } = await groupRepo
        .createQueryBuilder("group")
        .leftJoinAndSelect("group.owner", "owner")
        .addSelect("(SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = group.id)", "member_count")
        .addSelect(
            `(SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = group.id AND gm.user_id = ${Number(currentUserId) || -1})`,
            "is_my_member"
        )
        .orderBy("group.created_at", "DESC")
        .getRawAndEntities();

    return entities.map((group) => {
        const rawRow = raw.find((r) => Number(r.group_id ?? r.id) === Number(group.id));
        const count = rawRow && rawRow.member_count ? Number(rawRow.member_count) : 0;
        const isMyMember = rawRow && Number(rawRow.is_my_member) > 0;
        const isOwner = group.owner?.id === currentUserId;
        return {
            ...group,
            member_count: count,
            is_member: isOwner || isMyMember,
        };
    });
};

/**
 * Kiểm tra người dùng có phải là thành viên hoặc chủ nhóm hay không.
 * @param {number} groupId
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export const isUserInGroupRepo = async (groupId, userId) => {
    const group = await groupRepo.findOne({
        where: { id: groupId },
        relations: {
            owner: true,
        },
    });
    if (!group) return false;
    if (group.owner && group.owner.id === userId) return true;

    const count = await groupMemberRepo.count({
        where: { group_id: groupId, user_id: userId },
    });
    return count > 0;
};

/**
 * Thêm tài liệu chia sẻ vào nhóm.
 * @param {number} groupId
 * @param {number} documentId
 * @param {number} sharedById
 */
export const shareDocumentToGroupRepo = async (groupId, documentId, sharedById) => {
    const existing = await groupDocumentRepo.findOne({
        where: { group_id: groupId, document_id: documentId },
    });
    if (!existing) {
        const gd = groupDocumentRepo.create({
            group_id: groupId,
            document_id: documentId,
            shared_by_id: sharedById,
        });
        await groupDocumentRepo.save(gd);
    }
};

/**
 * Gỡ tài liệu chia sẻ khỏi nhóm.
 * @param {number} groupId
 * @param {number} documentId
 */
export const removeDocumentFromGroupRepo = async (groupId, documentId) => {
    await groupDocumentRepo.delete({ group_id: groupId, document_id: documentId });
};

/**
 * Lấy danh sách tài liệu chia sẻ trong một nhóm (phân trang).
 * @param {number} groupId
 * @param {Object} queryParams
 * @returns {Promise<{ documents: Array, total: number, page: number, totalPages: number }>}
 */
export const findGroupDocumentsRepo = async (groupId, queryParams) => {
    const page = Math.max(1, parseInt(queryParams?.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(queryParams?.limit) || 10));
    const skip = (page - 1) * limit;

    const query = groupDocumentRepo
        .createQueryBuilder("gd")
        .leftJoinAndSelect("gd.document", "doc")
        .leftJoinAndSelect("doc.owner", "owner")
        .leftJoinAndSelect("doc.subject", "subject")
        .leftJoinAndSelect("doc.cohort", "cohort")
        .leftJoinAndSelect("doc.faculty", "faculty")
        .leftJoinAndSelect("doc.major", "major")
        .leftJoinAndSelect("gd.sharedBy", "sharedBy")
        .where("gd.group_id = :groupId", { groupId })
        .andWhere("doc.is_deleted = :isDeleted", { isDeleted: false });

    if (queryParams?.q) {
        query.andWhere(
            "(unaccent(doc.title) ILIKE unaccent(:keyword) OR unaccent(doc.description) ILIKE unaccent(:keyword))",
            { keyword: `%${queryParams.q}%` }
        );
    }

    query.orderBy("gd.shared_at", "DESC").skip(skip).take(limit);

    const [results, total] = await query.getManyAndCount();
    const documents = results.map((gd) => ({
        ...gd.document,
        shared_at: gd.shared_at,
        shared_by: gd.sharedBy,
    }));

    return {
        documents,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
    };
};
