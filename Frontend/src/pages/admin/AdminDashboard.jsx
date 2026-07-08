/**
 * AdminDashboard.jsx
 * Trang Dashboard Placeholder cho Admin — Route: "/admin/dashboard".
 *
 * Mục đích: Kiểm thử Dynamic Color Theming (Đỏ) và phân quyền RBAC.
 * Sẽ được thay thế bằng Dashboard đầy đủ ở Phase 6.
 */
import {
  Users as UsersIcon,
  FileText,
  Users,
  Eye,
  UserCog,
  GraduationCap,
  Clock,
} from 'lucide-react';

import { useAuthStore } from '#/stores/useAuthStore';
import PageWrapper from '#/components/layout/PageWrapper';
import Badge from '#/components/ui/Badge';
import Button from '#/components/ui/Button';

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <PageWrapper title="Admin Dashboard">
      {/* Welcome banner — Admin red theme */}
      <div className="bg-gradient-to-br from-brand-admin/10 via-brand-admin-light/30 to-white rounded-2xl p-6 md:p-8 border border-brand-admin/10 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-admin/15 flex items-center justify-center shrink-0">
            <span className="text-2xl">🛡️</span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-1">
              Xin chào, {user?.full_name || 'Admin'}!
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="role" value="ADMIN" size="sm" />
              <span className="text-sm text-text-secondary">
                Bảng điều khiển quản trị hệ thống
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid (Placeholder) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={UsersIcon} label="Tổng Users" value="—" color="text-brand-admin" />
        <StatCard icon={FileText} label="Tổng Tài liệu" value="—" color="text-blue-500" />
        <StatCard icon={Users} label="Tổng Nhóm" value="—" color="text-emerald-500" />
        <StatCard icon={Eye} label="Tổng Views" value="—" color="text-amber-500" />
      </div>

      {/* Quick management */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4">🔧 Quản lý nhanh</h3>
        <div className="flex flex-wrap gap-3">
          <Button icon={UserCog} size="sm">Quản lý Users</Button>
          <Button icon={GraduationCap} variant="secondary" size="sm">Học thuật</Button>
          <Button icon={Clock} variant="ghost" size="sm">Cron Jobs</Button>
        </div>
      </div>

      <p className="text-center text-xs text-text-muted mt-8">
        🚧 Admin Dashboard đầy đủ sẽ được triển khai ở Phase 6
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
