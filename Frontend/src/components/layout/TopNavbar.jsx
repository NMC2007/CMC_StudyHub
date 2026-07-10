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
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Menu, Search, User } from 'lucide-react';
import { useAuthStore } from '#/stores/useAuthStore';
import { getAvatarUrl } from '#/utils/formatters';

export default function TopNavbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearchQuery('');
    }
  };

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

        {/* Center: Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md hidden sm:flex items-center"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tài liệu..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-student/20 focus:border-brand-student hover:border-slate-300 transition-all placeholder:text-slate-400"
            />
          </div>
        </form>

        {/* Right: User info */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-text-primary leading-tight truncate max-w-[150px]">
              {user?.full_name || 'User'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.full_name || 'Avatar'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <User className={`w-4 h-4 text-slate-500 ${avatarUrl ? 'hidden' : ''}`} />
          </div>
        </div>
      </div>
    </header>
  );
}
