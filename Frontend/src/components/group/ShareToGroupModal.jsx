/**
 * ShareToGroupModal.jsx
 * Modal cho phép thành viên chia sẻ tài liệu cá nhân của mình vào Nhóm học tập (`shareDocumentToGroup`).
 *
 * Tính năng:
 *  - Tải danh sách tài liệu cá nhân của user hiện tại (`useMyDocuments`).
 *  - Cho phép chọn 1 tài liệu và bấm Chia sẻ (`useShareDocumentToGroup`).
 */
import React, { useState } from 'react';
import { Share2, FileText, CheckCircle2 } from 'lucide-react';

import Modal from '#/components/ui/Modal';
import Button from '#/components/ui/Button';
import Skeleton from '#/components/ui/Skeleton';
import EmptyState from '#/components/ui/EmptyState';
import { useMyDocuments } from '#/hooks/useDocuments';
import { useShareDocumentToGroup } from '#/hooks/useGroups';

export default function ShareToGroupModal({
  isOpen = false,
  onClose = () => {},
  group = null,
}) {
  const [selectedDocId, setSelectedDocId] = useState(null);

  const { data: myDocsData, isLoading } = useMyDocuments({ page: 1, limit: 100 });
  const shareMutation = useShareDocumentToGroup(group?.id);

  if (!group) return null;

  const handleShare = () => {
    if (!selectedDocId) return;

    shareMutation.mutate(
      { document_id: selectedDocId },
      {
        onSuccess: () => {
          setSelectedDocId(null);
          onClose();
        },
      }
    );
  };

  const documents = myDocsData?.documents || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={shareMutation.isPending ? undefined : onClose}
      title={`Chia sẻ tài liệu vào "${group.name}"`}
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
            disabled={!selectedDocId || shareMutation.isPending}
            loading={shareMutation.isPending}
          >
            Chia sẻ vào nhóm
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs text-slate-500">
          Chọn một tài liệu trong kho tài liệu cá nhân của bạn để chia sẻ cho các thành viên trong nhóm <strong>{group.name}</strong> cùng thảo luận:
        </p>

        {isLoading ? (
          <div className="flex flex-col gap-2 py-4">
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} height="h-14" className="rounded-xl" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            title="Kho tài liệu trống"
            message="Bạn chưa có tài liệu cá nhân nào để chia sẻ. Hãy tải lên tài liệu mới trước nhé."
            icon={FileText}
          />
        ) : (
          <div className="max-h-64 overflow-y-auto pr-1 flex flex-col gap-2 my-1">
            {documents.map((doc) => {
              const isSelected = selectedDocId === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-brand-student bg-brand-student/5 ring-1 ring-brand-student shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-brand-student text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {doc.document_type || 'DOCUMENT'} • {doc.file_name || 'Đính kèm'}
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
    </Modal>
  );
}
