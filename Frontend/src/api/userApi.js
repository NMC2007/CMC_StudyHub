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
