/**
 * AddMemberModal.jsx
 * Modal chọn và thêm thành viên mới vào Nhóm học tập (User Search & Multi-Select Picker).
 *
 * Tính năng:
 *  - Tìm kiếm người dùng theo từ khóa: Họ tên, Mã định danh (MSSV/MSGV), Email, Username, SĐT (debounce 400ms).
 *  - Bộ lọc nhanh vai trò: Tất cả | Sinh viên | Giảng viên.
 *  - Tích chọn nhiều người dùng cùng lúc (Multi-select) với thanh chip rà soát phía trên.
 *  - Tự động nhận diện thành viên đã tham gia nhóm hoặc Trưởng nhóm để khóa Checkbox và hiển thị huy hiệu "Đã tham gia".
 *  - Cuộn dọc mượt mà (`max-h-[380px] overflow-y-auto`) với giới hạn tải tối đa 100 kết quả từ Backend.
 */
import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  X,
  Users,
  Check,
  Crown,
  User,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import Modal from '#/components/ui/Modal';
import Button from '#/components/ui/Button';
import Badge from '#/components/ui/Badge';
import Skeleton from '#/components/ui/Skeleton';
import EmptyState from '#/components/ui/EmptyState';

import { useAddMembers } from '#/hooks/useGroups';
import { useSearchUsers } from '#/hooks/useUsers';
import { useDebounce } from '#/hooks/useDebounce';
import { getAvatarUrl } from '#/utils/formatters';

