/**
 * MemberItem.jsx
 * Component hiển thị thông tin 1 thành viên trong Nhóm học tập.
 *
 * Tính năng:
 *  - Hiển thị Avatar, họ tên (`full_name`), username và email.
 *  - Badge vai trò: Trưởng nhóm (`LEADER`) màu vàng hoặc Thành viên (`MEMBER`) màu xanh nhạt.
 *  - Phân quyền Leader: Nếu người dùng hiện tại là Trưởng nhóm/Owner và thành viên không phải chính họ, hiển thị nút "Xóa khỏi nhóm" (`onRemove`).
 */
import React from "react";
import { User, Crown, UserMinus } from "lucide-react";

const MemberItem = ({
  member,
  isCurrentUserLeader = false,
  currentUserId,
  onRemove,
  isRemoving = false,
  className = "",
}) => {
  if (!member) return null;

  // Lấy thông tin user (hỗ trợ cả cấu trúc member.user và member trực tiếp)
  const userObj = member.user || member;
  const isLeader =
    member.role === "LEADER" ||
    member.is_leader ||
    userObj.id === member.owner_id;
  const isSelf = currentUserId === userObj.id;

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors ${className}`.trim()}
    >
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
            isLeader
              ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {isLeader ? (
            <Crown className="w-5 h-5 text-amber-600" />
          ) : (
            userObj.full_name?.charAt(0).toUpperCase() ||
            userObj.username?.charAt(0).toUpperCase() || (
              <User className="w-5 h-5" />
            )
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800 truncate">
              {userObj.full_name || userObj.username}
            </h4>
            {isSelf && (
              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                Bạn
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate">
            {userObj.email || `@${userObj.username}`}
          </p>
        </div>
      </div>

      {/* Right: Role Badge & Remove Action */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            isLeader
              ? "bg-amber-100 text-amber-800 border border-amber-200"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {isLeader ? "Trưởng nhóm" : "Thành viên"}
        </span>

        {/* Nút Xóa thành viên (Chỉ Trưởng nhóm mới có quyền xóa thành viên khác) */}
        {isCurrentUserLeader && !isLeader && !isSelf && onRemove && (
          <button
            type="button"
            onClick={() => onRemove(userObj.id || member.id)}
            disabled={isRemoving}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
            title="Xóa thành viên khỏi nhóm"
          >
            <UserMinus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(MemberItem);
