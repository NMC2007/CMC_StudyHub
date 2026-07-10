/**
 * UserStatusModal.jsx
 * Modal cho phép Quản trị viên thay đổi trạng thái tài khoản người dùng (ACTIVE | INACTIVE | BANNED).
 */
import React, { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle2, AlertTriangle, Ban, UserCheck } from "lucide-react";
import Modal from "#/components/ui/Modal";
import Button from "#/components/ui/Button";
import { useUpdateUserStatus } from "#/hooks/useAdmin";

const STATUS_OPTIONS = [
  {
    value: "ACTIVE",
    label: "Hoạt động (ACTIVE)",
    description: "Tài khoản bình thường, được phép đăng nhập và sử dụng toàn bộ tính năng theo quyền hạn.",
    icon: UserCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    value: "INACTIVE",
    label: "Tạm ngừng (INACTIVE)",
    description: "Tạm khóa tài khoản. Người dùng không thể đăng nhập hoặc tiếp tục phiên làm việc hiện tại.",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    value: "BANNED",
    label: "Khóa vĩnh viễn (BANNED)",
    description: "Đình chỉ hoàn toàn tài khoản do vi phạm quy chế. Toàn bộ Refresh Token sẽ bị thu hồi ngay lập tức.",
    icon: Ban,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

export default function UserStatusModal({ isOpen, onClose, user }) {
  const [selectedStatus, setSelectedStatus] = useState("ACTIVE");
  const updateMutation = useUpdateUserStatus();

  useEffect(() => {
    if (user?.status) {
      setSelectedStatus(user.status);
    } else {
      setSelectedStatus("ACTIVE");
    }
  }, [user, isOpen]);

  if (!user) return null;

  const handleSave = async () => {
    if (selectedStatus === user.status) {
      onClose();
      return;
    }

    try {
      await updateMutation.mutateAsync({
        userId: user.id,
        status: selectedStatus,
      });
      onClose();
    } catch {
      // lỗi đã được bẫy trong hook và hiện toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý Trạng thái Tài khoản"
      size="md"
    >
      <div className="space-y-4">
        {/* User Profile Info */}
        <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="w-11 h-11 rounded-full bg-brand-admin/10 flex items-center justify-center font-bold text-brand-admin text-base shrink-0">
            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-text-primary truncate">
              {user.full_name || user.username}
            </h4>
            <p className="text-xs text-text-secondary truncate">
              @{user.username} • <span className="font-mono">{user.email}</span>
            </p>
          </div>
          <div className="ml-auto shrink-0 text-right">
            <span className="text-[11px] uppercase font-bold tracking-wide px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
              {user.role || "STUDENT"}
            </span>
          </div>
        </div>

        {/* Status Selection List */}
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2.5">
            Chọn trạng thái tài khoản:
          </label>
          <div className="space-y-2.5">
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedStatus === opt.value;

              return (
                <div
                  key={opt.value}
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? `${opt.borderColor} ${opt.bgColor}`
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-white shadow-xs" : "bg-slate-100"
                    } ${opt.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-bold ${isSelected ? opt.color : "text-text-primary"}`}>
                        {opt.label}
                      </p>
                      {isSelected && <CheckCircle2 className={`w-4 h-4 ${opt.color}`} />}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notice Alert */}
        {selectedStatus !== "ACTIVE" && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Lưu ý quan trọng:</strong> Nếu đổi trạng thái sang{" "}
              <strong>{selectedStatus}</strong>, hệ thống sẽ tự động thu hồi toàn bộ Refresh Token active trong Database và từ chối mọi yêu cầu truy cập từ người dùng này.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSave}
            loading={updateMutation.isPending}
            disabled={selectedStatus === user.status && !updateMutation.isPending}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
}
