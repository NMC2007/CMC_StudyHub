/**
 * GroupsPage.jsx
 * Trang danh sách Nhóm học tập cá nhân & lớp học — Route: "/groups".
 *
 * Tính năng (STUDYHUB_FE.md Mục 14 & 20):
 *  - Hiển thị toàn bộ nhóm mà Sinh viên/Giảng viên đang tham gia hoặc sở hữu (`useMyGroups`).
 *  - Hỗ trợ tìm kiếm nhanh tên nhóm ngay trên giao diện client.
 *  - Nút "Tạo nhóm mới" mở `CreateGroupModal`.
 *  - Thao tác trên từng nhóm (`GroupCard`): Xem chi tiết (`/groups/:id`), Quản lý thành viên, Giải tán nhóm (với quyền Owner/Admin).
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Users, Plus, Search } from 'lucide-react';

import PageWrapper from '#/components/layout/PageWrapper';
import Button from '#/components/ui/Button';
import Input from '#/components/ui/Input';
import Skeleton from '#/components/ui/Skeleton';
import EmptyState from '#/components/ui/EmptyState';
import ConfirmModal from '#/components/ui/ConfirmModal';

import GroupCard from '#/components/group/GroupCard';
import CreateGroupModal from '#/components/group/CreateGroupModal';
import { useMyGroups, useDisbandGroup } from '#/hooks/useGroups';
import { useDebounce } from '#/hooks/useDebounce';

export default function GroupsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 200);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [groupToDisband, setGroupToDisband] = useState(null);

  const { data: myGroupsData, isLoading } = useMyGroups();
  const disbandMutation = useDisbandGroup();

  const groups = Array.isArray(myGroupsData) ? myGroupsData : (myGroupsData?.groups || []);

  // Lọc tìm kiếm nhóm trên client / server sau khi debounce 200ms
  const filteredGroups = React.useMemo(() => {
    if (!debouncedQuery.trim()) return groups;
    const q = debouncedQuery.toLowerCase().trim();
    return groups.filter(
      (g) =>
        (g.name && g.name.toLowerCase().includes(q)) ||
        (g.description && g.description.toLowerCase().includes(q))
    );
  }, [groups, debouncedQuery]);

  const handleConfirmDisband = () => {
    if (!groupToDisband) return;
    disbandMutation.mutate(groupToDisband.id, {
      onSuccess: () => {
        setGroupToDisband(null);
      },
    });
  };

  return (
    <PageWrapper title="Nhóm học tập">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-student" />
            Nhóm học tập & Lớp môn học
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tạo không gian riêng để thảo luận kiến thức, chia sẻ tài liệu cùng lớp học hoặc bạn bè.
          </p>
        </div>

        <Button
          type="button"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto shrink-0"
        >
          Tạo nhóm học tập mới
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm mb-6 flex items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Tìm kiếm nhóm của bạn theo tên hoặc mô tả..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 hidden sm:block shrink-0">
          Tổng cộng: <strong className="text-slate-800">{groups.length}</strong> nhóm
        </div>
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <Skeleton key={key} height="h-48" className="rounded-2xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          title="Bạn chưa tham gia nhóm học tập nào"
          message="Khởi tạo hoặc tham gia nhóm học tập để dễ dàng chia sẻ tài liệu và quản lý tiến độ thảo luận cùng bạn bè."
          actionText="Tạo nhóm ngay"
          onAction={() => setIsCreateOpen(true)}
          icon={Users}
        />
      ) : filteredGroups.length === 0 ? (
        <EmptyState
          title="Không tìm thấy nhóm phù hợp"
          message={`Không có nhóm nào trùng khớp với từ khóa "${searchQuery}". Hãy thử từ khóa khác.`}
          actionText="Xóa từ khóa"
          onAction={() => setSearchQuery('')}
          icon={Search}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onViewDetail={(g) => navigate(`/groups/${g.id}`)}
              onManageMembers={(g) => navigate(`/groups/${g.id}?tab=members`)}
              onDisband={(g) => setGroupToDisband(g)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateGroupModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Confirm Disband Modal */}
      <ConfirmModal
        isOpen={!!groupToDisband}
        onClose={() => setGroupToDisband(null)}
        onConfirm={handleConfirmDisband}
        title="Xác nhận giải tán nhóm"
        description={`Bạn có chắc chắn muốn giải tán nhóm "${groupToDisband?.name || ''}"? Toàn bộ dữ liệu thành viên và liên kết tài liệu trong nhóm sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        confirmText="Giải tán nhóm"
        cancelText="Hủy bỏ"
        variant="danger"
        loading={disbandMutation.isPending}
      />
    </PageWrapper>
  );
}
