/**
 * AddMemberModal.jsx
 * Modal cho phép Trưởng nhóm/Owner thêm thành viên mới vào Nhóm học tập.
 *
 * Tính năng:
 *  - Nhập danh sách Mã người dùng (User ID) cần thêm, cách nhau bởi dấu phẩy (`2, 5, 12`).
 *  - Xử lý chuyển đổi chuỗi sang mảng số nguyên (`user_ids: number[]`), lọc ID trùng và ID không hợp lệ.
 *  - Gọi mutation `useAddMembers(groupId)`.
 */
import React, { useState } from 'react';
import { UserPlus, Hash, AlertCircle } from 'lucide-react';

import Modal from '#/components/ui/Modal';
import Button from '#/components/ui/Button';
import Input from '#/components/ui/Input';
import { useAddMembers } from '#/hooks/useGroups';

export default function AddMemberModal({
  isOpen = false,
  onClose = () => {},
  group = null,
}) {
  const [idsInput, setIdsInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const addMembersMutation = useAddMembers(group?.id);

  if (!group) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (!idsInput.trim()) {
      setErrorMsg('Vui lòng nhập ít nhất 1 Mã thành viên (User ID).');
      return;
    }

    // Tách chuỗi theo dấu phẩy hoặc dấu cách, parse thành số nguyên dương
    const parsedIds = idsInput
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => Number(s))
      .filter((num) => Number.isInteger(num) && num > 0);

    // Loại bỏ ID trùng lặp
    const uniqueIds = Array.from(new Set(parsedIds));

    if (uniqueIds.length === 0) {
      setErrorMsg('Các ID bạn nhập không hợp lệ. Vui lòng nhập các số nguyên dương cách nhau bằng dấu phẩy (VD: 5, 12, 20).');
      return;
    }

    // Kiểm tra không cho phép tự thêm ID của chủ nhóm nếu đã có
    addMembersMutation.mutate(
      { user_ids: uniqueIds },
      {
        onSuccess: () => {
          setIdsInput('');
          setErrorMsg('');
          onClose();
        },
        onError: (err) => {
          const msg = err?.response?.data?.message || 'Không thể thêm thành viên. Vui lòng kiểm tra lại ID.';
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={addMembersMutation.isPending ? undefined : onClose}
      title={`Thêm thành viên vào "${group.name}"`}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={addMembersMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            icon={UserPlus}
            onClick={handleSubmit}
            loading={addMembersMutation.isPending}
          >
            Thêm vào nhóm
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
          💡 <strong className="text-slate-800">Hướng dẫn:</strong> Mỗi tài khoản Sinh viên/Giảng viên trên hệ thống đều có một Mã số cá nhân (<strong>#ID</strong>). Hãy nhập các ID cần thêm, ngăn cách nhau bằng dấu phẩy.
        </div>

        <Input
          label="Mã tài khoản thành viên (User IDs)"
          placeholder="Ví dụ: 5, 12, 18, 25..."
          icon={Hash}
          value={idsInput}
          onChange={(e) => {
            setIdsInput(e.target.value);
            if (errorMsg) setErrorMsg('');
          }}
          disabled={addMembersMutation.isPending}
        />

        {errorMsg && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </Modal>
  );
}
