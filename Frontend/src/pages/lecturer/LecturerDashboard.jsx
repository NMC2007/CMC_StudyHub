/**
 * LecturerDashboard.jsx
 * Trang Dashboard Placeholder cho Giảng viên — Route: "/" (khi role = LECTURER).
 *
 * Mục đích: Kiểm thử Dynamic Color Theming (Xanh lá) và phân quyền.
 * Sẽ được thay thế bằng Dashboard đầy đủ ở Phase 5.
 */
import {
  FileText,
  Eye,
  Heart,
  Users,
  Upload,
  Search,
  FolderOpen,
} from 'lucide-react';

import { useAuthStore } from '#/stores/useAuthStore';
import PageWrapper from '#/components/layout/PageWrapper';
import Badge from '#/components/ui/Badge';
import Button from '#/components/ui/Button';

export default function LecturerDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <PageWrapper title="Trang chủ">
      {/* Welcome banner — Lecturer green theme */}
      <div className="bg-gradient-to-br from-brand-lecturer/10 via-brand-lecturer-light/30 to-white rounded-2xl p-6 md:p-8 border border-brand-lecturer/10 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-lecturer/15 flex items-center justify-center shrink-0">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-1">
              Chào mừng, {user?.full_name || 'Giảng viên'}!
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="role" value="LECTURER" size="sm" />
              <span className="text-sm text-text-secondary">
                Quản lý và chia sẻ tài liệu giảng dạy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid (Placeholder) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Tài liệu đã đăng" value="—" color="text-brand-lecturer" />
        <StatCard icon={Eye} label="Tổng lượt xem" value="—" color="text-blue-500" />
        <StatCard icon={Heart} label="Tổng lượt thích" value="—" color="text-rose-500" />
        <StatCard icon={Users} label="Nhóm quản lý" value="—" color="text-emerald-500" />
      </div>

      {/* Quick actions */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4">⚡ Truy cập nhanh</h3>
        <div className="flex flex-wrap gap-3">
          <Button icon={Upload} size="sm">Upload tài liệu</Button>
          <Button icon={FolderOpen} variant="secondary" size="sm">Quản lý tài liệu</Button>
          <Button icon={Search} variant="ghost" size="sm">Tìm kiếm</Button>
        </div>
      </div>

      <p className="text-center text-xs text-text-muted mt-8">
        🚧 Dashboard đầy đủ sẽ được triển khai ở Phase 5
      </p>
    </PageWrapper>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-lg font-bold text-text-primary">{value}</p>
          <p className="text-xs text-text-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}
