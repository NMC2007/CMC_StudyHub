/**
 * ============================================
 * DOCUMENT SERVICE - Tầng nghiệp vụ Quản lý Tài liệu
 * ============================================
 * Chứa toàn bộ logic xử lý cho:
 *   - uploadDocument: Upload tài liệu mới (kèm Upload Guard cho STUDENT)
 *   - getDocumentDetail: Lấy chi tiết tài liệu theo ID
 *   - updateDocument: Cập nhật thông tin (chỉ Owner hoặc ADMIN)
 *   - softDeleteDocument: Xóa mềm (chỉ Owner hoặc ADMIN)
 *   - restoreDocument: Khôi phục tài liệu từ thùng rác (chỉ Owner hoặc ADMIN)
 *   - searchDocuments: Tìm kiếm & lọc nâng cao
 *
 * Quy tắc Upload Guard (đặc tả cốt lõi):
 *   - STUDENT: cohort_id, faculty_id, major_id gửi lên PHẢI trùng khớp 100%
 *     với req.user (thông tin học thuật cá nhân). Lệch → 403 Forbidden.
 *   - LECTURER / ADMIN: Được phép upload vào bất kỳ Khóa/Khoa/Ngành.
 */

import path from "path";
import { cleanupFile, validateStudentUploadContext } from "#utils/uploadGuard.js";
import { AppDataSource } from "#config/db.js";
import {
    saveDocument,
    findDocumentById,
    updateDocumentById,
    searchDocumentsRepo,
    findTrashDocumentsRepo,
} from "#repository/documentRepository.js";
import {
    recordView,
    findLike,
    addLike,
    removeLike,
    findBookmark,
    addBookmark,
    removeBookmark,
} from "#repository/interactionRepository.js";
import { validateUploadDocumentRequest, validateUpdateDocumentRequest } from "#models/dto/request/UploadDocumentRequestDTO.js";
import { toDocumentResponse, toDocumentListResponse } from "#models/dto/response/DocumentResponseDTO.js";

// ==========================================
// 1. UPLOAD TÀI LIỆU MỚI
// ==========================================

