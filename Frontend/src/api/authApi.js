/**
 * authApi.js
 * Các API call liên quan đến Authentication.
 * Tất cả function trả về Promise<AxiosResponse>.
 * Caller tự xử lý response.data.data để lấy payload.
 */
import api from './axiosInstance';

/**
 * Đăng nhập
 * @param {{ identifier: string, password: string }} credentials
 * @returns Promise — data.data: { user, accessToken, refreshToken }
 */
export const login = (credentials) =>
  api.post('/auth/login', credentials);

/**
 * Đăng ký tài khoản mới
 * @param {Object} userData - Thông tin đăng ký đầy đủ
 * @returns Promise — data.data: { message }
 */
export const register = (userData) =>
  api.post('/auth/register', userData);

/**
 * Làm mới Access Token bằng Refresh Token.
 * Hàm này chỉ dùng trong axiosInstance interceptor.
 * Ngoài ra không nên gọi trực tiếp.
 * @param {{ refreshToken: string }} body
 * @returns Promise — data.data: { accessToken, refreshToken }
 */
export const refreshToken = (body) =>
  api.post('/auth/refresh', body);

/**
 * Đăng xuất — Xóa refreshToken trên server.
 * @returns Promise
 */
export const logout = () =>
  api.post('/auth/logout');
