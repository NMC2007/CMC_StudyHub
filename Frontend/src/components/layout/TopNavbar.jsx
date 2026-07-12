/**
 * TopNavbar.jsx
 * Thanh điều hướng phía trên (Top Navigation Bar).
 *
 * Tính năng:
 *  - Nút hamburger (☰) toggle Sidebar trên Mobile/Tablet.
 *  - Hiển thị avatar, tên user và tag role ở góc phải.
 *  - Click vào user info góc phải mở dropdown menu (Thông tin tài khoản & Đăng xuất).
 *
 * Tuân thủ: STUDYHUB_FE.md mục 3.3 (Sidebar & TopNavbar).
 */
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "#/stores/useAuthStore";
import { useLogout } from "#/hooks/useAuth";
import { getAvatarUrl } from "#/utils/formatters";
import Badge from "#/components/ui/Badge";

export default function TopNavbar({ onToggleSidebar }) {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const logoutMutation = useLogout();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const avatarUrl = getAvatarUrl(user?.avatar || user?.avatar_url);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-6">
      <div className="flex items-center justify-between h-14 gap-4">
        {/* Left: Hamburger (Mobile only) */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-700 cursor-pointer p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Spacer to push user info to the right */}
        <div className="flex-1" />

        {/* Right: User info & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1.5 -mr-1.5 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer group"
          >
            <div className="hidden md:flex flex-col items-end text-right">
              <p className="text-sm font-semibold text-text-primary leading-tight truncate max-w-[150px] group-hover:text-brand-student transition-colors">
                {user?.full_name || user?.username || "User"}
              </p>
              <div className="mt-0.5">
                <Badge variant="role" value={role || "STUDENT"} size="sm" />
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative ring-2 ring-transparent group-hover:ring-brand-student/30 transition-all">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.full_name || "Avatar"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling)
                      e.target.nextSibling.style.display = "block";
                  }}
                />
              ) : null}
              <User
                className={`w-4 h-4 text-slate-500 ${avatarUrl ? "hidden" : ""}`}
              />
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Floating Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User Identity Header inside dropdown (đặc biệt hữu ích trên Mobile khi text bị ẩn ở TopNavbar) */}
              <div className="px-4 py-2.5 border-b border-slate-100 flex flex-col gap-1">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user?.full_name || user?.username || "Người dùng"}
                </p>
                <p className="text-xs text-slate-400 font-mono truncate">
                  @{user?.username || "account"}
                </p>
                <div className="mt-1 md:hidden">
                  <Badge variant="role" value={role || "STUDENT"} size="sm" />
                </div>
              </div>

              {/* Menu Actions */}
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-student transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Thông tin tài khoản</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>
                    {logoutMutation.isPending
                      ? "Đang đăng xuất..."
                      : "Đăng xuất"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