/**
 * Xử lý nghiệp vụ upload tài liệu.
 * Luồng: Validate DTO → Upload Guard → Kiểm tra Subject tồn tại → Lưu DB → Trả DocumentResponse
 *
 * @param {Object} user - Thông tin user từ req.user (JWT payload)
 * @param {Object} file - File tài liệu từ Multer req.file
 * @param {Object} body - Request body { title, description, subject_id, cohort_id, faculty_id, major_id, document_type, visibility }
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const uploadDocument = async (user, file, body) => {
    // Bước 1: Kiểm tra file có tồn tại không
    if (!file) {
        return {
            statusCode: 400,
            message: "Vui lòng chọn file tài liệu hợp lệ (.pdf, .docx, .pptx, .zip, tối đa 50MB).",
            data: null,
            errors: ["Missing Document File"],
        };
    }

    // Bước 2: Validate DTO (title, subject_id bắt buộc; document_type, visibility nếu có phải hợp lệ)
    const validation = validateUploadDocumentRequest(body);
    if (!validation.isValid) {
        // Dọn dẹp file đã upload nếu validate thất bại
        await cleanupFile(file.path);
        return {
            statusCode: 400,
            message: "Dữ liệu upload không hợp lệ.",
            data: null,
            errors: validation.errors,
        };
    }

    // Bước 3 & 4: UPLOAD GUARD — Kiểm tra quyền nghiệp vụ cho STUDENT và xác minh môn học
    const guardResult = await validateStudentUploadContext(user, body, file.path);
    if (!guardResult.isValid) {
        return guardResult.error;
    }

    // Bước 5: Chuẩn bị dữ liệu tài liệu và lưu vào DB
    // Phòng thủ: nếu lưu DB thất bại, tự động xóa file vật lý
    let savedDocument;
    try {
        const fileExtension = path.extname(file.originalname).toLowerCase().replace(".", "");
        const docData = {
            title: String(body.title).trim(),
            description: body.description ? String(body.description).trim() : null,
            document_type: body.document_type ? String(body.document_type).trim().toUpperCase() : null,
            visibility: body.visibility ? String(body.visibility).trim().toUpperCase() : "PUBLIC",
            file_url: `/uploads/documents/${file.filename}`,
            file_size: file.size,
            file_type: fileExtension,
            // Gán Foreign Key theo ID
            owner: { id: user.id },
            subject: { id: parseInt(body.subject_id) },
            cohort: body.cohort_id ? { id: parseInt(body.cohort_id) } : null,
            faculty: body.faculty_id ? { id: parseInt(body.faculty_id) } : null,
            major: body.major_id ? { id: parseInt(body.major_id) } : null,
        };

        savedDocument = await saveDocument(docData);
    } catch (dbError) {
        // Rollback: Xóa file vật lý nếu lưu DB thất bại
        await cleanupFile(file.path);
        throw dbError;
    }

    // Bước 6: Load lại document đầy đủ relations để trả response
    const fullDocument = await findDocumentById(savedDocument.id);

    return {
        statusCode: 201,
        message: "Upload tài liệu thành công!",
        data: toDocumentResponse(fullDocument, user.id),
        errors: null,
    };
};

// ==========================================
// 2. LẤY CHI TIẾT TÀI LIỆU THEO ID
// ==========================================

/**
 * Lấy chi tiết tài liệu và tự động ghi nhận lượt xem.
 * @param {number} documentId
 * @param {Object|null} user - Thông tin user từ req.user (có thể null nếu chưa đăng nhập)
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const getDocumentDetail = async (documentId, user) => {
    const document = await findDocumentById(documentId, true, user);
    if (!document) {
        return {
            statusCode: 404,
            message: "Tài liệu không tồn tại hoặc đã bị xóa.",
            data: null,
            errors: ["Document Not Found"],
        };
    }

    // Nếu tài liệu đã xóa mềm: chỉ riêng Chủ sở hữu (owner) mới được xem chi tiết.
    // Nếu không phải owner (kể cả Admin hay user khác), lập tức trả về 404 để ẩn sự tồn tại.
    if (document.is_deleted) {
        if (!user || user.id !== document.owner?.id) {
            return {
                statusCode: 404,
                message: "Tài liệu không tồn tại hoặc đã bị xóa.",
                data: null,
                errors: ["Document Not Found"],
            };
        }
    }

    // === Bảo vệ quyền riêng tư theo Visibility (Security Guard) ===
    const visibilityError = await checkDocumentVisibilityAccess(document, user);
    if (visibilityError) return visibilityError;

    // Ghi nhận lượt xem (chỉ khi user đã đăng nhập)
    if (user && user.id) {
        try {
            await recordView(user.id, documentId);
            // Re-fetch để đồng bộ số lượt xem mới nhất từ DB
            const updatedDoc = await findDocumentById(documentId, document.is_deleted, user);
            if (updatedDoc) {
                document.view_count = updatedDoc.view_count;
            }
        } catch (viewError) {
            // Lỗi ghi view không được phép ảnh hưởng đến việc trả về tài liệu
            console.warn(`⚠️ Không thể ghi nhận lượt xem cho document ${documentId}:`, viewError.message);
        }
    }

    return {
        statusCode: 200,
        message: "Lấy chi tiết tài liệu thành công.",
        data: toDocumentResponse(document, user?.id || null),
        errors: null,
    };
};

// ==========================================
// 3. CẬP NHẬT TÀI LIỆU
// ==========================================

/**
 * Cập nhật thông tin tài liệu (title, description, visibility, document_type).
 * Chỉ Owner hoặc ADMIN được phép.
 * @param {number} documentId
 * @param {Object} user - Thông tin user từ req.user
 * @param {Object} body - Dữ liệu cập nhật
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const updateDocument = async (documentId, user, body) => {
    // Bước 1: Validate DTO
    const validation = validateUpdateDocumentRequest(body);
    if (!validation.isValid) {
        return {
            statusCode: 400,
            message: "Dữ liệu cập nhật không hợp lệ.",
            data: null,
            errors: validation.errors,
        };
    }

    // Bước 2: Tìm tài liệu (bao gồm cả đã xóa mềm để owner có thể sửa trước khi restore)
    const document = await findDocumentById(documentId, true);
    if (!document) {
        return {
            statusCode: 404,
            message: "Tài liệu không tồn tại.",
            data: null,
            errors: ["Document Not Found"],
        };
    }

    // Bước 3: Kiểm tra quyền — Chỉ Owner hoặc ADMIN
    if (document.owner.id !== user.id && user.role !== "ADMIN") {
        return {
            statusCode: 403,
            message: "Bạn không có quyền chỉnh sửa tài liệu này. Chỉ chủ sở hữu hoặc Admin mới được phép.",
            data: null,
            errors: ["Permission Denied — Not Owner or Admin"],
        };
    }

    // Bước 4: Chuẩn bị dữ liệu cập nhật (chỉ lấy các trường được gửi lên)
    const updateData = {};
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.description !== undefined) updateData.description = body.description ? String(body.description).trim() : null;
    if (body.visibility !== undefined) updateData.visibility = String(body.visibility).trim().toUpperCase();
    if (body.document_type !== undefined) updateData.document_type = body.document_type ? String(body.document_type).trim().toUpperCase() : null;

    // Bước 5: Cập nhật vào DB
    const updatedDocument = await updateDocumentById(documentId, updateData);

    return {
        statusCode: 200,
        message: "Cập nhật tài liệu thành công!",
        data: toDocumentResponse(updatedDocument, user.id),
        errors: null,
    };
};

// ==========================================
// 4. XÓA MỀM TÀI LIỆU (SOFT DELETE)
// ==========================================

/**
 * Xóa mềm tài liệu: gán is_deleted = true, deleted_at = NOW().
 * Chỉ Owner hoặc ADMIN được phép.
 * @param {number} documentId
 * @param {Object} user
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const softDeleteDocument = async (documentId, user) => {
    // Bước 1: Tìm tài liệu (chỉ tài liệu chưa xóa)
    const document = await findDocumentById(documentId, false);
    if (!document) {
        return {
            statusCode: 404,
            message: "Tài liệu không tồn tại hoặc đã nằm trong thùng rác.",
            data: null,
            errors: ["Document Not Found or Already Deleted"],
        };
    }

    // Bước 2: Kiểm tra quyền — Chỉ Owner hoặc ADMIN
    if (document.owner.id !== user.id && user.role !== "ADMIN") {
        return {
            statusCode: 403,
            message: "Bạn không có quyền xóa tài liệu này. Chỉ chủ sở hữu hoặc Admin mới được phép.",
            data: null,
            errors: ["Permission Denied — Not Owner or Admin"],
        };
    }

    // Bước 3: Gán cờ xóa mềm
    const updatedDocument = await updateDocumentById(documentId, {
        is_deleted: true,
        deleted_at: new Date(),
    });

    return {
        statusCode: 200,
        message: "Tài liệu đã được chuyển vào thùng rác. Bạn có thể khôi phục trong vòng 15 ngày.",
        data: toDocumentResponse(updatedDocument, user.id),
        errors: null,
    };
};

// ==========================================
// 5. KHÔI PHỤC TÀI LIỆU (RESTORE)
// ==========================================

/**
 * Khôi phục tài liệu từ thùng rác: gán is_deleted = false, deleted_at = null.
 * Chỉ Owner hoặc ADMIN được phép.
 * @param {number} documentId
 * @param {Object} user
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const restoreDocument = async (documentId, user) => {
    // Bước 1: Tìm tài liệu (bao gồm đã xóa mềm)
    const document = await findDocumentById(documentId, true);
    if (!document) {
        return {
            statusCode: 404,
            message: "Tài liệu không tồn tại.",
            data: null,
            errors: ["Document Not Found"],
        };
    }

    // Bước 2: Kiểm tra xem tài liệu có thực sự nằm trong thùng rác không
    if (!document.is_deleted) {
        return {
            statusCode: 400,
            message: "Tài liệu này không nằm trong thùng rác, không cần khôi phục.",
            data: null,
            errors: ["Document Is Not Deleted"],
        };
    }

    // Bước 3: Kiểm tra quyền — Chỉ Owner hoặc ADMIN
    if (document.owner.id !== user.id && user.role !== "ADMIN") {
        return {
            statusCode: 403,
            message: "Bạn không có quyền khôi phục tài liệu này. Chỉ chủ sở hữu hoặc Admin mới được phép.",
            data: null,
            errors: ["Permission Denied — Not Owner or Admin"],
        };
    }

    // Bước 4: Gán lại cờ khôi phục
    const updatedDocument = await updateDocumentById(documentId, {
        is_deleted: false,
        deleted_at: null,
    });

    return {
        statusCode: 200,
        message: "Tài liệu đã được khôi phục thành công!",
        data: toDocumentResponse(updatedDocument, user.id),
        errors: null,
    };
};

/**
 * Lấy danh sách tài liệu trong thùng rác của user hiện tại.
 * @param {Object} queryParams
 * @param {Object} user
 */
