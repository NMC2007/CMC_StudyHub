/**
 * StudentDashboard.jsx
 * Trang Dashboard Placeholder cho Sinh viên — Route: "/" (khi role = STUDENT).
 *
 * Mục đích: Kiểm thử luồng phân quyền (ProtectedRoute + RoleBasedDashboard)
 * và Dynamic Color Theming (Xanh biển) ngay trong Phase 3 mà không cần chờ Phase 5.
 *
 * Sẽ được thay thế bằng Dashboard đầy đủ với widgets ở Phase 5.
 */
import {
  FileText,
  Eye,
  Bookmark,
  Users,
  Upload,
  Search,
  Trash2,
} from 'lucide-react';

import { useAuthStore } from '#/stores/useAuthStore';
import PageWrapper from '#/components/layout/PageWrapper';
import Badge from '#/components/ui/Badge';
import Button from '#/components/ui/Button';

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <PageWrapper title="Trang chủ">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-brand-student/10 via-brand-student-light/30 to-white rounded-2xl p-6 md:p-8 border border-brand-student/10 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-student/15 flex items-center justify-center shrink-0">
            <span className="text-2xl">👋</span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-1">
              Chào mừng trở lại, {user?.full_name || 'Sinh viên'}!
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="role" value="STUDENT" size="sm" />
              <span className="text-sm text-text-secondary">
                Nền tảng chia sẻ tài nguyên học tập CMC University
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid (Placeholder) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Tài liệu đã đăng" value="—" color="text-brand-student" />
        <StatCard icon={Eye} label="Lượt xem tổng" value="—" color="text-blue-500" />
        <StatCard icon={Bookmark} label="Tài liệu đã lưu" value="—" color="text-amber-500" />
        <StatCard icon={Users} label="Nhóm tham gia" value="—" color="text-emerald-500" />
      </div>

      {/* Quick actions */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4">⚡ Truy cập nhanh</h3>
        <div className="flex flex-wrap gap-3">
          <Button icon={Upload} size="sm">Upload tài liệu</Button>
          <Button icon={Search} variant="secondary" size="sm">Tìm kiếm</Button>
          <Button icon={Trash2} variant="ghost" size="sm">Thùng rác</Button>
        </div>
      </div>

      {/* Placeholder notice */}
      <p className="text-center text-xs text-text-muted mt-8">
        🚧 Dashboard đầy đủ sẽ được triển khai ở Phase 5
      </p>
    </PageWrapper>
  );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

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
