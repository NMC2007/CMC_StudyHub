/**
 * ProtectedRoute.jsx
 * Route Guard kiểm tra trạng thái đăng nhập.
 *
 * Luồng:
 *  1. Đọc `isAuthenticated` từ Zustand Auth Store.
 *  2. Nếu đã đăng nhập → render <Outlet /> (cho phép truy cập route con).
 *  3. Nếu chưa đăng nhập → redirect về /login, đồng thời lưu lại URL hiện tại
 *     vào state để sau khi login xong có thể quay lại đúng trang mong muốn.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 6 (Routing & Route Guards).
 */
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuthStore } from '#/stores/useAuthStore';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Lưu URL hiện tại để redirect lại sau khi login thành công
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
