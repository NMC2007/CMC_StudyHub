/**
 * FavoritesPage.jsx
 * Trang Quản lý Tài liệu Yêu thích & Đã lưu — Route: "/favorites".
 *
 * Tính năng (STUDYHUB_FE.md Mục 13):
 *  - 2 Tab rõ ràng:
 *      1. Đã lưu (`bookmarks`): Danh sách tài liệu người dùng đã bookmark, dùng để đọc lại sau.
 *      2. Đã thích (`likes`): Danh sách tài liệu người dùng đã bấm like.
 *  - Đồng bộ Tab hiện tại với URL query parameters (`/favorites?tab=bookmarks|likes`).
 *  - Phân trang server-side (`Pagination`) và đếm số lượng trên badge của từng tab.
 *  - Trạng thái rỗng (`EmptyState`) có nút điều hướng sang trang Tìm kiếm để khám phá thêm tài liệu.
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Bookmark, Heart, BookOpen, Search } from 'lucide-react';

import PageWrapper from '#/components/layout/PageWrapper';
import Tabs from '#/components/ui/Tabs';
import Button from '#/components/ui/Button';
import Skeleton from '#/components/ui/Skeleton';
import EmptyState from '#/components/ui/EmptyState';
import Pagination from '#/components/ui/Pagination';
import DocumentCard from '#/components/document/DocumentCard';
import { useBookmarks, useLikedDocuments } from '#/hooks/useDocuments';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') === 'likes' ? 'likes' : 'bookmarks';
  const [activeTab, setActiveTab] = useState(urlTab);

  const [bookmarksPage, setBookmarksPage] = useState(1);
  const [likesPage, setLikesPage] = useState(1);

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // 1. Fetch Danh sách Bookmarks
  const {
    data: bookmarksData,
    isLoading: bookmarksLoading,
  } = useBookmarks({ page: bookmarksPage, limit: 12 });

  // 2. Fetch Danh sách Likes
  const {
    data: likesData,
    isLoading: likesLoading,
  } = useLikedDocuments({ page: likesPage, limit: 12 });

  const tabsConfig = [
    {
      id: 'bookmarks',
      label: 'Tài liệu đã lưu (Bookmarks)',
      icon: Bookmark,
      count: bookmarksData?.total || 0,
    },
    {
      id: 'likes',
      label: 'Tài liệu đã thích (Likes)',
      icon: Heart,
      count: likesData?.total || 0,
    },
  ];

  return (
    <PageWrapper title="Yêu thích & Đã lưu">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-brand-student fill-brand-student/20" />
            Tài liệu đã lưu & Yêu thích
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Truy cập nhanh lại các giáo trình, bài giảng và tài liệu bạn đã đánh dấu trước đó.
          </p>
        </div>

        <Button
          type="button"
          icon={Search}
          variant="secondary"
          onClick={() => navigate('/search')}
          className="w-full sm:w-auto shrink-0"
        >
          Khám phá thêm
        </Button>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6">
        <Tabs
          tabs={tabsConfig}
          activeTab={activeTab}
          onChange={handleTabChange}
          variant="pills"
        />
      </div>

      {/* TAB 1: BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div className="flex flex-col gap-6">
          {bookmarksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <Skeleton key={key} height="h-44" className="rounded-2xl" />
              ))}
            </div>
          ) : !bookmarksData?.documents || bookmarksData.documents.length === 0 ? (
            <EmptyState
              title="Bạn chưa lưu tài liệu nào"
              message="Hãy bấm vào biểu tượng dấu trang (Bookmark) trên các tài liệu hay để lưu lại và xem khi cần."
              actionText="Khám phá tài liệu ngay"
              onAction={() => navigate('/search')}
              icon={Bookmark}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarksData.documents.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>

              {bookmarksData.totalPages > 1 && (
                <Pagination
                  page={bookmarksData.page || bookmarksPage}
                  totalPages={bookmarksData.totalPages}
                  totalItems={bookmarksData.total}
                  onPageChange={(p) => {
                    setBookmarksPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: LIKES */}
      {activeTab === 'likes' && (
        <div className="flex flex-col gap-6">
          {likesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <Skeleton key={key} height="h-44" className="rounded-2xl" />
              ))}
            </div>
          ) : !likesData?.documents || likesData.documents.length === 0 ? (
            <EmptyState
              title="Bạn chưa thích tài liệu nào"
              message="Thể hiện sự yêu thích và khích lệ người chia sẻ bằng cách thả tim (Like) cho tài liệu nhé!"
              actionText="Tìm kiếm tài liệu"
              onAction={() => navigate('/search')}
              icon={Heart}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {likesData.documents.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>

              {likesData.totalPages > 1 && (
                <Pagination
                  page={likesData.page || likesPage}
                  totalPages={likesData.totalPages}
                  totalItems={likesData.total}
                  onPageChange={(p) => {
                    setLikesPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
