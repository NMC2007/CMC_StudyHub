/**
 * ============================================
 * GROUP SERVICE - Tầng xử lý nghiệp vụ Nhóm học tập
 * ============================================
 */

import path from "path";
import { cleanupFile, validateStudentUploadContext } from "#utils/uploadGuard.js";
import { UPLOAD_CONFIG } from "#config/constants.js";
import { AppDataSource } from "#config/db.js";
import {
    saveGroup,
    findGroupById,
    deleteGroupById,
    addGroupMemberRepo,
    addGroupMembersBatchRepo,
    removeGroupMemberRepo,
    findGroupsByUserIdRepo,
    findAllGroupsRepo,
    isUserInGroupRepo,
    shareDocumentToGroupRepo,
    removeDocumentFromGroupRepo,
    findGroupDocumentsRepo,
} from "#repository/groupRepository.js";
import { findDocumentById, saveDocument } from "#repository/documentRepository.js";
import { toGroupResponse, toGroupListResponse } from "#models/dto/response/GroupResponseDTO.js";
import { toDocumentResponse, toDocumentListResponse } from "#models/dto/response/DocumentResponseDTO.js";
import {
    validateCreateGroupRequest,
    validateAddGroupMembersRequest,
    validateShareDocumentRequest,
} from "#models/dto/request/GroupRequestDTO.js";

/**
 * Tạo một nhóm học tập mới.
 * @param {Object} user - User hiện tại từ JWT
 * @param {Object} body
 * @returns {Promise<Object>}
 */
export const createGroupService = async (user, body) => {
    const validation = validateCreateGroupRequest(body);
    if (!validation.isValid) {
        return {
            statusCode: 400,
            message: "Dữ liệu tạo nhóm không hợp lệ.",
            data: null,
            errors: validation.errors,
        };
    }

    const savedGroup = await saveGroup({
        name: body.name.trim(),
        description: body.description ? String(body.description).trim() : null,
        owner: { id: user.id },
    });

    // Tự động thêm Owner làm thành viên đầu tiên trong bảng group_members
    await addGroupMemberRepo(savedGroup.id, user.id);

    const fullGroup = await findGroupById(savedGroup.id);

    return {
        statusCode: 201,
        message: "Tạo nhóm học tập thành công.",
        data: toGroupResponse(fullGroup, user.id),
        errors: null,
    };
};

/**
 * Lấy danh sách nhóm học tập của user (hoặc toàn bộ nhóm nếu là Admin).
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export const getMyGroupsService = async (user) => {
    const groups = user.role === "ADMIN" 
        ? await findAllGroupsRepo(user.id)
        : await findGroupsByUserIdRepo(user.id);

    return {
        statusCode: 200,
        message: "Lấy danh sách nhóm học tập thành công.",
        data: toGroupListResponse(groups, user.id),
        errors: null,
    };
};

/**
 * Lấy thông tin chi tiết nhóm học tập.
 * @param {number} groupId
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export const getGroupDetailService = async (groupId, user) => {
    const group = await findGroupById(groupId);
    if (!group) {
        return {
            statusCode: 404,
            message: "Không tìm thấy nhóm học tập.",
            data: null,
            errors: ["Nhóm học tập không tồn tại hoặc đã bị giải tán."],
        };
    }

    const isInGroup = await isUserInGroupRepo(groupId, user.id);
    if (!isInGroup && user.role !== "ADMIN") {
        return {
            statusCode: 403,
            message: "Không có quyền truy cập.",
            data: null,
            errors: ["Bạn không phải là thành viên của nhóm học tập này."],
        };
    }

    return {
        statusCode: 200,
        message: "Lấy thông tin chi tiết nhóm thành công.",
        data: toGroupResponse(group, user.id),
        errors: null,
    };
};

/**
 * Thêm nhiều thành viên vào nhóm (Chỉ Owner).
 * @param {number} groupId
 * @param {Object} user
 * @param {Object} body
 * @returns {Promise<Object>}
 */
