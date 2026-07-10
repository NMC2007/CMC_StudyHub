/**
 * groupApi.js
 * Các API call liên quan đến Study Groups (Nhóm học tập).
 */
import api from './axiosInstance';

/**
 * Lấy danh sách nhóm mà user đang tham gia.
 * @returns Promise — data.data: { groups: [] }
 */
export const getMyGroups = () =>
  api.get('/groups');

/**
 * Lấy chi tiết 1 nhóm (bao gồm thông tin thành viên và tài liệu nhóm).
 * @param {number} id
 * @returns Promise — data.data: { group object với members[] }
 */
export const getGroupById = (id) =>
  api.get(`/groups/${id}`);

/**
 * Tạo nhóm học tập mới.
 * @param {{ name: string, description?: string }} body
 * @returns Promise — data.data: { group object }
 */
export const createGroup = (body) =>
  api.post('/groups', body);

/**
 * Thêm thành viên vào nhóm — Chỉ Owner.
 * @param {number} groupId
 * @param {{ user_ids: number[] }} body
 * @returns Promise
 */
export const addMembers = (groupId, body) =>
  api.post(`/groups/${groupId}/members`, body);

/**
 * Xóa thành viên khỏi nhóm — Chỉ Owner.
 * @param {number} groupId
 * @param {number} userId
 * @returns Promise
 */
export const removeMember = (groupId, userId) =>
  api.delete(`/groups/${groupId}/members/${userId}`);

/**
 * Giải tán nhóm — Chỉ Owner hoặc Admin.
 * Backend sẽ xóa cascade: group_members, document references.
 * @param {number} groupId
 * @returns Promise
 */
export const disbandGroup = (groupId) =>
  api.delete(`/groups/${groupId}`);

/**
 * Chia sẻ tài liệu có sẵn vào nhóm (thay đổi visibility → GROUP).
 * @param {number} groupId
 * @param {{ document_id: number }} body
 * @returns Promise
 */
export const shareDocumentToGroup = (groupId, body) =>
  api.post(`/groups/${groupId}/documents`, body);

/**
 * Lấy danh sách tài liệu trong nhóm (visibility = GROUP).
 * @param {number} groupId
 * @param {{ page?: number, limit?: number }} params
 * @returns Promise — data.data: { documents: [], total }
 */
export const getGroupDocuments = (groupId, params) =>
  api.get(`/groups/${groupId}/documents`, { params });

/**
 * Tải trực tiếp tài liệu mới vào nhóm (visibility = GROUP).
 * @param {number} groupId
 * @param {FormData} formData
 * @returns Promise
 */
export const uploadGroupDocument = (groupId, formData) =>
  api.post(`/groups/${groupId}/documents/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
