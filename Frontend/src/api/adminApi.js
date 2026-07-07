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
