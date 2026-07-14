/**
 * CronPage.jsx
 * Trang Quản lý Bảo trì Hệ thống & Kích hoạt Cron Jobs thủ công (`/admin/cron`).
 *
 * Tính năng:
 *  1. Dọn dẹp Thùng rác mềm (`/admin/cron/trigger/trash-cleanup`): Nhập số ngày (`days`), xóa file và bản ghi DB.
 *  2. Dọn dẹp Refresh Token hết hạn (`/admin/cron/trigger/token-cleanup`): Xóa các token quá hạn hoặc bị trục xuất.
 *  3. Giám sát tài nguyên máy chủ trước/sau khi thực hiện tác vụ nặng (`SystemHealthCard`).
 *
 * Tuân thủ: STUDYHUB_FE.md mục 8.9 / 6.4 (Bảo trì Hệ thống & Cron-jobs).
 */
import React, { useState } from "react";
import {
  Clock,
  Trash2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  Info,
} from "lucide-react";

import PageWrapper from "#/components/layout/PageWrapper";
import Button from "#/components/ui/Button";
import SystemHealthCard from "#/components/admin/SystemHealthCard";
import { useCronTriggers } from "#/hooks/useAdmin";

export default function CronPage() {
  const [trashDays, setTrashDays] = useState(15);
  const [trashResult, setTrashResult] = useState(null);
  const [tokenResult, setTokenResult] = useState(null);

  const { triggerTrashCleanup, triggerTokenCleanup } = useCronTriggers();

  const handleRunTrashCleanup = async () => {
    setTrashResult(null);
    try {
      const res = await triggerTrashCleanup.mutateAsync({
        days: trashDays !== "" && !isNaN(trashDays) ? Number(trashDays) : 15,
      });
      setTrashResult({
        success: true,
        count: res?.deleted_count || 0,
        message: res?.message || `Đã dọn dẹp thành công ${res?.deleted_count || 0} tài liệu trong thùng rác.`,
      });
    } catch (err) {
      setTrashResult({
        success: false,
        message: err.response?.data?.message || "Đã xảy ra lỗi khi dọn dẹp thùng rác.",
      });
    }
  };

  const handleRunTokenCleanup = async () => {
    setTokenResult(null);
    try {
      const res = await triggerTokenCleanup.mutateAsync();
      setTokenResult({
        success: true,
        count: res?.deleted_count || 0,
        message: res?.message || `Đã thu hồi thành công ${res?.deleted_count || 0} refresh token hết hạn.`,
      });
    } catch (err) {
      setTokenResult({
        success: false,
        message: err.response?.data?.message || "Đã xảy ra lỗi khi dọn dẹp token.",
      });
    }
  };

  return (
    <PageWrapper title="Bảo trì & Cron Jobs">
      {/* Header Info Banner */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-brand-admin/10 text-brand-admin flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Quản lý Tác vụ Bảo trì & Dọn dẹp Hệ thống
            </h2>
            <p className="text-xs text-text-secondary">
              Các Cron Jobs tự động chạy ngầm lúc 02:00 sáng mỗi ngày • Quản trị viên có thể kích hoạt thủ công khi cần giải phóng tài nguyên
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Tác vụ nền tự động hóa (Automated Background Services)</span>
        </div>
      </div>

      {/* System Health Card (To check resources during cleanup) */}
      <div className="mb-6">
        <SystemHealthCard />
      </div>

      {/* 2 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Trash Cleanup */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border/60">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Dọn dẹp Thùng Rác Mềm (Soft-deleted Files)
                </h3>
                <p className="text-xs text-text-secondary">
                  Xóa vĩnh viễn tệp vật lý và bản ghi DB vượt ngưỡng thời gian
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-brand-admin shrink-0 mt-0.5" />
                <span>
                  Khi người dùng hoặc giảng viên xóa tài liệu, tệp được chuyển vào{" "}
                  <strong>Thùng rác (`deleted_at`)</strong>. Tác vụ này sẽ quét toàn bộ bảng{" "}
                  <code>documents</code> và thư mục lưu trữ <code>files/...</code> để xóa vĩnh viễn các tài liệu có tuổi thọ lớn hơn số ngày quy định.
                </span>
              </div>

              <div>
                <label className="block font-bold text-text-primary mb-1.5 uppercase tracking-wider">
                  Thời hạn lưu trữ tối đa trong thùng rác:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl overflow-hidden px-3 py-2 w-44 focus-within:ring-2 focus-within:ring-brand-admin/20 focus-within:border-brand-admin">
                    <span className="text-slate-400 mr-2 font-medium">≥</span>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={trashDays}
                      onChange={(e) => setTrashDays(e.target.value)}
                      className="w-full font-bold outline-none text-center bg-transparent text-text-primary"
                    />
                    <span className="text-slate-400 ml-2 font-medium">ngày</span>
                  </div>
                  <span className="text-slate-400 font-medium">(Nhập 0 để dọn sạch ngay lập tức)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            {trashResult && (
              <div
                className={`p-3 rounded-xl mb-4 flex items-center gap-2.5 text-xs font-semibold ${
                  trashResult.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {trashResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{trashResult.message}</span>
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleRunTrashCleanup}
              loading={triggerTrashCleanup.isPending}
              className="w-full justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2.5"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Chạy dọn dẹp Thùng rác ngay
            </Button>
          </div>
        </div>

        {/* Card 2: Token Cleanup */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border/60">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Thu Hồi & Dọn Dẹp Refresh Token Hết Hạn
                </h3>
                <p className="text-xs text-text-secondary">
                  Tối ưu dung lượng bảng `tokens` trong cơ sở dữ liệu
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <Database className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  Mỗi lần đăng nhập, hệ thống tạo một{" "}
                  <strong>Refresh Token</strong> trong bảng <code>tokens</code>. Tác vụ này sẽ quét và xóa sạch toàn bộ các token đã hết hạn (<code>expires_at &lt; NOW()</code>) hoặc các phiên làm việc đã bị Admin thu hồi/khóa tài khoản.
                </span>
              </div>

              <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl text-purple-800">
                <p className="font-semibold mb-1">Cơ chế an toàn bảo mật:</p>
                <p>
                  Việc dọn dẹp các token cũ đảm bảo hiệu suất truy vấn JWT siêu nhanh và duy trì tính toàn vẹn bảo mật khi người dùng đăng nhập trên nhiều thiết bị.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            {tokenResult && (
              <div
                className={`p-3 rounded-xl mb-4 flex items-center gap-2.5 text-xs font-semibold ${
                  tokenResult.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {tokenResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{tokenResult.message}</span>
              </div>
            )}

            <Button
              variant="secondary"
              onClick={handleRunTokenCleanup}
              loading={triggerTokenCleanup.isPending}
              className="w-full justify-center font-bold py-2.5 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Thực thi Dọn Token ngay
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