export const getTrashDocuments = async (queryParams, user) => {
    const { documents, total, page, totalPages } = await findTrashDocumentsRepo(queryParams, user);

    const data = documents.map((doc) => toDocumentResponse(doc, user?.id || null));

    return {
        statusCode: 200,
        message: "Lấy danh sách tài liệu trong thùng rác thành công.",
        data: {
            documents: data,
            pagination: {
                total,
                page,
                limit: Math.max(1, Math.min(100, parseInt(queryParams.limit) || 10)),
                total_pages: totalPages,
            },
        },
        errors: null,
    };
};

// ==========================================
// 6. TÌM KIẾM & LỌC NÂNG CAO
// ==========================================

/**
 * Tìm kiếm tài liệu với bộ lọc đa điều kiện và phân trang.
 * @param {Object} queryParams - { q, uploader, role, cohort_id, faculty_id, major_id, subject_id, type, visibility, page, limit }
 * @param {number|null} currentUserId - ID của user đang đăng nhập
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const searchDocuments = async (queryParams, user = null) => {
    const currentUserId = user?.id || (typeof user === "number" ? user : null);
    const userObj = typeof user === "object" ? user : null;
    const result = await searchDocumentsRepo(queryParams, userObj);

    return {
        statusCode: 200,
        message: `Tìm thấy ${result.total} tài liệu.`,
        data: {
            documents: toDocumentListResponse(result.documents, currentUserId),
            pagination: {
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
            },
        },
        errors: null,
    };
};

// ==========================================
// 7. MODULE TƯƠNG TÁC TÀI LIỆU (LIKE & BOOKMARK)
// ==========================================

/**
 * Kiểm tra quyền truy cập theo Visibility (dùng chung cho xem chi tiết, like, bookmark).
 * @param {Object} document
 * @param {Object|null} user
 * @returns {Object|null} Lỗi nếu vi phạm quyền, null nếu hợp lệ
 */
