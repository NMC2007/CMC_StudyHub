/**
 * ============================================
 * DOCUMENT REPOSITORY - Tầng truy vấn Database cho Tài liệu
 * ============================================
 * Xử lý mọi thao tác CRUD và tìm kiếm nâng cao với bảng `documents`.
 * Sử dụng TypeORM Repository và QueryBuilder cho bộ lọc đa điều kiện.
 */

import { AppDataSource } from "#config/db.js";

const documentRepo = AppDataSource.getRepository("Document");

/**
 * Lấy danh sách các quan hệ mặc định khi load Document.
 */
const defaultRelations = {
    owner: true,
    subject: true,
    cohort: true,
    faculty: true,
    major: true,
    likes: true,
    bookmarks: true,
    views: true,
};

/**
 * Tạo và lưu một tài liệu mới vào DB.
 * @param {Object} docData
 * @returns {Promise<Object>}
 */
export const saveDocument = async (docData) => {
    const newDoc = documentRepo.create(docData);
    return await documentRepo.save(newDoc);
};

/**
 * Tìm tài liệu theo ID (kèm relations).
 * @param {number} id - ID tài liệu
 * @param {boolean} includeDeleted - Có bao gồm tài liệu đã bị xóa mềm không
 * @returns {Promise<Object|null>}
 */
export const findDocumentById = async (id, includeDeleted = false) => {
    const whereCondition = { id };
    if (!includeDeleted) {
        whereCondition.is_deleted = false;
    }

    return await documentRepo.findOne({
        where: whereCondition,
        relations: defaultRelations,
    });
};

/**
 * Cập nhật thông tin tài liệu.
 * @param {number} id
 * @param {Object} updateData
 * @returns {Promise<Object|null>}
 */
export const updateDocumentById = async (id, updateData) => {
    await documentRepo.update(id, {
        ...updateData,
        updated_at: new Date(),
    });
    return await findDocumentById(id, true);
};

/**
 * Tìm kiếm và lọc tài liệu nâng cao (Advanced Search Engine).
 * @param {Object} queryParams - { q, uploader, role, cohort_id, faculty_id, major_id, subject_id, type, page, limit }
 * @returns {Promise<{ documents: Array, total: number, page: number, totalPages: number }>}
 */
