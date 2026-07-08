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

// Singleton promise để chống gọi trùng API refresh khi có nhiều request cùng lỗi 401
let refreshTokenPromise = null;

// ─── RESPONSE INTERCEPTOR ───────────────────────────────────────────────────
// Logic Token Rotation với Promise Deduplication:
// 1. Nếu nhận 401 và chưa retry (_retry chưa được set):
//    a. Đánh dấu _retry = true để tránh retry lần 2.
//    b. Lấy refreshToken từ localStorage.
//    c. Nếu chưa có request refresh nào đang chạy -> Khởi tạo refreshTokenPromise.
//    d. Chờ promise hoàn thành để lấy accessToken mới.
//    e. Gắn Authorization mới và retry request gốc.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Điều kiện retry: lỗi 401, chưa retry lần nào, và KHÔNG PHẢI các API xác thực (login, register, refresh)
    const is401 = error.response?.status === 401;
    const notRetried = !originalRequest._retry;
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    if (is401 && notRetried && !isAuthEndpoint) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      // Không có refreshToken → Có 2 trường hợp:
      // 1. Guest chưa đăng nhập (đang ở trang /register, /login, v.v.) → KHÔNG redirect, trả lỗi về component
      // 2. User bị mất token bất thường → cũng không redirect vì không có gì để clear
      // Quyết định: Không phân biệt 2 case, chỉ reject. React Router Guard sẽ handle redirect nếu cần.
      if (!refreshToken) {
        return Promise.reject(error);
      }

      // Nếu chưa có request refresh nào đang chạy, tạo mới promise
      if (!refreshTokenPromise) {
        refreshTokenPromise = (async () => {
          try {
            const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
              refreshToken,
            });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

            useAuthStore.getState().setCredentials(null, newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            return newAccessToken;
          } catch (refreshError) {
            useAuthStore.getState().clearCredentials();
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            throw refreshError;
          } finally {
            refreshTokenPromise = null;
          }
        })();
      }

      try {
        // Chờ request refresh hoàn thành và lấy token mới
        const newAccessToken = await refreshTokenPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
