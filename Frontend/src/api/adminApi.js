/**
 * adminApi.js
 * Các API call chỉ dành riêng cho ADMIN.
 * Router đã bảo vệ bằng RbacRoute, backend cũng kiểm tra role.
 */
import api from './axiosInstance';

/**
 * Kích hoạt thủ công Cron Job dọn Thùng rác.
 * @param {{ days: number }} body - Số ngày tài liệu bị xóa trước khi xóa vĩnh viễn (mặc định 15)
 * @returns Promise — data.data: { deleted_count: number, message: string }
 */
export const triggerTrashCleanup = (body) =>
  api.post('/admin/cron/trigger/trash-cleanup', body);

/**
 * Kích hoạt thủ công Cron Job dọn Refresh Token hết hạn.
 * @returns Promise — data.data: { deleted_count: number, message: string }
 */
export const triggerTokenCleanup = () =>
  api.post('/admin/cron/trigger/token-cleanup');

/**
 * Lấy thống kê tổng quan hệ thống cho Admin Dashboard.
 * @returns Promise — data.data: { total_users, total_documents, total_groups, total_views }
 */
export const getSystemStats = () =>
  api.get('/admin/stats');

/**
 * Lấy thông số giám sát sức khỏe hệ thống (Trạng thái DB, RAM, CPU Load, Uptime).
 * @returns Promise — data.data: { status, database, memory, cpu_load, uptime_seconds }
 */
export const getSystemHealth = () =>
  api.get('/admin/system/health');

/**
 * Cập nhật trạng thái người dùng (Chỉ Admin).
 * @param {number|string} userId - ID của người dùng
 * @param {{ status: 'ACTIVE' | 'INACTIVE' | 'BANNED' }} body - Trạng thái mới
 * @returns Promise — data.data: User object đã cập nhật
 */
export const updateUserStatus = (userId, body) =>
  api.patch(`/admin/users/${userId}/status`, body);
