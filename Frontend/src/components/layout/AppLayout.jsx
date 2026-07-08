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
import { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
