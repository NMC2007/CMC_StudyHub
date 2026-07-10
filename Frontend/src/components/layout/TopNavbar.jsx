/**
 * TopNavbar.jsx
 * Thanh điều hướng phía trên (Top Navigation Bar).
 *
 * Tính năng:
 *  - Nút hamburger (☰) toggle Sidebar trên Mobile/Tablet.
 *  - Thanh tìm kiếm nhanh: Nhập từ khóa + Enter → chuyển sang /search?q=...
 *  - Hiển thị avatar nhỏ và tên user ở góc phải.
 *  - Dynamic Theming: accent color cho nút toggle và search focus.
 *
 * Tuân thủ: STUDYHUB_FE.md mục 3.3 (Sidebar & TopNavbar).
 */
import { Menu, User } from "lucide-react";
import { useAuthStore } from "#/stores/useAuthStore";
import { getAvatarUrl } from "#/utils/formatters";

export default function TopNavbar({ onToggleSidebar }) {
  const user = useAuthStore((s) => s.user);

  const avatarUrl = getAvatarUrl(user?.avatar || user?.avatar_url);

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

        {/* Right: User info */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-text-primary leading-tight truncate max-w-[150px]">
              {user?.full_name || "User"}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
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
        </div>
      </div>
    </header>
  );
}