const checkDocumentVisibilityAccess = async (document, user) => {
    if (document.visibility === "PRIVATE") {
        const isOwnerOrAdmin = user && (document.owner?.id === user.id || user.role === "ADMIN");
        if (!isOwnerOrAdmin) {
            return {
                statusCode: 403,
                message: "Tài liệu này là riêng tư (PRIVATE), bạn không có quyền thao tác.",
                data: null,
                errors: ["Permission Denied — Private Document"],
            };
        }
    } else if (document.visibility === "GROUP") {
        const isOwnerOrAdmin = user && (document.owner?.id === user.id || user.role === "ADMIN");
        if (!isOwnerOrAdmin) {
            const hasGroupAccess = await AppDataSource.getRepository("GroupDocument")
                .createQueryBuilder("gd")
                .leftJoin("group_members", "gm", "gd.group_id = gm.group_id")
                .leftJoin("groups", "g", "gd.group_id = g.id")
                .where("gd.document_id = :docId", { docId: document.id })
                .andWhere("(gm.user_id = :userId OR g.owner_id = :userId)", { userId: user?.id || -1 })
                .getExists();

            if (!hasGroupAccess) {
                return {
                    statusCode: 403,
                    message: "Tài liệu này lưu hành nội bộ nhóm học tập (GROUP), bạn không phải thành viên nhóm nên không có quyền truy cập.",
                    data: null,
                    errors: ["Permission Denied — Group Document"],
                };
            }
        }
    }
    return null;
};