export const addGroupMembersService = async (groupId, user, body) => {
    const validation = validateAddGroupMembersRequest(body);
    if (!validation.isValid) {
        return {
            statusCode: 400,
            message: "Dữ liệu thêm thành viên không hợp lệ.",
            data: null,
            errors: validation.errors,
        };
    }

    const group = await findGroupById(groupId);
    if (!group) {
        return {
            statusCode: 404,
            message: "Không tìm thấy nhóm học tập.",
            data: null,
            errors: ["Nhóm học tập không tồn tại."],
        };
    }

    if (group.owner?.id !== user.id && user.role !== "ADMIN") {
        return {
            statusCode: 403,
            message: "Không có quyền thực hiện.",
            data: null,
            errors: ["Chỉ chủ sở hữu nhóm mới có quyền thêm thành viên."],
        };
    }

    const userIds = body.user_ids.map((id) => Number(id));
    await addGroupMembersBatchRepo(groupId, userIds);

    const updatedGroup = await findGroupById(groupId);

    return {
        statusCode: 200,
        message: "Thêm thành viên vào nhóm thành công.",
        data: toGroupResponse(updatedGroup, user.id),
        errors: null,
    };
};

/**
 * Xóa một thành viên ra khỏi nhóm (Chỉ Owner).
 * @param {number} groupId
 * @param {number} userIdToRemove
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export const removeGroupMemberService = async (groupId, userIdToRemove, user) => {
    const group = await findGroupById(groupId);
    if (!group) {
        return {
            statusCode: 404,
            message: "Không tìm thấy nhóm học tập.",
            data: null,
            errors: ["Nhóm học tập không tồn tại."],
        };
    }

    if (group.owner?.id !== user.id && user.role !== "ADMIN") {
        return {
            statusCode: 403,
            message: "Không có quyền thực hiện.",
            data: null,
            errors: ["Chỉ chủ sở hữu nhóm mới có quyền xóa thành viên."],
        };
    }

    if (Number(userIdToRemove) === group.owner?.id) {
        return {
            statusCode: 400,
            message: "Thao tác không hợp lệ.",
            data: null,
            errors: ["Chủ sở hữu không thể tự xóa mình khỏi nhóm. Hãy sử dụng chức năng giải tán nhóm."],
        };
    }

    await removeGroupMemberRepo(groupId, Number(userIdToRemove));

    const updatedGroup = await findGroupById(groupId);

    return {
        statusCode: 200,
        message: "Xóa thành viên ra khỏi nhóm thành công.",
        data: toGroupResponse(updatedGroup, user.id),
        errors: null,
    };
};

/**
 * Giải tán nhóm học tập (Chỉ Owner hoặc Admin).
 * @param {number} groupId
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export const disbandGroupService = async (groupId, user) => {
    const group = await findGroupById(groupId);
    if (!group) {
        return {
            statusCode: 404,
            message: "Không tìm thấy nhóm học tập.",
            data: null,
            errors: ["Nhóm học tập không tồn tại hoặc đã bị xóa."],
        };
    }

    if (group.owner?.id !== user.id && user.role !== "ADMIN") {
        return {
            statusCode: 403,
            message: "Không có quyền thực hiện.",
            data: null,
            errors: ["Chỉ chủ sở hữu hoặc quản trị viên mới có quyền giải tán nhóm."],
        };
    }

    // Nghiệp vụ dọn dẹp: Khi giải tán nhóm, toàn bộ tài liệu nội bộ trong group đó (visibility = 'GROUP') bị xóa mềm
    // Trừ tài liệu PUBLIC/PRIVATE được chia sẻ từ bên ngoài vào thì giữ nguyên
    // Tối ưu: Batch UPDATE thay vì lặp N+1 query
    await AppDataSource.getRepository("Document")
        .createQueryBuilder()
        .update()
        .set({ is_deleted: true, deleted_at: new Date(), updated_at: new Date() })
        .where("id IN (SELECT gd.document_id FROM group_documents gd WHERE gd.group_id = :groupId)", { groupId })
        .andWhere("visibility = :vis", { vis: "GROUP" })
        .andWhere("is_deleted = :isDeleted", { isDeleted: false })
        .execute();

    await deleteGroupById(groupId);

    return {
        statusCode: 200,
        message: "Giải tán nhóm học tập thành công.",
        data: null,
        errors: null,
    };
};

/**
 * Chia sẻ tài liệu vào nhóm.
 * @param {number} groupId
 * @param {Object} body
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export const shareDocumentToGroupService = async (groupId, body, user) => {
    const validation = validateShareDocumentRequest(body);
    if (!validation.isValid) {
        return {
            statusCode: 400,
            message: "Dữ liệu chia sẻ tài liệu không hợp lệ.",
            data: null,
            errors: validation.errors,
        };
    }

    const group = await findGroupById(groupId);
    if (!group) {
        return {
            statusCode: 404,
            message: "Không tìm thấy nhóm học tập.",
            data: null,
            errors: ["Nhóm học tập không tồn tại."],
        };
    }

    const isInGroup = await isUserInGroupRepo(groupId, user.id);
    if (!isInGroup && user.role !== "ADMIN") {
        return {
            statusCode: 403,
            message: "Không có quyền chia sẻ.",
            data: null,
            errors: ["Chỉ thành viên của nhóm mới được phép chia sẻ tài liệu vào nhóm này."],
        };
    }

    const doc = await findDocumentById(Number(body.document_id));
    if (!doc) {
        return {
            statusCode: 404,
            message: "Không tìm thấy tài liệu.",
            data: null,
            errors: ["Tài liệu không tồn tại hoặc đã bị xóa."],
        };
    }

    await shareDocumentToGroupRepo(groupId, doc.id, user.id);

    return {
        statusCode: 200,
        message: "Chia sẻ tài liệu vào nhóm thành công.",
        data: { group_id: groupId, document_id: doc.id, shared_by: user.id },
        errors: null,
    };
};

/**
 * Gỡ tài liệu khỏi nhóm.
 * @param {number} groupId
 * @param {number} documentId
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export const removeDocumentFromGroupService = async (groupId, documentId, user) => {
    const group = await findGroupById(groupId);
    if (!group) {
        return {
            statusCode: 404,
            message: "Không tìm thấy nhóm học tập.",
            data: null,
            errors: ["Nhóm học tập không tồn tại."],
        };
    }

    if (group.owner?.id !== user.id && user.role !== "ADMIN") {
        return {
            statusCode: 403,
            message: "Không có quyền thực hiện.",
            data: null,
            errors: ["Chỉ chủ sở hữu nhóm hoặc quản trị viên mới được gỡ tài liệu khỏi nhóm."],
        };
    }

    await removeDocumentFromGroupRepo(groupId, Number(documentId));

    return {
        statusCode: 200,
        message: "Gỡ tài liệu khỏi nhóm thành công.",
        data: null,
        errors: null,
    };
};

/**
 * Lấy danh sách tài liệu chia sẻ trong nhóm.
 * @param {number} groupId
 * @param {Object} queryParams
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export const getGroupDocumentsService = async (groupId, queryParams, user) => {
    const group = await findGroupById(groupId);
    if (!group) {
        return {
            statusCode: 404,
            message: "Không tìm thấy nhóm học tập.",
            data: null,
            errors: ["Nhóm học tập không tồn tại."],
        };
    }

    const isInGroup = await isUserInGroupRepo(groupId, user.id);
    if (!isInGroup && user.role !== "ADMIN") {
        return {
            statusCode: 403,
            message: "Không có quyền truy cập.",
            data: null,
            errors: ["Chỉ thành viên của nhóm mới được xem danh sách tài liệu trong nhóm này."],
        };
    }

    const result = await findGroupDocumentsRepo(groupId, queryParams);

    return {
        statusCode: 200,
        message: "Lấy danh sách tài liệu nhóm thành công.",
        data: {
            documents: toDocumentListResponse(result.documents, user.id),
            pagination: {
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
            },
        },
        errors: null,
    };
};

/**
 * Upload tài liệu mới trực tiếp vào nhóm học tập (Visibility mặc định là GROUP).
 * @param {number} groupId
 * @param {Object} user
 * @param {Object} file - File từ Multer
 * @param {Object} body - { title, description, subject_id, document_type, cohort_id, faculty_id, major_id }
 */
