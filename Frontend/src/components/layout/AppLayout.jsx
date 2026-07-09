/**
 * AppLayout.jsx
 * Khung giao diện tổng thể (Layout Shell) cho tất cả các trang sau khi đăng nhập.
 *
 * Cấu trúc:
 *  ┌─────────┬──────────────────────────────────┐
 *  │         │  TopNavbar                       │
 *  │ Sidebar ├──────────────────────────────────┤
 *  │         │  <Outlet /> (Nội dung trang con) │
 *  └─────────┴──────────────────────────────────┘
 *
 * Tính năng:
 *  - Layout 2 cột: Sidebar (cố định bên trái) + Area chính (Navbar + Content).
 *  - Responsive: Sidebar ẩn trên Mobile/Tablet, hiện qua nút hamburger.
 *  - Dynamic Theming đã được xử lý bên trong Sidebar component.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 7.6 (AppLayout / PageWrapper).
 */
import { useState, Suspense } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Skeleton from '#/components/ui/Skeleton';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area: Navbar + Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">
          <Suspense
            fallback={
              <div className="p-6 md:p-8 flex flex-col gap-4">
                <Skeleton height="h-28" className="rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton height="h-44" className="rounded-2xl" />
                  <Skeleton height="h-44" className="rounded-2xl" />
                  <Skeleton height="h-44" className="rounded-2xl" />
                </div>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