/**
 * Thích hoặc bỏ thích tài liệu (Toggle Like).
 * @param {number} documentId
 * @param {Object} user
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const toggleLikeDocument = async (documentId, user) => {
    const document = await findDocumentById(documentId, false, user);
    if (!document) {
        return {
            statusCode: 404,
            message: "Tài liệu không tồn tại hoặc đã bị xóa.",
            data: null,
            errors: ["Document Not Found"],
        };
    }

    const visibilityError = await checkDocumentVisibilityAccess(document, user);
    if (visibilityError) return visibilityError;

    const existingLike = await findLike(user.id, documentId);
    if (existingLike) {
        await removeLike(user.id, documentId);
        await AppDataSource.getRepository("Document").decrement({ id: documentId }, "like_count", 1);
        const updatedDoc = await findDocumentById(documentId, false, user);
        const newCount = updatedDoc ? updatedDoc.like_count : 0;
        return {
            statusCode: 200,
            message: "Bỏ thích tài liệu thành công.",
            data: { is_liked: false, like_count: newCount },
            errors: null,
        };
    } else {
        await addLike(user.id, documentId);
        await AppDataSource.getRepository("Document").increment({ id: documentId }, "like_count", 1);
        const updatedDoc = await findDocumentById(documentId, false, user);
        const newCount = updatedDoc ? updatedDoc.like_count : 1;
        return {
            statusCode: 200,
            message: "Thích tài liệu thành công.",
            data: { is_liked: true, like_count: newCount },
            errors: null,
        };
    }
};

/**
 * Đánh dấu hoặc gỡ đánh dấu tài liệu (Toggle Bookmark).
 * @param {number} documentId
 * @param {Object} user
 * @returns {Promise<{ statusCode: number, message: string, data: Object|null, errors: string[]|null }>}
 */
export const toggleBookmarkDocument = async (documentId, user) => {
    const document = await findDocumentById(documentId, false, user);
    if (!document) {
        return {
            statusCode: 404,
            message: "Tài liệu không tồn tại hoặc đã bị xóa.",
            data: null,
            errors: ["Document Not Found"],
        };
    }

    const visibilityError = await checkDocumentVisibilityAccess(document, user);
    if (visibilityError) return visibilityError;

    const existingBookmark = await findBookmark(user.id, documentId);
    if (existingBookmark) {
        await removeBookmark(user.id, documentId);
        return {
            statusCode: 200,
            message: "Gỡ đánh dấu tài liệu thành công.",
            data: { is_bookmarked: false },
            errors: null,
        };
    } else {
        await addBookmark(user.id, documentId);
        return {
            statusCode: 200,
            message: "Đánh dấu tài liệu thành công.",
            data: { is_bookmarked: true },
            errors: null,
        };
    }
};


