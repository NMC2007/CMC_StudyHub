/**
 * documentApi.js
 * Các API call liên quan đến Document (Tài liệu).
 *
 * Lưu ý về search params:
 *  q, uploader, uploader_role, cohort_id, faculty_id, major_id, subject_id,
 *  document_type, visibility, page, limit
 */
import api from './axiosInstance';

/**
 * Tìm kiếm & lọc tài liệu PUBLIC (hoặc của user hiện tại nếu có auth).
 * @param {Object} params - Bộ lọc tìm kiếm
 * @returns Promise — data.data: { documents: [], total, page, limit }
 */
export const searchDocuments = (params) =>
  api.get('/documents/search', { params });

/**
 * Lấy chi tiết 1 tài liệu (bao gồm cả ghi nhận lượt xem).
 * @param {number} id
 * @returns Promise — data.data: { document object }
 */
export const getDocumentById = (id) =>
  api.get(`/documents/${id}`);

/**
 * Upload tài liệu mới — dùng FormData.
 * @param {FormData} formData - file, title, description, document_type, visibility, subject_id, ...
 * @returns Promise — data.data: { document object }
 */
export const uploadDocument = (formData) =>
  api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Cập nhật metadata tài liệu (title, description, visibility, document_type).
 * Không cho phép thay file.
 * @param {number} id
 * @param {Object} body
 * @returns Promise — data.data: { document object updated }
 */
export const updateDocument = (id, body) =>
  api.put(`/documents/${id}`, body);

/**
 * Xóa mềm tài liệu (chuyển vào Thùng rác).
 * @param {number} id
 * @returns Promise
 */
export const softDeleteDocument = (id) =>
  api.delete(`/documents/${id}`);

/**
 * Khôi phục tài liệu từ Thùng rác.
 * @param {number} id
 * @returns Promise
 */
export const restoreDocument = (id) =>
  api.post(`/documents/${id}/restore`);

/**
 * Toggle Like tài liệu (Like ↔ Unlike).
 * @param {number} id
 * @returns Promise — data.data: { liked: boolean, like_count: number }
 */
export const toggleLike = (id) =>
  api.post(`/documents/${id}/like`);

/**
 * Toggle Bookmark tài liệu (Bookmark ↔ Unbookmark).
 * @param {number} id
 * @returns Promise — data.data: { bookmarked: boolean }
 */
export const toggleBookmark = (id) =>
  api.post(`/documents/${id}/bookmark`);

/**
 * Lấy danh sách tài liệu trong Thùng rác của user hiện tại.
 * @param {{ page?: number, limit?: number }} params
 * @returns Promise — data.data: { documents: [], total }
 */
export const getTrash = (params) =>
  api.get('/documents/trash', { params });

/**
 * Lấy danh sách tài liệu đã Bookmark.
 * @param {{ page?: number, limit?: number }} params
 * @returns Promise — data.data: { documents: [], total }
 */
export const getBookmarks = (params) =>
  api.get('/documents/bookmarks', { params });

/**
 * Lấy danh sách tài liệu đã Like.
 * @param {{ page?: number, limit?: number }} params
 * @returns Promise — data.data: { documents: [], total }
 */
export const getLikes = (params) =>
  api.get('/documents/likes', { params });