export const searchDocumentsRepo = async (queryParams, user = null) => {
    const page = Math.max(1, parseInt(queryParams.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(queryParams.limit) || 10));
    const skip = (page - 1) * limit;

    const query = documentRepo.createQueryBuilder("doc")
        .leftJoinAndSelect("doc.owner", "owner")
        .leftJoinAndSelect("doc.subject", "subject")
        .leftJoinAndSelect("doc.cohort", "cohort")
        .leftJoinAndSelect("doc.faculty", "faculty")
        .leftJoinAndSelect("doc.major", "major")
        .leftJoinAndSelect("doc.likes", "likes")
        .leftJoinAndSelect("doc.bookmarks", "bookmarks")
        .leftJoinAndSelect("doc.views", "views")
        .where("doc.is_deleted = :isDeleted", { isDeleted: false });

    // === Lọc danh sách tài liệu đã đánh dấu (bookmarks) hoặc đã thích (likes) của user ===
    if ((queryParams.is_bookmarked === true || queryParams.is_bookmarked === "true") && user && user.id) {
        query.innerJoin("doc.bookmarks", "bm_filter", "bm_filter.user_id = :filterUserId", { filterUserId: user.id });
    }
    if ((queryParams.is_liked === true || queryParams.is_liked === "true") && user && user.id) {
        query.innerJoin("doc.likes", "like_filter", "like_filter.user_id = :filterUserId", { filterUserId: user.id });
    }

    // === Lọc quyền truy cập theo Visibility (Security Guard cho Danh sách Tìm kiếm) ===
    if (queryParams.visibility) {
        const vis = String(queryParams.visibility).trim().toUpperCase();
        if (vis === "PRIVATE") {
            query.andWhere("doc.visibility::text = :vis", { vis: "PRIVATE" });
            if (!user || user.role !== "ADMIN") {
                query.andWhere("owner.id = :currentUserId", { currentUserId: user?.id || -1 });
            }
        } else if (vis === "GROUP") {
            query.andWhere("doc.visibility::text = :vis", { vis: "GROUP" });
            if (!user || user.role === "STUDENT") {
                query.andWhere(
                    "(owner.id = :currentUserId OR doc.cohort_id = :cohortId OR doc.faculty_id = :facultyId OR doc.major_id = :majorId)",
                    {
                        currentUserId: user?.id || -1,
                        cohortId: user?.cohort_id || -1,
                        facultyId: user?.faculty_id || -1,
                        majorId: user?.major_id || -1,
                    }
                );
            }
        } else {
            query.andWhere("doc.visibility::text = :vis", { vis: "PUBLIC" });
        }
    } else {
        // Mặc định không truyền visibility: Trả về PUBLIC + GROUP hợp lệ + PRIVATE chính chủ
        if (user && user.role === "ADMIN") {
            // Admin thấy tất cả
        } else if (user) {
            query.andWhere(
                "(doc.visibility::text = 'PUBLIC' OR (doc.visibility::text = 'PRIVATE' AND owner.id = :currentUserId) OR (doc.visibility::text = 'GROUP' AND (owner.id = :currentUserId OR :role != 'STUDENT' OR doc.cohort_id = :cohortId OR doc.faculty_id = :facultyId OR doc.major_id = :majorId)))",
                {
                    currentUserId: user.id,
                    role: user.role,
                    cohortId: user.cohort_id || -1,
                    facultyId: user.faculty_id || -1,
                    majorId: user.major_id || -1,
                }
            );
        } else {
            query.andWhere("doc.visibility::text = :publicVis", { publicVis: "PUBLIC" });
        }
    }

    // === Lọc theo từ khóa (q) trên title và description ===
    // Tận dụng extension unaccent để tìm kiếm không dấu tiếng Việt
    if (queryParams.q) {
        query.andWhere(
            "(unaccent(doc.title) ILIKE unaccent(:keyword) OR unaccent(doc.description) ILIKE unaccent(:keyword))",
            { keyword: `%${queryParams.q}%` }
        );
    }

    // === Lọc theo người đăng (uploader name hoặc username) ===
    if (queryParams.uploader) {
        query.andWhere(
            "(unaccent(owner.full_name) ILIKE unaccent(:uploader) OR owner.username ILIKE :uploader)",
            { uploader: `%${queryParams.uploader}%` }
        );
    }

    // === Lọc theo vai trò người đăng (role: LECTURER hay STUDENT) ===
    if (queryParams.role) {
        query.andWhere("owner.role::text = :role", { role: queryParams.role });
    }

    // === Lọc theo phân cấp học thuật ===
    if (queryParams.cohort_id) {
        query.andWhere("doc.cohort_id = :cohortId", { cohortId: queryParams.cohort_id });
    }
    if (queryParams.faculty_id) {
        query.andWhere("doc.faculty_id = :facultyId", { facultyId: queryParams.faculty_id });
    }
    if (queryParams.major_id) {
        query.andWhere("doc.major_id = :majorId", { majorId: queryParams.major_id });
    }
    if (queryParams.subject_id) {
        query.andWhere("doc.subject_id = :subjectId", { subjectId: queryParams.subject_id });
    }

    // === Lọc theo loại tài liệu (doc_type) ===
    if (queryParams.type) {
        query.andWhere("doc.document_type = :docType", { docType: queryParams.type });
    }

    // === Sắp xếp mới nhất trước ===
    query.orderBy("doc.created_at", "DESC")
        .skip(skip)
        .take(limit);

    const [documents, total] = await query.getManyAndCount();

    return {
        documents,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};

/**
 * Xóa vĩnh viễn tài liệu khỏi database (Dùng cho dọn rác cronjob hoặc rollback).
 * @param {number} id
 */
export const hardDeleteDocumentById = async (id) => {
    await documentRepo.delete(id);
};
