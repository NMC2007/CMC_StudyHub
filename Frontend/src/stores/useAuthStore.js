/**
 * useAuthStore.js
 *
 * Zustand store quản lý Authentication Session.
 *
 * Thiết kế bảo mật:
 *  - accessToken: CHỈ lưu trong memory (Zustand) — KHÔNG bao giờ lưu localStorage.
 *    Lý do: localStorage dễ bị tấn công XSS đọc trộm. Memory bị xóa khi đóng tab — đây là hành vi đúng.
 *  - refreshToken: Lưu trong localStorage — cần thiết để khôi phục session khi F5/mở lại tab.
 *    Ít nhạy cảm hơn accessToken vì chỉ dùng được 1 lần (Token Rotation) và hết hạn sau 7 ngày.
 *
 * Lưu ý: Store này được gọi ngoài React lifecycle bởi axiosInstance.js
 * thông qua useAuthStore.getState() — đây là pattern chính thức của Zustand.
 */
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // ── State ──────────────────────────────────────────────
  user: null,           // Object user đầy đủ từ backend (id, username, email, role, avatar, ...)
  accessToken: null,    // JWT access token — chỉ trong memory
  isAuthenticated: false,
  role: null,           // 'STUDENT' | 'LECTURER' | 'ADMIN' — lưu riêng để truy xuất nhanh

  // ── Actions ────────────────────────────────────────────

  /**
   * setAccessToken — Gọi khi vừa refresh token thành công mà chưa có profile,
   * hoặc dùng khi retry request để chỉ cập nhật token trong bộ nhớ mà không đổi isAuthenticated/role.
   * @param {string} accessToken
   */
  setAccessToken: (accessToken) => set({ accessToken }),

  /**
   * setCredentials — Gọi sau khi login thành công hoặc sau khi refresh token có kèm/đã tải profile.
   * @param {Object|null} user - Object user từ backend. Truyền null khi chỉ refresh token (nếu user cũ đã có trong state).
   * @param {string} accessToken - JWT access token mới.
   */
  setCredentials: (user, accessToken) =>
    set((state) => {
      const nextUser = user ?? state.user;
      return {
        user: nextUser,
        accessToken,
        isAuthenticated: Boolean(nextUser), // Chỉ xác nhận đăng nhập thành công khi đã có profile user
        role: nextUser?.role ?? state.role,
      };
    }),

  /**
   * clearCredentials — Gọi khi logout hoặc refresh token thất bại.
   * Xóa toàn bộ session khỏi memory.
   */
  clearCredentials: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      role: null,
    }),

  /**
   * updateUser — Gọi sau khi cập nhật profile (avatar, full_name, phone...).
   * Chỉ cập nhật thông tin user, KHÔNG đụng đến token.
   * @param {Object} updatedFields - Các trường cần cập nhật (partial update).
   */
  updateUser: (updatedFields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : state.user,
    })),
}));
