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
 * Gửi mã OTP 6 số xác thực email trước khi đăng ký.
 * Gọi trước register — kiểm tra trùng lặp + gửi email OTP.
 * @param {Object} payload - { email, code, username, phone, full_name }
 * @returns Promise — data.data: { email, expires_in_minutes }
 */
export const sendOtp = (payload) =>
  api.post('/auth/send-otp', payload);

/**
 * Đăng ký tài khoản mới (yêu cầu mã OTP hợp lệ)
 * @param {Object} userData - Thông tin đăng ký đầy đủ + trường `otp`
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
 * @param {{ refreshToken: string }} body
 * @returns Promise
 */
export const logout = (body) =>
  api.post('/auth/logout', body);
