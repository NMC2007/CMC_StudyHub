/**
 * ShareDocToGroupModal.jsx
 * Modal hiển thị danh sách các Nhóm học tập (`useMyGroups`) cho phép người dùng
 * chọn 1 nhóm và chia sẻ tài liệu hiện tại (`document`) vào nhóm đó thông qua `useShareDocumentToGroup`.
 */
import React, { useState } from 'react';
import { Share2, Users, CheckCircle2, BookOpen } from 'lucide-react';

import Modal from '#/components/ui/Modal';
import Button from '#/components/ui/Button';
import Skeleton from '#/components/ui/Skeleton';
import EmptyState from '#/components/ui/EmptyState';
import { useMyGroups, useShareDocumentToGroup } from '#/hooks/useGroups';

export default function ShareDocToGroupModal({
  isOpen = false,
  onClose = () => {},
  document: doc = null,
}) {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const { data: myGroupsData, isLoading } = useMyGroups();
  const shareMutation = useShareDocumentToGroup();

  if (!doc) return null;

  const groups = Array.isArray(myGroupsData?.groups)
    ? myGroupsData.groups
    : Array.isArray(myGroupsData)
    ? myGroupsData
    : [];

  const handleShare = () => {
    if (!selectedGroupId) return;

    shareMutation.mutate(
      { groupId: selectedGroupId, document_id: doc.id },
      {
        onSuccess: () => {
          setSelectedGroupId(null);
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={shareMutation.isPending ? undefined : onClose}
      title="Chia sẻ tài liệu vào nhóm"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={shareMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            icon={Share2}
            onClick={handleShare}
            disabled={!selectedGroupId || shareMutation.isPending}
            loading={shareMutation.isPending}
          >
            Chia sẻ vào nhóm
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Document Info Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-student/10 text-brand-student flex items-center justify-center shrink-0 font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">
              {doc.title}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Loại: <span className="font-semibold text-slate-700">{doc.document_type || 'DOCUMENT'}</span> • Phạm vi hiện tại: <span className="font-semibold text-slate-700">{doc.visibility || 'PUBLIC'}</span>
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Chọn nhóm học tập muốn chia sẻ tới:
          </label>

          {isLoading ? (
            <div className="flex flex-col gap-2.5 py-2">
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} height="h-16" className="rounded-xl" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <EmptyState
              title="Chưa tham gia nhóm nào"
              message="Bạn chưa có hoặc chưa tham gia nhóm học tập nào. Hãy tạo hoặc gia nhập một nhóm trước khi chia sẻ tài liệu nhé."
              icon={Users}
            />
          ) : (
            <div className="max-h-64 overflow-y-auto pr-1 flex flex-col gap-2">
              {groups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                const memberCount = typeof group.member_count === 'number'
                  ? group.member_count
                  : Array.isArray(group.members)
                  ? group.members.length
                  : 1;

                return (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-brand-student bg-brand-student/5 ring-1 ring-brand-student shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                          isSelected
                            ? 'bg-brand-student text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Users className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {group.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {memberCount} thành viên • Trưởng nhóm: {group.owner?.full_name || group.owner?.username || 'Bạn'}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-brand-student shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