export const uploadGroupDocumentService = async (groupId, user, file, body) => {
    if (!file) {
        return {
            statusCode: 400,
            message: UPLOAD_CONFIG.DOC.ERROR_MESSAGE,
            data: null,
            errors: ["Missing Document File"],
        };
    }

    const group = await findGroupById(groupId);
    if (!group) {
        await cleanupFile(file.path);
        return {
            statusCode: 404,
            message: "Không tìm thấy nhóm học tập.",
            data: null,
            errors: ["Nhóm học tập không tồn tại."],
        };
    }

    const isInGroup = await isUserInGroupRepo(groupId, user.id);
    if (!isInGroup && user.role !== "ADMIN") {
        await cleanupFile(file.path);
        return {
            statusCode: 403,
            message: "Bạn không phải là thành viên của nhóm học tập này nên không thể tải tài liệu lên.",
            data: null,
            errors: ["Permission Denied — Not Group Member"],
        };
    }

    if (!body?.title || !String(body.title).trim()) {
        await cleanupFile(file.path);
        return {
            statusCode: 400,
            message: "Tiêu đề tài liệu (title) là bắt buộc.",
            data: null,
            errors: ["Missing Title"],
        };
    }

    if (!body?.subject_id || !Number.isInteger(Number(body.subject_id))) {
        await cleanupFile(file.path);
        return {
            statusCode: 400,
            message: "Mã môn học (subject_id) hợp lệ là bắt buộc.",
            data: null,
            errors: ["Missing or Invalid Subject ID"],
        };
    }

    // UPLOAD GUARD & Kiểm tra Môn học cho STUDENT
    const guardResult = await validateStudentUploadContext(user, body, file.path);
    if (!guardResult.isValid) {
        return guardResult.error;
    }

    let savedDocument;
    try {
        const fileExtension = path.extname(file.originalname).toLowerCase().replace(".", "");
        const docData = {
            title: String(body.title).trim(),
            description: body.description ? String(body.description).trim() : null,
            document_type: body.document_type ? String(body.document_type).trim().toUpperCase() : "DOCUMENT",
            visibility: "GROUP", // Bắt buộc gắn tag GROUP
            file_url: `/uploads/documents/${file.filename}`,
            file_size: file.size,
            file_type: fileExtension,
            owner: { id: user.id },
            subject: { id: parseInt(body.subject_id) },
            cohort: body.cohort_id ? { id: parseInt(body.cohort_id) } : null,
            faculty: body.faculty_id ? { id: parseInt(body.faculty_id) } : null,
            major: body.major_id ? { id: parseInt(body.major_id) } : null,
        };

        savedDocument = await saveDocument(docData);
        await shareDocumentToGroupRepo(groupId, savedDocument.id, user.id);
    } catch (dbError) {
        await cleanupFile(file.path);
        throw dbError;
    }

    const fullDoc = await findDocumentById(savedDocument.id);

    return {
        statusCode: 201,
        message: "Tải lên và chia sẻ tài liệu nội bộ nhóm thành công.",
        data: toDocumentResponse(fullDoc, user.id),
        errors: null,
    };
};