export default function AddMemberModal({
  isOpen = false,
  onClose = () => {},
  group = null,
}) {
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Trì hoãn gửi request tìm kiếm 400ms sau khi ngừng gõ
  const debouncedKeyword = useDebounce(keyword, 400);

  // Truy vấn danh sách người dùng từ API /users/search (giới hạn 100 cao nhất từ DB)
  const {
    data: searchData,
    isPending: isSearchPending,
    isFetching: isSearchFetching,
  } = useSearchUsers(
    {
      q: debouncedKeyword.trim() ? debouncedKeyword.trim() : undefined,
      role: roleFilter !== 'ALL' ? roleFilter : undefined,
      limit: 100,
    },
    { enabled: isOpen }
  );

  const addMembersMutation = useAddMembers(group?.id);

  // Parse danh sách người dùng từ response
  const usersList = useMemo(() => {
    if (!searchData) return [];
    if (Array.isArray(searchData.users)) return searchData.users;
    if (Array.isArray(searchData)) return searchData;
    return [];
  }, [searchData]);

  // Map các ID đã là thành viên trong nhóm để khóa Checkbox
  const existingMembersMap = useMemo(() => {
    const map = new Set();
    if (!group) return map;

    // Trưởng nhóm
    if (group.owner_id) map.add(Number(group.owner_id));
    if (group.owner?.id) map.add(Number(group.owner.id));

    // Thành viên hiện tại
    if (Array.isArray(group.members)) {
      group.members.forEach((m) => {
        const uid = m.user?.id || m.id;
        if (uid) map.add(Number(uid));
      });
    }
    return map;
  }, [group]);

  if (!group) return null;

  // Xử lý toggle chọn/bỏ chọn 1 người dùng
  const handleToggleSelect = (userItem) => {
    if (existingMembersMap.has(Number(userItem.id))) return;
    setErrorMsg('');

    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u.id === userItem.id);
      if (exists) {
        return prev.filter((u) => u.id !== userItem.id);
      }
      return [...prev, userItem];
    });
  };

  // Xóa 1 user khỏi danh sách chip đã chọn
  const handleRemoveSelected = (userId, e) => {
    e?.stopPropagation();
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Xóa toàn bộ danh sách đã chọn
  const handleClearAll = () => {
    setSelectedUsers([]);
  };

  // Đóng Modal và reset state
  const handleCloseModal = () => {
    if (addMembersMutation.isPending) return;
    setKeyword('');
    setRoleFilter('ALL');
    setSelectedUsers([]);
    setErrorMsg('');
    onClose();
  };

  // Submit thêm các thành viên vào nhóm
  const handleSubmit = (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (selectedUsers.length === 0) {
      setErrorMsg('Vui lòng tích chọn ít nhất 1 người dùng để thêm vào nhóm.');
      return;
    }

    const userIds = selectedUsers.map((u) => Number(u.id));

    addMembersMutation.mutate(
      { user_ids: userIds },
      {
        onSuccess: () => {
          handleCloseModal();
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.message ||
            'Không thể thêm thành viên vào nhóm. Vui lòng thử lại sau.';
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={`Thêm thành viên vào "${group.name}"`}
      size="md"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="text-xs font-semibold text-slate-500">
            {selectedUsers.length > 0 ? (
              <span>
                Đã chọn: <strong className="text-brand-student">{selectedUsers.length}</strong> người
              </span>
            ) : (
              <span>Chưa chọn người dùng nào</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              disabled={addMembersMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              icon={UserPlus}
              onClick={handleSubmit}
              loading={addMembersMutation.isPending}
              disabled={selectedUsers.length === 0}
            >
              Thêm ({selectedUsers.length}) vào nhóm
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* 1. HEADER SEARCH & FILTER */}
        <div className="flex flex-col gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, mã số (MSSV/MSGV), email hoặc username..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              disabled={addMembersMutation.isPending}
              className="w-full pl-10 pr-9 py-2.5 text-xs text-slate-800 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-student/20 focus:border-brand-student transition-all placeholder:text-slate-400"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Xóa từ khóa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs">
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'STUDENT', label: 'Sinh viên' },
                { id: 'LECTURER', label: 'Giảng viên' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRoleFilter(tab.id)}
                  disabled={addMembersMutation.isPending}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    roleFilter === tab.id
                      ? 'bg-white text-brand-student shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isSearchFetching && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-student" />
                <span>Đang tải...</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. SELECTED USERS CHIPS BAR */}
        {selectedUsers.length > 0 && (
          <div className="bg-brand-student/5 border border-brand-student/15 rounded-xl p-3 flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-brand-student-dark flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Thành viên chuẩn bị thêm ({selectedUsers.length}):
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:underline transition-colors cursor-pointer"
              >
                Bỏ chọn tất cả
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 max-h-[90px] overflow-y-auto pr-1">
              {selectedUsers.map((u) => {
                const avatarUrl = getAvatarUrl(u.avatar || u.avatar_url);
                return (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 bg-white border border-slate-200/80 shadow-2xs rounded-lg text-xs font-semibold text-slate-700 hover:border-brand-student transition-colors group"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={u.full_name}
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold shrink-0">
                        {u.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="max-w-[120px] truncate">
                      {u.full_name || u.username}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSelected(u.id, e)}
                      className="p-0.5 text-slate-400 group-hover:text-red-500 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                      title="Xóa khỏi danh sách"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. ERROR MESSAGE IF ANY */}
        {errorMsg && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 4. USER SEARCH RESULTS LIST */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Danh sách người dùng ({usersList.length})</span>
            <span>Trạng thái</span>
          </div>

          <div className="max-h-[380px] overflow-y-auto pr-1 flex flex-col gap-2 border border-slate-200/60 rounded-xl p-2 bg-slate-50/40">
            {isSearchPending ? (
              // Loading Skeleton
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4, 5].map((key) => (
                  <Skeleton key={key} height="h-14" className="rounded-xl" />
                ))}
              </div>
            ) : usersList.length === 0 ? (
              // Empty State
              <div className="py-8">
                <EmptyState
                  title="Không tìm thấy người dùng phù hợp"
                  message={
                    keyword
                      ? `Không có kết quả nào khớp với từ khóa "${keyword}".`
                      : 'Không có người dùng nào để hiển thị.'
                  }
                  icon={Search}
                />
              </div>
            ) : (
              // User Rows
              usersList.map((userItem) => {
                const isAlreadyMember = existingMembersMap.has(Number(userItem.id));
                const isSelected = selectedUsers.some((u) => u.id === userItem.id);
                const isOwner =
                  Number(userItem.id) === Number(group.owner_id || group.owner?.id);
                const avatarUrl = getAvatarUrl(userItem.avatar || userItem.avatar_url);

                return (
                  <div
                    key={userItem.id}
                    onClick={() => !isAlreadyMember && handleToggleSelect(userItem)}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                      isAlreadyMember
                        ? 'bg-slate-100/70 border-slate-200/80 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-brand-student/5 border-brand-student shadow-xs cursor-pointer'
                        : 'bg-white border-slate-200/80 hover:border-brand-student/40 hover:shadow-2xs cursor-pointer'
                    }`}
                  >
                    {/* Left: Checkbox + Avatar + Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isAlreadyMember
                            ? 'bg-slate-200 border-slate-300 text-slate-400'
                            : isSelected
                            ? 'bg-brand-student border-brand-student text-white shadow-2xs'
                            : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden relative">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={userItem.full_name || 'User'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling)
                                e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            avatarUrl ? 'hidden' : ''
                          }`}
                        >
                          {userItem.full_name?.charAt(0).toUpperCase() ||
                            userItem.username?.charAt(0).toUpperCase() || (
                              <User className="w-4 h-4 text-slate-500" />
                            )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {userItem.full_name || userItem.username}
                          </h4>
                          {userItem.code && (
                            <span className="text-[10px] font-semibold font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                              #{userItem.code}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {userItem.email || `@${userItem.username}`}
                        </p>
                      </div>
                    </div>

                    {/* Right: Role Badge & Membership Status */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="role" value={userItem.role} size="sm" />

                      {isAlreadyMember && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300/80 whitespace-nowrap">
                          {isOwner ? 'Trưởng nhóm' : 'Đã tham gia'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
