/**
 * router/index.jsx
 * Cấu hình React Router v8 — Bộ điều hướng trung tâm của ứng dụng.
 *
 * Phân tách rõ ràng:
 *  1. PUBLIC ROUTES  — /login, /register (có loader chặn user đã đăng nhập).
 *  2. PROTECTED ROUTES — Bọc trong ProtectedRoute, yêu cầu đăng nhập.
 *     2a. SHARED ROUTES — Dùng chung cho Student & Lecturer (/, /documents, /search, ...).
 *     2b. ADMIN ROUTES  — Bọc thêm RbacRoute, chỉ dành cho role ADMIN.
 *  3. CATCH-ALL — Route "*" → NotFoundPage.
 *
 * Dễ mở rộng: Thêm route mới chỉ cần bổ sung object vào đúng nhóm.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 6 (Routing & Route Guards).
 */
import { createBrowserRouter } from 'react-router';

import { useAuthStore } from '#/stores/useAuthStore';

// ── Layout ──
import AppLayout from '#/components/layout/AppLayout';

// ── Route Guards ──
import ProtectedRoute from '#/router/ProtectedRoute';
import RbacRoute from '#/router/RbacRoute';
import RoleBasedDashboard from '#/router/RoleBasedDashboard';

// ── Auth Pages ──
import LoginPage from '#/pages/auth/LoginPage';
import RegisterPage from '#/pages/auth/RegisterPage';
import NotFoundPage from '#/pages/NotFoundPage';

// ── Dashboard Placeholders ──
import AdminDashboard from '#/pages/admin/AdminDashboard';

// ─── Loader: Chặn user đã đăng nhập truy cập Login/Register ──────────────────
// Nếu đã authenticated → redirect về "/" thay vì hiển thị trang Login/Register.
const redirectIfAuth = () => {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    return Response.redirect(new URL('/', window.location.origin), 302);
  }
  return null;
};

// ─── Router Configuration ─────────────────────────────────────────────────────

const router = createBrowserRouter([
  // ════════════════════════════════════════════════════════════════════════════
  // 1. PUBLIC ROUTES — Không cần đăng nhập
  // ════════════════════════════════════════════════════════════════════════════
  {
    path: '/login',
    element: <LoginPage />,
    loader: redirectIfAuth,
  },
  {
    path: '/register',
    element: <RegisterPage />,
    loader: redirectIfAuth,
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 2. PROTECTED ROUTES — Yêu cầu đăng nhập
  // ════════════════════════════════════════════════════════════════════════════
  {
    element: <ProtectedRoute />,
    children: [
      {
        // AppLayout bọc tất cả trang sau khi đăng nhập (Sidebar + Navbar + Content)
        element: <AppLayout />,
        children: [
          // ── 2a. SHARED ROUTES (Student & Lecturer) ──
          {
            path: '/',
            element: <RoleBasedDashboard />,
          },
          // Các route sau sẽ được bổ sung ở Phase 5:
          // { path: '/documents', element: <DocumentsPage /> },
          // { path: '/search',    element: <SearchPage /> },
          // { path: '/favorites', element: <FavoritesPage /> },
          // { path: '/groups',    element: <GroupsPage /> },
          // { path: '/groups/:id', element: <GroupDetailPage /> },
          // { path: '/profile',   element: <ProfilePage /> },

          // ── 2b. ADMIN ROUTES — Chỉ dành cho ADMIN ──
          {
            element: <RbacRoute allowedRoles={['ADMIN']} />,
            children: [
              { path: '/admin/dashboard', element: <AdminDashboard /> },
              // Các route admin sẽ được bổ sung ở Phase 6:
              // { path: '/admin/users',    element: <UsersPage /> },
              // { path: '/admin/academic', element: <AcademicPage /> },
              // { path: '/admin/cron',     element: <CronPage /> },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 3. CATCH-ALL — URL không tồn tại
  // ════════════════════════════════════════════════════════════════════════════
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
