/**
 * RoleBasedDashboard.jsx
 * Component điều hướng thông minh — Render Dashboard phù hợp theo role.
 *
 * Luồng:
 *  1. Đọc `role` từ Zustand Auth Store.
 *  2. STUDENT  → render <StudentDashboard />
 *  3. LECTURER → render <LecturerDashboard />
 *  4. ADMIN    → redirect sang /admin/dashboard (route riêng)
 *
 * Component này được dùng tại route "/" (root) — sau khi user đã qua ProtectedRoute.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 9 (Dashboard theo Role).
 */
import React from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '#/stores/useAuthStore';

const StudentDashboard = React.lazy(() => import('#/pages/student/StudentDashboard'));
const LecturerDashboard = React.lazy(() => import('#/pages/lecturer/LecturerDashboard'));

export default function RoleBasedDashboard() {
  const role = useAuthStore((s) => s.role);

  switch (role) {
    case 'STUDENT':
      return <StudentDashboard />;
    case 'LECTURER':
      return <LecturerDashboard />;
    case 'ADMIN':
      // Admin có dashboard riêng tại /admin/dashboard
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <StudentDashboard />;
  }
}
