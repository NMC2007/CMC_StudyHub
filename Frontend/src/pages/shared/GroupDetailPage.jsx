/**
 * GroupDetailPage.jsx
 * Trang Chi tiết Nhóm học tập — Route: "/groups/:id".
 *
 * Tính năng (STUDYHUB_FE.md Mục 14):
 *  - 2 Tab quản lý:
 *      1. Tài liệu nhóm (`documents`): Hiển thị tài liệu chia sẻ riêng trong nhóm (visibility = GROUP). Hỗ trợ nút "Chia sẻ tài liệu vào nhóm" (`ShareToGroupModal`).
 *      2. Thành viên (`members`): Danh sách thành viên trong nhóm, hiển thị vai trò Trưởng nhóm / Thành viên (`MemberItem`). Trưởng nhóm/Owner có nút thêm (`AddMemberModal`) và xóa thành viên (`useRemoveMember`).
 *  - Đồng bộ Tab với URL query parameters (`/groups/:id?tab=documents|members`).
 */
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import {
  Users,
  BookOpen,
  Share2,
  UserPlus,
  ArrowLeft,
  Crown,
  Calendar,
} from 'lucide-react';

import { useAuthStore } from '#/stores/useAuthStore';
import PageWrapper from '#/components/layout/PageWrapper';
import Tabs from '#/components/ui/Tabs';
import Button from '#/components/ui/Button';
import Skeleton from '#/components/ui/Skeleton';
import EmptyState from '#/components/ui/EmptyState';
import Pagination from '#/components/ui/Pagination';

import DocumentCard from '#/components/document/DocumentCard';
import MemberItem from '#/components/group/MemberItem';
import AddMemberModal from '#/components/group/AddMemberModal';
import ShareToGroupModal from '#/components/group/ShareToGroupModal';

import {
  useGroupDetail,
  useGroupDocuments,
  useRemoveMember,
} from '#/hooks/useGroups';
import { formatDate } from '#/utils/formatters';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [searchParams, setSearchParams] = useSearchParams();

  const urlTab = searchParams.get('tab') === 'members' ? 'members' : 'documents';
  const [activeTab, setActiveTab] = useState(urlTab);
  const [docPage, setDocPage] = useState(1);

  // Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isShareDocOpen, setIsShareDocOpen] = useState(false);

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // 1. Fetch chi tiết Nhóm
  const { data: group, isLoading: groupLoading } = useGroupDetail(id);

  // 2. Fetch Tài liệu nhóm
  const { data: docsData, isLoading: docsLoading } = useGroupDocuments(id, {
    page: docPage,
    limit: 12,
  });

  // 3. Mutation xóa thành viên
  const removeMemberMutation = useRemoveMember(id);

  const isOwner =
    user &&
    group &&
    (user.id === group.owner_id ||
      user.id === group.owner?.id ||
      user.role === 'ADMIN');

  const membersList = Array.isArray(group?.members) ? group.members : [];
  const memberCount = typeof group?.member_count === 'number' ? group.member_count : membersList.length;

  const tabsConfig = [
    {
      id: 'documents',
      label: 'Tài liệu nhóm',
      icon: BookOpen,
      count: docsData?.total || 0,
    },
    {
      id: 'members',
      label: 'Thành viên',
      icon: Users,
      count: memberCount,
    },
  ];

  if (groupLoading) {
    return (
      <PageWrapper title="Chi tiết nhóm">
        <div className="flex flex-col gap-6">
          <Skeleton height="h-44" className="rounded-2xl" />
          <Skeleton height="h-96" className="rounded-2xl" />
        </div>
      </PageWrapper>
    );
  }

  if (!group) {
    return (
      <PageWrapper title="Nhóm không tồn tại">
        <EmptyState
          title="Không tìm thấy nhóm học tập"
          message="Nhóm học tập này có thể đã bị giải tán hoặc bạn không có quyền truy cập."
          actionText="Quay lại danh sách nhóm"
          onAction={() => navigate('/groups')}
          icon={Users}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={`Nhóm: ${group.name}`}>
      {/* Back Link */}
      <button
        type="button"
        onClick={() => navigate('/groups')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-student mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Danh sách nhóm
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-brand-student/10 via-white to-white rounded-2xl p-6 md:p-8 border border-brand-student/15 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-brand-student text-white flex items-center justify-center shrink-0 shadow-md">
            <Users className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 break-words">
              {group.name}
            </h1>
            {group.description && (
              <p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
                {group.description}
              </p>
            )}

            <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200/60">
              <span className="flex items-center gap-1.5 font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                Trưởng nhóm: {group.owner?.full_name || group.owner?.username || 'Owner'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Đã tạo: {formatDate(group.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-start md:justify-end">
          <Button
            type="button"
            icon={Share2}
            onClick={() => setIsShareDocOpen(true)}
            size="sm"
            className="shadow-sm"
          >
            Chia sẻ tài liệu
          </Button>

          {isOwner && (
            <Button
              type="button"
              icon={UserPlus}
              variant="secondary"
              onClick={() => setIsAddMemberOpen(true)}
              size="sm"
            >
              Thêm thành viên
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Control */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6">
        <Tabs
          tabs={tabsConfig}
          activeTab={activeTab}
          onChange={handleTabChange}
          variant="pills"
        />
      </div>

      {/* TAB 1: TÀI LIỆU NHÓM */}
      {activeTab === 'documents' && (
        <div className="flex flex-col gap-6">
          {docsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <Skeleton key={key} height="h-44" className="rounded-2xl" />
              ))}
            </div>
          ) : !docsData?.documents || docsData.documents.length === 0 ? (
            <EmptyState
              title="Nhóm chưa có tài liệu nào"
              message="Chưa có thành viên nào chia sẻ tài liệu vào nhóm này. Hãy bấm Chia sẻ tài liệu để đóng góp giáo trình hoặc bài tập ngay."
              actionText="Chia sẻ tài liệu đầu tiên"
              onAction={() => setIsShareDocOpen(true)}
              icon={BookOpen}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docsData.documents.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>

              {docsData.totalPages > 1 && (
                <Pagination
                  page={docsData.page || docPage}
                  totalPages={docsData.totalPages}
                  totalItems={docsData.total}
                  onPageChange={(p) => setDocPage(p)}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: THÀNH VIÊN NHÓM */}
      {activeTab === 'members' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-700">
              Danh sách thành viên ({membersList.length})
            </span>
            {isOwner && (
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Bạn đang có quyền Trưởng nhóm
              </span>
            )}
          </div>

          {membersList.length === 0 ? (
            <EmptyState
              title="Chưa tải được danh sách thành viên"
              message="Danh sách thành viên đang trống."
              icon={Users}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {membersList.map((member) => (
                <MemberItem
                  key={member.id || member.user?.id}
                  member={member}
                  isCurrentUserLeader={isOwner}
                  currentUserId={user?.id}
                  onRemove={(userId) => removeMemberMutation.mutate(userId)}
                  isRemoving={removeMemberMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        group={group}
      />

      <ShareToGroupModal
        isOpen={isShareDocOpen}
        onClose={() => setIsShareDocOpen(false)}
        group={group}
      />
    </PageWrapper>
  );
}
