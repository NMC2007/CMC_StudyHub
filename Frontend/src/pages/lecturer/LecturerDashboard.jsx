/**
 * LecturerDashboard.jsx
 * Trang Dashboard hoàn chỉnh cho Giảng viên — Route: "/" (khi role = LECTURER).
 *
 * Tính năng:
 *  - Chào mừng giảng viên kèm thông tin Khoa trực thuộc.
 *  - 4 Card thống kê nhanh từ API thực tế: Tài liệu đã đăng, Tổng lượt xem, Tổng lượt thích, Nhóm quản lý.
 *  - Danh sách 6 tài liệu mới đăng của tôi (sử dụng DocumentCard).
 *  - Danh sách Nhóm học tập đang quản lý/tham gia (sử dụng GroupCard).
 *  - Nút nhanh mở DocumentUploadModal.
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  FileText,
  Eye,
  Heart,
  Users,
  Upload,
  Search,
  FolderOpen,
  ArrowRight,
  Plus,
  BookOpen,
} from 'lucide-react';

import { useAuthStore } from '#/stores/useAuthStore';
import PageWrapper from '#/components/layout/PageWrapper';
import Badge from '#/components/ui/Badge';
import Button from '#/components/ui/Button';
import Skeleton from '#/components/ui/Skeleton';
import EmptyState from '#/components/ui/EmptyState';
import DocumentCard from '#/components/document/DocumentCard';
import GroupCard from '#/components/group/GroupCard';
import DocumentUploadModal from '#/components/document/DocumentUploadModal';
import { useMyDocuments } from '#/hooks/useDocuments';
import { useMyGroups } from '#/hooks/useGroups';
import { formatCount } from '#/utils/formatters';

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // 1. Fetch Tài liệu của tôi (6 file mới nhất)
  const {
    data: myDocsData,
    isLoading: myDocsLoading,
  } = useMyDocuments({ page: 1, limit: 6 });

  // 2. Fetch toàn bộ tài liệu của tôi để tính tổng lượt xem & lượt thích
  const {
    data: allMyDocsData,
    isLoading: allMyDocsLoading,
  } = useMyDocuments({ page: 1, limit: 100 });

  // 3. Fetch Danh sách Nhóm học tập
  const {
    data: myGroupsData,
    isLoading: myGroupsLoading,
  } = useMyGroups();

  // Tính toán các con số thống kê
  const totalMyDocs = myDocsData?.pagination?.total || (myDocsData?.documents?.length || 0);
  const totalViews = allMyDocsData?.documents?.reduce((acc, doc) => acc + (doc.view_count || 0), 0) || 0;
  const totalLikes = allMyDocsData?.documents?.reduce((acc, doc) => acc + (doc.like_count || 0), 0) || 0;
  const groupsList = Array.isArray(myGroupsData) ? myGroupsData : (myGroupsData?.groups || []);
  const managedGroupsCount = groupsList.filter((g) => g.owner_id === user?.id || g.owner?.id === user?.id).length || groupsList.length;

  return (
    <PageWrapper title="Trang chủ Giảng viên">
      {/* 1. Welcome banner — Lecturer green theme */}
      <div className="bg-gradient-to-br from-brand-lecturer/10 via-brand-lecturer-light/30 to-white rounded-2xl p-6 md:p-8 border border-brand-lecturer/15 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-lecturer/15 flex items-center justify-center shrink-0 text-2xl shadow-inner">
            📚
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-1">
              Chào mừng, {user?.full_name || 'Giảng viên'}!
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="role" value="LECTURER" size="sm" />
              {user?.faculty_code && (
                <span className="text-xs font-semibold text-brand-lecturer bg-brand-lecturer-light px-2.5 py-1 rounded-lg">
                  Khoa {user.faculty_code}
                </span>
              )}
              <span className="text-sm text-slate-500 hidden sm:inline">
                Quản lý và chia sẻ tài nguyên giảng dạy
              </span>
            </div>
          </div>
        </div>

        {/* Quick Upload CTA inside banner */}
        <Button
          type="button"
          icon={Upload}
          onClick={() => setIsUploadOpen(true)}
          className="w-full md:w-auto shrink-0 shadow-sm !bg-brand-lecturer hover:!bg-brand-lecturer/90"
        >
          Upload tài liệu mới
        </Button>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FileText}
          label="Tài liệu đã đăng"
          value={myDocsLoading ? '...' : formatCount(totalMyDocs)}
          color="text-brand-lecturer"
          bg="bg-brand-lecturer-light/50"
        />
        <StatCard
          icon={Eye}
          label="Tổng lượt xem"
          value={allMyDocsLoading ? '...' : formatCount(totalViews)}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={Heart}
          label="Tổng lượt thích"
          value={allMyDocsLoading ? '...' : formatCount(totalLikes)}
          color="text-rose-600"
          bg="bg-rose-50"
        />
        <StatCard
          icon={Users}
          label="Nhóm quản lý"
          value={myGroupsLoading ? '...' : formatCount(managedGroupsCount)}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
      </div>

      {/* 3. Truy cập nhanh */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">⚡ Truy cập nhanh:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
          <Button
            type="button"
            icon={Upload}
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="!bg-brand-lecturer hover:!bg-brand-lecturer/90"
          >
            Upload tài liệu
          </Button>
          <Button
            type="button"
            icon={FolderOpen}
            variant="secondary"
            size="sm"
            onClick={() => navigate('/documents')}
          >
            Quản lý tài liệu
          </Button>
          <Button
            type="button"
            icon={Search}
            variant="ghost"
            size="sm"
            onClick={() => navigate('/search')}
          >
            Tìm kiếm nâng cao
          </Button>
        </div>
      </div>

      {/* 4. Tài liệu giảng dạy mới đăng của tôi */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-lecturer" />
            <h3 className="text-base font-bold text-slate-800">
              Tài liệu giảng dạy của tôi
            </h3>
          </div>
          <Link
            to="/documents"
            className="text-xs font-semibold text-brand-lecturer hover:underline flex items-center gap-1"
          >
            Quản lý tất cả ({totalMyDocs}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myDocsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((key) => (
              <Skeleton key={key} height="h-44" className="rounded-2xl" />
            ))}
          </div>
        ) : !myDocsData?.documents || myDocsData.documents.length === 0 ? (
          <EmptyState
            title="Bạn chưa chia sẻ tài liệu giảng dạy nào"
            message="Hãy tải lên giáo trình, bài giảng hay đề thi đầu tiên của bạn để chia sẻ tới sinh viên."
            actionText="Upload tài liệu ngay"
            onAction={() => setIsUploadOpen(true)}
            icon={Upload}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myDocsData.documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Nhóm học tập đang quản lý / tham gia */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">
              Nhóm học tập & lớp học
            </h3>
          </div>
          <Link
            to="/groups"
            className="text-xs font-semibold text-brand-lecturer hover:underline flex items-center gap-1"
          >
            Quản lý nhóm ({groupsList.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myGroupsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((key) => (
              <Skeleton key={key} height="h-36" className="rounded-2xl" />
            ))}
          </div>
        ) : groupsList.length === 0 ? (
          <EmptyState
            title="Bạn chưa tạo hoặc tham gia nhóm nào"
            message="Tạo nhóm học tập cho lớp học để chia sẻ tài liệu và quản lý sinh viên dễ dàng hơn."
            actionText="Tạo nhóm ngay"
            onAction={() => navigate('/groups')}
            icon={Plus}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupsList.slice(0, 3).map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onViewDetail={(g) => navigate(`/groups/${g.id}`)}
                onManageMembers={(g) => navigate(`/groups/${g.id}?tab=members`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal Upload */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </PageWrapper>
  );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-xl font-extrabold text-slate-800 leading-tight">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
