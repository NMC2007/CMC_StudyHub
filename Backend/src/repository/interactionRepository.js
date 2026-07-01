/**
 * ============================================
 * INTERACTION REPOSITORY - Tầng truy vấn Tương tác tài liệu
 * ============================================
 * Quản lý các thao tác Like (document_likes), Bookmark (bookmarks),
 * và Lượt xem (document_views).
 */

import { AppDataSource } from "#config/db.js";

const likeRepo = AppDataSource.getRepository("DocumentLike");
const bookmarkRepo = AppDataSource.getRepository("Bookmark");
const viewRepo = AppDataSource.getRepository("DocumentView");

// ==========================================
// 1. LIKES (document_likes)
// ==========================================

/**
 * Kiểm tra xem user đã like tài liệu chưa.
 * @param {number} userId
 * @param {number} documentId
 * @returns {Promise<Object|null>}
 */
export const findLike = async (userId, documentId) => {
    return await likeRepo.findOneBy({
        user_id: userId,
        document_id: documentId,
    });
};

/**
 * Thêm lượt thích mới.
 * @param {number} userId
 * @param {number} documentId
 * @returns {Promise<Object>}
 */
export const addLike = async (userId, documentId) => {
    const like = likeRepo.create({ user_id: userId, document_id: documentId });
    return await likeRepo.save(like);
};

/**
 * Xóa lượt thích.
 * @param {number} userId
 * @param {number} documentId
 */
export const removeLike = async (userId, documentId) => {
    await likeRepo.delete({ user_id: userId, document_id: documentId });
};

/**
 * Đếm số lượt thích thực tế trong DB của tài liệu.
 * @param {number} documentId
 * @returns {Promise<number>}
 */
export const countLikesByDocumentId = async (documentId) => {
    return await likeRepo.countBy({ document_id: documentId });
};

// ==========================================
// 2. BOOKMARKS (bookmarks)
// ==========================================

/**
 * Kiểm tra xem user đã bookmark tài liệu chưa.
 * @param {number} userId
 * @param {number} documentId
 * @returns {Promise<Object|null>}
 */
export const findBookmark = async (userId, documentId) => {
    return await bookmarkRepo.findOneBy({
        user_id: userId,
        document_id: documentId,
    });
};

/**
 * Thêm bookmark mới.
 * @param {number} userId
 * @param {number} documentId
 * @returns {Promise<Object>}
 */
export const addBookmark = async (userId, documentId) => {
    const bm = bookmarkRepo.create({ user_id: userId, document_id: documentId });
    return await bookmarkRepo.save(bm);
};

/**
 * Xóa bookmark.
 * @param {number} userId
 * @param {number} documentId
 */
export const removeBookmark = async (userId, documentId) => {
    await bookmarkRepo.delete({ user_id: userId, document_id: documentId });
};

/**
 * Lấy danh sách bookmark của user (kèm chi tiết tài liệu chưa bị xóa).
 * @param {number} userId
 * @returns {Promise<Array>}
 */
export const findBookmarksByUserId = async (userId) => {
    return await bookmarkRepo.find({
        where: {
            user_id: userId,
            document: { is_deleted: false },
        },
        relations: {
            document: {
                owner: true,
                subject: true,
                cohort: true,
                faculty: true,
                major: true,
                likes: true,
                bookmarks: true,
                views: true,
            },
        },
        order: { created_at: "DESC" },
    });
};

// ==========================================
// 3. VIEWS (document_views)
// ==========================================

/**
 * Ghi nhận 1 lượt xem mới vào DB.
 * @param {number} userId
 * @param {number} documentId
 * @returns {Promise<Object>}
 */
export const recordView = async (userId, documentId) => {
    const view = viewRepo.create({ user_id: userId, document_id: documentId });
    const savedView = await viewRepo.save(view);
    // Tăng cache view_count trong bảng documents
    await AppDataSource.getRepository("Document").increment({ id: documentId }, "view_count", 1);
    return savedView;
};

/**
 * Đếm tổng số lượt xem của tài liệu.
 * @param {number} documentId
 * @returns {Promise<number>}
 */
export const countViewsByDocumentId = async (documentId) => {
    return await viewRepo.countBy({ document_id: documentId });
};
