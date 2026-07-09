/**
 * StudentDashboard.jsx
 * Trang Dashboard hoàn chỉnh cho Sinh viên — Route: "/" (khi role = STUDENT).
 *
 * Tính năng:
 *  - Chào mừng sinh viên kèm thông tin phân cấp học thuật Khóa/Khoa/Ngành.
 *  - 4 Card thống kê nhanh từ API thực tế: Tài liệu đã đăng, Tổng lượt xem, Đã lưu, Nhóm tham gia.
 *  - Danh sách 5 tài liệu mới nhất của tôi (sử dụng DocumentCard).
 *  - Danh sách 6 tài liệu PUBLIC phổ biến nhất (sử dụng DocumentCard).
 *  - Danh sách Nhóm học tập đang tham gia (sử dụng GroupCard).
 *  - Nút nhanh mở DocumentUploadModal.
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  FileText,
  Eye,
  Bookmark,
  Users,
  Upload,
  Search,
  Trash2,
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
import { useMyDocuments, useSearchDocuments, useBookmarks } from '#/hooks/useDocuments';
import { useMyGroups } from '#/hooks/useGroups';
import { formatCount } from '#/utils/formatters';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // 1. Fetch Tài liệu của tôi (5 file mới nhất & tính tổng)
  const {
    data: myDocsData,
    isLoading: myDocsLoading,
  } = useMyDocuments({ page: 1, limit: 5 });

  // 2. Fetch toàn bộ tài liệu của tôi để tính tổng lượt xem (tối ưu khi số lượng vừa phải)
  const {
    data: allMyDocsData,
    isLoading: allMyDocsLoading,
  } = useMyDocuments({ page: 1, limit: 100 });

  // 3. Fetch Tài liệu PUBLIC phổ biến (6 file)
  const {
    data: publicDocsData,
    isLoading: publicDocsLoading,
  } = useSearchDocuments({ visibility: 'PUBLIC', page: 1, limit: 6 });

  // 4. Fetch Tài liệu đã Bookmark (để đếm tổng số)
  const {
    data: bookmarksData,
    isLoading: bookmarksLoading,
  } = useBookmarks({ page: 1, limit: 1 });

  // 5. Fetch Danh sách Nhóm học tập đang tham gia
  const {
    data: myGroupsData,
    isLoading: myGroupsLoading,
  } = useMyGroups();

  // Tính toán các con số thống kê
  const totalMyDocs = myDocsData?.total || (myDocsData?.documents?.length || 0);
  const totalViews = allMyDocsData?.documents?.reduce((acc, doc) => acc + (doc.view_count || 0), 0) || 0;
  const totalBookmarks = bookmarksData?.total || 0;
  const groupsList = Array.isArray(myGroupsData) ? myGroupsData : (myGroupsData?.groups || []);
  const totalGroups = groupsList.length;

  return (
    <PageWrapper title="Trang chủ Sinh viên">
      {/* 1. Welcome banner */}
      <div className="bg-gradient-to-br from-brand-student/10 via-brand-student-light/30 to-white rounded-2xl p-6 md:p-8 border border-brand-student/15 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-student/15 flex items-center justify-center shrink-0 text-2xl shadow-inner">
            👋
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-1">
              Chào mừng trở lại, {user?.full_name || 'Sinh viên'}!
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="role" value="STUDENT" size="sm" />
              {(user?.cohort_code || user?.major_code) && (
                <span className="text-xs font-semibold text-brand-student bg-brand-student-light px-2.5 py-1 rounded-lg">
                  {[user.cohort_code, user.faculty_code, user.major_code].filter(Boolean).join(' • ')}
                </span>
              )}
              <span className="text-sm text-slate-500 hidden sm:inline">
                Nền tảng chia sẻ tài nguyên học tập CMC University
              </span>
            </div>
          </div>
        </div>

        {/* Quick Upload CTA inside banner */}
        <Button
          type="button"
          icon={Upload}
          onClick={() => setIsUploadOpen(true)}
          className="w-full md:w-auto shrink-0 shadow-sm"
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
          color="text-brand-student"
          bg="bg-brand-student-light/50"
        />
        <StatCard
          icon={Eye}
          label="Tổng lượt xem"
          value={allMyDocsLoading ? '...' : formatCount(totalViews)}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={Bookmark}
          label="Tài liệu đã lưu"
          value={bookmarksLoading ? '...' : formatCount(totalBookmarks)}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          icon={Users}
          label="Nhóm học tập"
          value={myGroupsLoading ? '...' : formatCount(totalGroups)}
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
          >
            Upload tài liệu
          </Button>
          <Button
            type="button"
            icon={Search}
            variant="secondary"
            size="sm"
            onClick={() => navigate('/search')}
          >
            Tìm kiếm nâng cao
          </Button>
          <Button
            type="button"
            icon={Trash2}
            variant="ghost"
            size="sm"
            onClick={() => navigate('/documents?tab=trash')}
            className="text-slate-600 hover:text-red-600"
          >
            Thùng rác
          </Button>
        </div>
      </div>

      {/* 4. Tài liệu mới nhất của tôi */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-student" />
            <h3 className="text-base font-bold text-slate-800">
              Tài liệu mới nhất của tôi
            </h3>
          </div>
          <Link
            to="/documents"
            className="text-xs font-semibold text-brand-student hover:underline flex items-center gap-1"
          >
            Xem tất cả ({totalMyDocs}) <ArrowRight className="w-3.5 h-3.5" />
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
            title="Bạn chưa tải lên tài liệu nào"
            message="Hãy chia sẻ tài liệu đầu tiên của bạn với cộng đồng học tập StudyHub ngay bây giờ."
            actionText="Tải lên ngay"
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

      {/* 5. Tài liệu PUBLIC phổ biến */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">
              Tài liệu công khai phổ biến
            </h3>
          </div>
          <Link
            to="/search?visibility=PUBLIC"
            className="text-xs font-semibold text-brand-student hover:underline flex items-center gap-1"
          >
            Khám phá thêm <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {publicDocsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((key) => (
              <Skeleton key={key} height="h-44" className="rounded-2xl" />
            ))}
          </div>
        ) : !publicDocsData?.documents || publicDocsData.documents.length === 0 ? (
          <EmptyState
            title="Chưa có tài liệu công khai nào"
            message="Hệ thống đang cập nhật các tài liệu phổ biến."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicDocsData.documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Nhóm học tập của tôi */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">
              Nhóm học tập đang tham gia
            </h3>
          </div>
          <Link
            to="/groups"
            className="text-xs font-semibold text-brand-student hover:underline flex items-center gap-1"
          >
            Quản lý nhóm ({totalGroups}) <ArrowRight className="w-3.5 h-3.5" />
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
            title="Bạn chưa tham gia nhóm học tập nào"
            message="Hãy tạo hoặc gia nhập nhóm học tập để chia sẻ tài nguyên và trao đổi kiến thức cùng bạn bè."
            actionText="Khám phá nhóm"
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
