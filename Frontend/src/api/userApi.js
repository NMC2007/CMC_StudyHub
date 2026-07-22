/**
 * userApi.js
 * Các API call liên quan đến User Profile.
 */
import api from './axiosInstance';

/**
 * Lấy thông tin profile của user đang đăng nhập.
 * @returns Promise — data.data: { user object }
 */
export const getProfile = () =>
  api.get('/users/profile');

/**
 * Cập nhật thông tin profile (full_name, phone, dob).
 * @param {{ full_name?: string, phone?: string, dob?: string }} body
 * @returns Promise — data.data: { user object updated }
 */
export const updateProfile = (body) =>
  api.put('/users/profile', body);

/**
 * Cập nhật avatar — dùng FormData (multipart/form-data).
 * @param {FormData} formData - FormData chứa file ảnh với key 'avatar'
 * @returns Promise — data.data: { avatar_url }
 */
export const updateAvatar = (formData) =>
  api.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Lấy danh sách tất cả users — CHỈ ADMIN.
 * @param {{ page?: number, limit?: number, role?: string, search?: string }} params
 * @returns Promise — data.data: { users: [], total, page, limit }
 */
export const getAllUsers = (params) =>
  api.get('/users', { params });

/**
 * Tìm kiếm người dùng theo từ khóa q (tên, mã code, email, username, phone) và lọc theo role.
 * @param {{ q?: string, role?: string, limit?: number, page?: number }} params
 * @returns Promise — data.data: { users: [], pagination: {} }
 */
export const searchUsers = (params) =>
  api.get('/users/search', { params });

/**
 * Lấy thông tin trang cá nhân của người dùng theo ID, kèm danh sách tài liệu họ đăng tải.
 * Tài liệu PRIVATE/GROUP bị lọc theo quyền truy cập của người xem hiện tại.
 * @param {number} id - ID của người dùng mục tiêu
 * @param {{ q?: string, type?: string, page?: number, limit?: number }} params - Bộ lọc tài liệu
 * @returns Promise — data.data: { profile, documents, pagination }
 */
export const getUserProfileById = (id, params) =>
  api.get(`/users/${id}`, { params });
