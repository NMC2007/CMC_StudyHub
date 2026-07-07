/**
 * axiosInstance.js
 *
 * Instance Axios duy nhất của toàn bộ ứng dụng.
 * Được cấu hình với 2 interceptors:
 *  - Request: Tự động gắn Authorization header từ Zustand store (không dùng hook).
 *  - Response: Bắt lỗi 401 → tự động refresh token → retry request gốc.
 *
 * Lưu ý quan trọng: Request refresh token gọi bằng axios gốc (không qua instance này)
 * để tránh kích hoạt lại interceptor và gây ra vòng lặp vô hạn.
 */
import axios from 'axios';
import { useAuthStore } from '#/stores/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';

// Instance duy nhất — export default để toàn bộ api/*.js dùng chung
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 giây — tránh request treo vô thời hạn
});

// ─── REQUEST INTERCEPTOR ────────────────────────────────────────────────────
// Đọc accessToken từ Zustand store bằng getState() (không dùng hook)
// vì interceptor chạy ngoài React lifecycle.
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── RESPONSE INTERCEPTOR ───────────────────────────────────────────────────
// Logic Token Rotation:
// 1. Nếu nhận 401 và chưa retry (_retry chưa được set):
//    a. Đánh dấu _retry = true để tránh retry lần 2.
//    b. Lấy refreshToken từ localStorage.
//    c. Gọi /auth/refresh bằng axios GỐC (không qua api instance).
//    d. Lưu accessToken mới vào Zustand, refreshToken mới vào localStorage.
//    e. Gắn Authorization mới và retry request gốc.
// 2. Nếu refresh thất bại (refreshToken hết hạn/bị thu hồi):
//    a. clearCredentials() → xóa Zustand state.
//    b. Xóa refreshToken khỏi localStorage.
//    c. Redirect về /login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Điều kiện retry: lỗi 401, chưa retry lần nào, và không phải request refresh token tự nó
    const is401 = error.response?.status === 401;
    const notRetried = !originalRequest._retry;
    const notRefreshRequest = !originalRequest.url?.includes('/auth/refresh');

    if (is401 && notRetried && notRefreshRequest) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      // Không có refreshToken → logout ngay, không cần gọi API
      if (!refreshToken) {
        useAuthStore.getState().clearCredentials();
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Gọi bằng axios GỐC để tránh interceptor recursive
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

        // Lưu token mới (Token Rotation — luôn phải lưu cả 2 token mới)
        useAuthStore.getState().setCredentials(null, newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Gắn token mới vào request gốc và retry
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại → buộc logout
        useAuthStore.getState().clearCredentials();
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
