/**
 * GroupCard.jsx
 * Component Card hiển thị thông tin Nhóm học tập (Study Group).
 *
 * Tính năng:
 *  - Hiển thị tên nhóm, mô tả, số lượng thành viên (`Users`), trưởng nhóm (`Crown`/`User`), ngày tạo.
 *  - Phân quyền Owner/Admin: Dropdown menu quản lý nhóm (Thêm/xóa thành viên, Giải tán nhóm).
 *  - Nút Xem chi tiết chuyển sang trang chi tiết nhóm.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Users, Crown, Calendar, MoreVertical, UserPlus, Trash2, ChevronRight, BookOpen } from 'lucide-react';
import { useAuthStore } from '#/stores/useAuthStore';
import { formatDate } from '#/utils/formatters';

const GroupCard = ({
  group,
  onViewDetail,
  onManageMembers,
  onDisband,
  className = '',
}) => {
  if (!group) return null;

  const user = useAuthStore((state) => state.user);
  const isOwner =
    user &&
    (user.id === group.owner_id ||
      user.id === group.owner?.id ||
      user.role === 'ADMIN');

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const memberCount = typeof group.member_count === 'number'
    ? group.member_count
    : Array.isArray(group.members)
      ? group.members.length
      : 1;

  return (
    <div
      onClick={() => onViewDetail && onViewDetail(group)}
      className={`group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer select-none ${className}`.trim()}
    >
      {/* Top Header: Group Avatar/Icon & Owner Menu */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-student-light flex items-center justify-center text-brand-student font-bold text-lg shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3
              className="text-base font-bold text-slate-800 group-hover:text-brand-student transition-colors line-clamp-1"
              title={group.name}
            >
              {group.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1 font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Users className="w-3 h-3" />
                {memberCount} thành viên
              </span>
            </div>
          </div>
        </div>

        {/* Owner Menu */}
        {isOwner && (
          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Menu thao tác nhóm"
            >
              <MoreVertical className="w-4.5 h-4.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-150">
                {onManageMembers && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onManageMembers(group);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                    Quản lý thành viên
                  </button>
                )}
                {onDisband && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDisband(group);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Giải tán nhóm
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body: Description */}
      {group.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-0">
          {group.description}
        </p>
      )}

      {/* Footer: Owner info & Date + Action CTA */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-medium text-slate-700 truncate">
            {group.owner?.full_name || group.owner?.username || 'Trưởng nhóm'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="shrink-0">{formatDate(group.created_at)}</span>
        </div>

        <div className="flex items-center gap-0.5 text-brand-student font-semibold text-xs group-hover:translate-x-0.5 transition-transform shrink-0">
          <span>Chi tiết</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(GroupCard);
