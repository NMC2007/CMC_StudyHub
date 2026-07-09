/**
 * SearchPage.jsx
 * Trang tìm kiếm & lọc nâng cao — Route: "/search".
 *
 * Tính năng (STUDYHUB_FE.md Mục 12 & 19):
 *  - Bộ lọc đa tiêu chí (Sidebar trên Desktop, Toggle Drawer trên Mobile):
 *      + Từ khóa tìm kiếm (`q`)
 *      + Loại tài liệu (`document_type`)
 *      + Vai trò người đăng (`uploader_role`: STUDENT / LECTURER)
 *      + Phạm vi hiển thị (`visibility`: PUBLIC / GROUP)
 *      + Phân cấp học thuật 4 tầng Khóa/Khoa/Ngành/Môn học (`CascadeSelect`)
 *  - Đồng bộ hai chiều với URL query parameters (`useSearchParams`), giúp sao chép/chia sẻ link tìm kiếm giữ nguyên bộ lọc.
 *  - Sắp xếp kết quả: Mới nhất, Xem nhiều, Thích nhiều.
 *  - Nút "Xóa bộ lọc" nhanh để reset về trạng thái ban đầu.
 */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  FileText,
  BookOpen,
} from "lucide-react";

import PageWrapper from "#/components/layout/PageWrapper";
import Input from "#/components/ui/Input";
import Select from "#/components/ui/Select";
import Button from "#/components/ui/Button";
import Badge from "#/components/ui/Badge";
import Skeleton from "#/components/ui/Skeleton";
import EmptyState from "#/components/ui/EmptyState";
import Pagination from "#/components/ui/Pagination";
import CascadeSelect from "#/components/academic/CascadeSelect";
import DocumentCard from "#/components/document/DocumentCard";
import { useSearchDocuments } from "#/hooks/useDocuments";
import { useDebounce } from "#/hooks/useDebounce";

const DOCUMENT_TYPE_OPTIONS = [
  { value: "ALL", label: "Tất cả loại tài liệu" },
  { value: "DOCUMENT", label: "Tài liệu / Giáo trình" },
  { value: "SLIDE", label: "Bài giảng / Slide" },
  { value: "ASSIGNMENT", label: "Bài tập / Đề tài" },
  { value: "EXAM", label: "Đề thi / Kiểm tra" },
  { value: "REFERENCE", label: "Tài liệu tham khảo" },
];

