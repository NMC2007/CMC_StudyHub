/**
 * Sidebar.jsx
 * Thanh điều hướng bên trái (Desktop) / Drawer overlay (Mobile).
 *
 * Tính năng:
 *  - Danh sách menu điều hướng theo Role (Student/Lecturer chia sẻ menu,
 *    Admin có menu riêng).
 *  - Dynamic Color Theming: Viền, icon active, highlight đổi màu theo Role.
 *  - Hiển thị thông tin User (Avatar placeholder, Tên, Badge Role) ở dưới cùng.
 *  - Nút Đăng xuất.
 *  - Responsive: Desktop hiện cố định, Mobile hiện dạng Drawer (slide-in từ trái).
 *
 * Tuân thủ: STUDYHUB_FE.md mục 7.6 (AppLayout) + mục 3.2 (Dynamic Theme).
 */
import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Search,
  Heart,
  Users,
  UserCog,
  GraduationCap,
  Clock,
  LogOut,
  X,
  User,
} from "lucide-react";

import { useAuthStore } from "#/stores/useAuthStore";
import { useLogout } from "#/hooks/useAuth";
import { getRoleLabel, getAvatarUrl } from "#/utils/formatters";
import Badge from "#/components/ui/Badge";

// ─── Cấu hình Menu theo Role ──────────────────────────────────────────────────

const SHARED_MENU = [
  { to: "/", icon: LayoutDashboard, label: "Trang chủ" },
  { to: "/documents", icon: FileText, label: "Tài liệu" },
  { to: "/search", icon: Search, label: "Tìm kiếm" },
  { to: "/favorites", icon: Heart, label: "Yêu thích" },
  { to: "/groups", icon: Users, label: "Nhóm học tập" },
];

const ADMIN_MENU = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/documents", icon: FileText, label: "Tài liệu" },
  { to: "/search", icon: Search, label: "Tìm kiếm" },
  { to: "/favorites", icon: Heart, label: "Yêu thích" },
  { to: "/groups", icon: Users, label: "Nhóm học tập" },
  { to: "/admin/users", icon: UserCog, label: "Quản lý Users" },
  { to: "/admin/academic", icon: GraduationCap, label: "Học thuật" },
  { to: "/admin/cron", icon: Clock, label: "Cron Jobs" },
];

// ─── Helper: Lấy Tailwind classes theo Role ───────────────────────────────────

const getRoleThemeClasses = (role) => {
  switch (role) {
    case "LECTURER":
      return {
        activeText: "text-brand-lecturer",
        activeBg: "bg-brand-lecturer-light/60",
        activeBorder: "border-brand-lecturer",
        hoverBg: "hover:bg-brand-lecturer-light/30",
        accentBg: "bg-brand-lecturer",
      };
    case "ADMIN":
      return {
        activeText: "text-brand-admin",
        activeBg: "bg-brand-admin-light/60",
        activeBorder: "border-brand-admin",
        hoverBg: "hover:bg-brand-admin-light/30",
        accentBg: "bg-brand-admin",
      };
    default: // STUDENT
      return {
        activeText: "text-brand-student",
        activeBg: "bg-brand-student-light/60",
        activeBorder: "border-brand-student",
        hoverBg: "hover:bg-brand-student-light/30",
        accentBg: "bg-brand-student",
      };
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ isOpen, onClose }) {
  const role = useAuthStore((s) => s.role);
  const location = useLocation();

  const menuItems = role === "ADMIN" ? ADMIN_MENU : SHARED_MENU;
  const theme = getRoleThemeClasses(role);

  return (
    <>
      {/* ── Mobile Overlay Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Container ── */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon.svg"
              alt="StudyHub Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-base font-bold text-text-primary">
              StudyHub
            </span>
          </div>
          {/* Nút đóng sidebar trên Mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Navigation Menu ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => {
              // NavLink end prop cho route "/" để tránh match hết mọi route
              const isExactHome =
                item.to === "/" || item.to === "/admin/dashboard";
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={isExactHome}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-l-[3px] ${
                        isActive
                          ? `${theme.activeBg} ${theme.activeText} ${theme.activeBorder}`
                          : `border-transparent text-text-secondary ${theme.hoverBg} hover:text-text-primary`
                      }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
