/**
 * RbacRoute.jsx
 * Route Guard kiểm tra quyền truy cập theo vai trò (Role-Based Access Control).
 *
 * Luồng:
 *  1. Đọc `role` từ Zustand Auth Store.
 *  2. So sánh với danh sách `allowedRoles` được truyền qua prop.
 *  3. Nếu role hợp lệ → render <Outlet /> (cho phép truy cập route con).
 *  4. Nếu không đủ quyền → redirect về "/" + toast cảnh báo.
 *
 * Cách sử dụng trong router:
 *   { element: <RbacRoute allowedRoles={['ADMIN']} />, children: [...] }
 *
 * Tuân thủ: STUDYHUB_FE.md mục 6 (Routing & Route Guards).
 */
import { Navigate, Outlet } from 'react-router';
import { toast } from 'sonner';
import { useAuthStore } from '#/stores/useAuthStore';
import { useRef } from 'react';

export default function RbacRoute({ allowedRoles = [] }) {
  const role = useAuthStore((s) => s.role);
  // Dùng ref để chỉ hiển thị toast 1 lần duy nhất (tránh lặp khi React re-render)
  const hasToasted = useRef(false);

  if (!allowedRoles.includes(role)) {
    if (!hasToasted.current) {
      hasToasted.current = true;
      toast.error('Bạn không có quyền truy cập trang này.');
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