const UPLOADER_ROLE_OPTIONS = [
  { value: "ALL", label: "Tất cả người đăng" },
  { value: "LECTURER", label: "Giảng viên (LECTURER)" },
  { value: "STUDENT", label: "Sinh viên (STUDENT)" },
];

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Công khai (PUBLIC)" },
  { value: "GROUP", label: "Nhóm học tập (GROUP)" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới đăng nhất" },
  { value: "views", label: "Lượt xem nhiều nhất" },
  { value: "likes", label: "Lượt thích nhiều nhất" },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State quản lý bộ lọc lấy trực tiếp từ URL query params
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 300);

  const [docType, setDocType] = useState(
    searchParams.get("document_type") || "ALL",
  );
  const [uploaderRole, setUploaderRole] = useState(
    searchParams.get("uploader_role") || "ALL",
  );
  const [visibility, setVisibility] = useState(
    searchParams.get("visibility") || "PUBLIC",
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // State cho CascadeSelect
  const [cascadeVals, setCascadeVals] = useState({
    cohort_code: searchParams.get("cohort_code") || "",
    cohort_id: searchParams.get("cohort_id")
      ? Number(searchParams.get("cohort_id"))
      : null,
    faculty_code: searchParams.get("faculty_code") || "",
    faculty_id: searchParams.get("faculty_id")
      ? Number(searchParams.get("faculty_id"))
      : null,
    major_code: searchParams.get("major_code") || "",
    major_id: searchParams.get("major_id")
      ? Number(searchParams.get("major_id"))
      : null,
    subject_code: searchParams.get("subject_code") || "",
    subject_id: searchParams.get("subject_id")
      ? Number(searchParams.get("subject_id"))
      : null,
  });

  // State cho Mobile filter drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Đồng bộ hóa URL parameters mỗi khi bộ lọc thay đổi
  const updateURLParams = (updates = {}) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...updates };

    // Dọn dẹp các params có giá trị mặc định hoặc rỗng để URL sạch sẽ
    const cleanParams = {};
    if (merged.q && merged.q.trim()) cleanParams.q = merged.q.trim();
    if (merged.document_type && merged.document_type !== "ALL")
      cleanParams.document_type = merged.document_type;
    if (merged.uploader_role && merged.uploader_role !== "ALL")
      cleanParams.uploader_role = merged.uploader_role;
    if (merged.visibility && merged.visibility !== "PUBLIC")
      cleanParams.visibility = merged.visibility;
    if (merged.sort && merged.sort !== "newest") cleanParams.sort = merged.sort;
    if (merged.page && Number(merged.page) > 1) cleanParams.page = merged.page;

    if (merged.cohort_id) cleanParams.cohort_id = merged.cohort_id;
    if (merged.cohort_code) cleanParams.cohort_code = merged.cohort_code;
    if (merged.faculty_id) cleanParams.faculty_id = merged.faculty_id;
    if (merged.faculty_code) cleanParams.faculty_code = merged.faculty_code;
    if (merged.major_id) cleanParams.major_id = merged.major_id;
    if (merged.major_code) cleanParams.major_code = merged.major_code;
    if (merged.subject_id) cleanParams.subject_id = merged.subject_id;
    if (merged.subject_code) cleanParams.subject_code = merged.subject_code;

    setSearchParams(cleanParams);
  };

  useEffect(() => {
    if (debouncedQuery !== (searchParams.get("q") || "")) {
      updateURLParams({ q: debouncedQuery, page: 1 });
    }
  }, [debouncedQuery]);

  // Handlers thay đổi từng tiêu chí
  const handleQuerySubmit = (e) => {
    e?.preventDefault();
    setPage(1);
    updateURLParams({ q: query, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setPage(1);
    if (key === "document_type") setDocType(value);
    if (key === "uploader_role") setUploaderRole(value);
    if (key === "visibility") setVisibility(value);
    if (key === "sort") setSort(value);

    updateURLParams({ [key]: value, page: 1 });
  };

  const handleCascadeChange = (newVals) => {
    setPage(1);
    setCascadeVals(newVals);
    updateURLParams({
      cohort_id: newVals.cohort_id || "",
      cohort_code: newVals.cohort_code || "",
      faculty_id: newVals.faculty_id || "",
      faculty_code: newVals.faculty_code || "",
      major_id: newVals.major_id || "",
      major_code: newVals.major_code || "",
      subject_id: newVals.subject_id || "",
      subject_code: newVals.subject_code || "",
      page: 1,
    });
  };

  const handleResetFilters = () => {
    setQuery("");
    setDocType("ALL");
    setUploaderRole("ALL");
    setVisibility("PUBLIC");
    setSort("newest");
    setPage(1);
    const emptyCascade = {
      cohort_code: "",
      cohort_id: null,
      faculty_code: "",
      faculty_id: null,
      major_code: "",
      major_id: null,
      subject_code: "",
      subject_id: null,
    };
    setCascadeVals(emptyCascade);
    setSearchParams({});
  };

  // Chuẩn bị tham số gọi API tìm kiếm
  const apiParams = {
    page,
    limit: 12,
    visibility,
    ...(debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {}),
    ...(docType !== "ALL" ? { type: docType, document_type: docType } : {}),
    ...(uploaderRole !== "ALL" ? { role: uploaderRole, uploader_role: uploaderRole } : {}),
    ...(cascadeVals.cohort_id ? { cohort_id: cascadeVals.cohort_id } : {}),
    ...(cascadeVals.faculty_id ? { faculty_id: cascadeVals.faculty_id } : {}),
    ...(cascadeVals.major_id ? { major_id: cascadeVals.major_id } : {}),
    ...(cascadeVals.subject_id ? { subject_id: cascadeVals.subject_id } : {}),
  };

  const { data: searchData, isLoading } = useSearchDocuments(apiParams);

  // Kiểm tra có đang áp dụng bộ lọc nào không
  const hasActiveFilters =
    query.trim() !== "" ||
    docType !== "ALL" ||
    uploaderRole !== "ALL" ||
    visibility !== "PUBLIC" ||
    !!cascadeVals.cohort_id ||
    !!cascadeVals.faculty_id ||
    !!cascadeVals.major_id ||
    !!cascadeVals.subject_id;

  // Sắp xếp kết quả ở client-side nếu backend chưa support parameter sort trực tiếp
  const sortedDocuments = React.useMemo(() => {
    const docs = searchData?.documents ? [...searchData.documents] : [];
    if (sort === "views") {
      return docs.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }
    if (sort === "likes") {
      return docs.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    }
    // mặc định newest (đã sắp xếp từ backend theo created_at DESC)
    return docs;
  }, [searchData?.documents, sort]);

  return (
    <PageWrapper title="Tìm kiếm nâng cao">
      {/* Top Search Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form
          onSubmit={handleQuerySubmit}
          className="flex-1 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Input
              placeholder="Nhập từ khóa tìm kiếm (tên tài liệu, môn học, tác giả...)..."
              icon={Search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full !py-3"
            />
          </div>
          <Button type="submit" icon={Search} className="shrink-0 h-11 px-5">
            Tìm kiếm
          </Button>
        </form>

        {/* Toggle Sidebar Button for Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            type="button"
            variant="secondary"
            icon={SlidersHorizontal}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full justify-center"
          >
            {isSidebarOpen ? "Đóng bộ lọc" : "Bộ lọc nâng cao"}
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-student text-white text-[10px]">
                !
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Layout Grid: Sidebar Filters (Left) + Results List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* ─── SIDEBAR FILTERS ─── */}
        <aside
          className={`lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col gap-5 ${
            isSidebarOpen ? "block" : "hidden lg:flex"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Filter className="w-4.5 h-4.5 text-brand-student" />
              <span>Bộ lọc nâng cao</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại
              </button>
            )}
          </div>

          {/* 1. Loại tài liệu */}
          <div>
            <Select
              label="Loại tài liệu"
              options={DOCUMENT_TYPE_OPTIONS}
              value={docType}
              onChange={(e) =>
                handleFilterChange("document_type", e.target.value)
              }
            />
          </div>

          {/* 2. Phạm vi hiển thị */}
          <div>
            <Select
              label="Phạm vi tài liệu"
              options={VISIBILITY_OPTIONS}
              value={visibility}
              onChange={(e) => handleFilterChange("visibility", e.target.value)}
            />
          </div>

          {/* 3. Người đăng */}
          <div>
            <Select
              label="Đăng bởi vai trò"
              options={UPLOADER_ROLE_OPTIONS}
              value={uploaderRole}
              onChange={(e) =>
                handleFilterChange("uploader_role", e.target.value)
              }
            />
          </div>

          {/* 4. Phân cấp học thuật 4 tầng */}
          <div className="pt-2 border-t border-slate-100">
            <CascadeSelect
              mode="FULL"
              showTitle={true}
              titleText="Phân loại học thuật"
              values={cascadeVals}
              onChange={handleCascadeChange}
            />
          </div>
        </aside>

        {/* ─── RESULTS SECTION ─── */}
        <main className="lg:col-span-3 flex flex-col gap-6 min-w-0">
          {/* Top Result Toolbar (Count + Sort) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm font-medium text-slate-600">
              {isLoading ? (
                <span>Đang tìm kiếm tài liệu...</span>
              ) : (
                <span>
                  Tìm thấy{" "}
                  <strong className="text-slate-800 font-bold">
                    {searchData?.pagination?.total || 0}
                  </strong>{" "}
                  tài liệu phù hợp
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-semibold text-slate-500 shrink-0">
                Sắp xếp theo:
              </span>
              <select
                value={sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-brand-student cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Grid / List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <Skeleton key={key} height="h-44" className="rounded-2xl" />
              ))}
            </div>
          ) : sortedDocuments.length === 0 ? (
            <EmptyState
              title="Không tìm thấy tài liệu nào"
              message={
                hasActiveFilters
                  ? "Không có tài liệu nào khớp với từ khóa và bộ lọc của bạn. Hãy thử chọn điều kiện lọc rộng hơn hoặc xóa bộ lọc."
                  : "Chưa có tài liệu nào trong hệ thống ở phạm vi này."
              }
              actionText={hasActiveFilters ? "Xóa toàn bộ lọc" : undefined}
              onAction={hasActiveFilters ? handleResetFilters : undefined}
              icon={BookOpen}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedDocuments.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>

              {(searchData?.pagination?.totalPages || 0) > 1 && (
                <Pagination
                  page={searchData?.pagination?.page || page}
                  totalPages={searchData?.pagination?.totalPages || 0}
                  totalItems={searchData?.pagination?.total || 0}
                  onPageChange={(p) => {
                    setPage(p);
                    updateURLParams({ page: p });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
    </PageWrapper>
  );
}
