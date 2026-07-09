/**
 * ============================================
 * DOCUMENT RESPONSE DTO - Chuẩn hóa dữ liệu tài liệu
 * ============================================
 * Chuyển đổi Document entity từ Database sang object response an toàn cho Frontend.
 * Đóng gói thông tin Owner (ẩn mật khẩu), Môn học, Khóa/Khoa/Ngành,
 * cùng các cờ tương tác cá nhân (is_liked, is_bookmarked).
 */

/**
 * Map Document entity sang object response chuẩn.
 * @param {Object} entity - Document entity từ TypeORM
 * @param {number|null} currentUserId - ID của user đang gửi request (để tính is_liked, is_bookmarked)
 * @returns {Object|null}
 */
export const toDocumentResponse = (entity, currentUserId = null) => {
    if (!entity) return null;

    // Kiểm tra cờ is_liked nếu entity có chứa relations hoặc raw flag
    let isLiked = false;
    if (typeof entity.is_liked === "boolean") {
        isLiked = entity.is_liked;
    } else if (Array.isArray(entity.likes) && currentUserId) {
        isLiked = entity.likes.some(like => Number(like.user_id) === Number(currentUserId) || (like.user && Number(like.user.id) === Number(currentUserId)) || true);
    }

    // Kiểm tra cờ is_bookmarked
    let isBookmarked = false;
    if (typeof entity.is_bookmarked === "boolean") {
        isBookmarked = entity.is_bookmarked;
    } else if (Array.isArray(entity.bookmarks) && currentUserId) {
        isBookmarked = entity.bookmarks.some(bm => Number(bm.user_id) === Number(currentUserId) || (bm.user && Number(bm.user.id) === Number(currentUserId)) || true);
    }

    // Tính tổng lượt xem từ cột cache view_count hoặc relation views
    let viewCount = 0;
    if (entity.view_count !== undefined && entity.view_count !== null) {
        viewCount = Number(entity.view_count);
    } else if (Array.isArray(entity.views)) {
        viewCount = entity.views.length;
    }

    return {
        id: entity.id,
        title: entity.title,
        description: entity.description || null,
        document_type: entity.document_type || null,
        visibility: entity.visibility || "PUBLIC",
        file_url: entity.file_url,
        file_size: entity.file_size || null,
        file_type: entity.file_type || null,
        download_count: entity.download_count || 0,
        like_count: entity.like_count || 0,
        view_count: viewCount,
        is_liked: isLiked,
        is_bookmarked: isBookmarked,
        is_deleted: entity.is_deleted || false,
        deleted_at: entity.deleted_at || null,
        created_at: entity.created_at,
        updated_at: entity.updated_at,

        // === Thông tin chủ sở hữu (Đóng gói an toàn) ===
        owner: entity.owner ? {
            id: entity.owner.id,
            full_name: entity.owner.full_name,
            username: entity.owner.username,
            avatar: entity.owner.avatar || null,
            role: entity.owner.role,
        } : null,

        // === Thông tin Môn học ===
        subject: entity.subject ? {
            id: entity.subject.id,
            code: entity.subject.code,
            name: entity.subject.name,
        } : null,

        // === Phân cấp Học thuật ===
        cohort: entity.cohort ? {
            id: entity.cohort.id,
            code: entity.cohort.code,
            name: entity.cohort.name,
        } : null,
        faculty: entity.faculty ? {
            id: entity.faculty.id,
            code: entity.faculty.code,
            name: entity.faculty.name,
        } : null,
        major: entity.major ? {
            id: entity.major.id,
            code: entity.major.code,
            name: entity.major.name,
        } : null,
    };
};

/**
 * Map danh sách Document entities sang mảng response.
 * @param {Array} entities - Danh sách Document entities
 * @param {number|null} currentUserId
 * @returns {Array}
 */
export const toDocumentListResponse = (entities, currentUserId = null) => {
    if (!Array.isArray(entities)) return [];
    return entities.map(entity => toDocumentResponse(entity, currentUserId));
};
