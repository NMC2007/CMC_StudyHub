/**
 * AcademicTreeWidget.jsx
 * Cây học thuật (Collapse Tree view) hiển thị phân cấp Khóa → Khoa → Ngành → Môn.
 */
import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Building2,
  BookOpen,
  FolderOpen,
  Layers,
} from "lucide-react";
import { useAdminCohorts, useAdminFaculties } from "#/hooks/useAdmin";
import { getMajorsByFaculty, getSubjectsByMajor } from "#/api/academicApi";
import Skeleton from "#/components/ui/Skeleton";

export default function AcademicTreeWidget() {
  const { cohortsQuery } = useAdminCohorts();
  const { facultiesQuery } = useAdminFaculties();

  const [expandedFaculties, setExpandedFaculties] = useState({});
  const [facultyMajors, setFacultyMajors] = useState({});
  const [loadingMajors, setLoadingMajors] = useState({});

  const [expandedMajors, setExpandedMajors] = useState({});
  const [majorSubjects, setMajorSubjects] = useState({});
  const [loadingSubjects, setLoadingSubjects] = useState({});

  const toggleFaculty = async (facultyCode) => {
    const isExp = !expandedFaculties[facultyCode];
    setExpandedFaculties((prev) => ({ ...prev, [facultyCode]: isExp }));

    if (isExp && !facultyMajors[facultyCode]) {
      setLoadingMajors((prev) => ({ ...prev, [facultyCode]: true }));
      try {
        const res = await getMajorsByFaculty(facultyCode);
        const data = res.data?.data;
        setFacultyMajors((prev) => ({
          ...prev,
          [facultyCode]: Array.isArray(data) ? data : data?.majors || [],
        }));
      } catch {
        setFacultyMajors((prev) => ({ ...prev, [facultyCode]: [] }));
      } finally {
        setLoadingMajors((prev) => ({ ...prev, [facultyCode]: false }));
      }
    }
  };

  const toggleMajor = async (majorCode) => {
    const isExp = !expandedMajors[majorCode];
    setExpandedMajors((prev) => ({ ...prev, [majorCode]: isExp }));

    if (isExp && !majorSubjects[majorCode]) {
      setLoadingSubjects((prev) => ({ ...prev, [majorCode]: true }));
      try {
        const res = await getSubjectsByMajor(majorCode);
        const data = res.data?.data;
        setMajorSubjects((prev) => ({
          ...prev,
          [majorCode]: Array.isArray(data) ? data : data?.subjects || [],
        }));
      } catch {
        setMajorSubjects((prev) => ({ ...prev, [majorCode]: [] }));
      } finally {
        setLoadingSubjects((prev) => ({ ...prev, [majorCode]: false }));
      }
    }
  };

  if (cohortsQuery.isLoading || facultiesQuery.isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs">
        <Skeleton className="h-6 w-48 mb-4 rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const cohorts = cohortsQuery.data || [];
  const faculties = facultiesQuery.data || [];

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary tracking-tight">
              Cây Phân Cấp Học Thuật
            </h3>
            <p className="text-xs text-text-secondary">
              Nhấn vào các mục để mở rộng toàn bộ Khóa → Khoa → Ngành → Môn
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-200/60">
          {faculties.length} Khoa • {cohorts.length} Khóa
        </span>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {faculties.map((faculty) => {
          const fCode = faculty.code || faculty.faculty_code;
          const isExpFaculty = Boolean(expandedFaculties[fCode]);
          const majorsList = facultyMajors[fCode] || [];
          const isMajorLoading = Boolean(loadingMajors[fCode]);

          return (
            <div
              key={faculty.id || fCode}
              className="border border-slate-200/80 rounded-xl overflow-hidden bg-white/50 transition-all"
            >
              {/* Faculty Header */}
              <button
                onClick={() => toggleFaculty(fCode)}
                className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {isExpFaculty ? (
                    <ChevronDown className="w-4 h-4 text-brand-admin shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="text-sm font-semibold text-text-primary">
                    {faculty.name} ({fCode})
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  ID: #{faculty.id}
                </span>
              </button>

              {/* Majors List */}
              {isExpFaculty && (
                <div className="pl-6 pr-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-1.5">
                  {isMajorLoading ? (
                    <div className="py-2 px-3 text-xs text-slate-400 flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-brand-admin border-t-transparent rounded-full animate-spin" />
                      Đang tải danh sách Ngành...
                    </div>
                  ) : majorsList.length === 0 ? (
                    <div className="py-2 px-3 text-xs text-slate-400 italic">
                      Khoa này chưa có Ngành học nào.
                    </div>
                  ) : (
                    majorsList.map((major) => {
                      const mCode = major.code || major.major_code;
                      const isExpMajor = Boolean(expandedMajors[mCode]);
                      const subjectsList = majorSubjects[mCode] || [];
                      const isSubjectLoading = Boolean(loadingSubjects[mCode]);

                      return (
                        <div
                          key={major.id || mCode}
                          className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                        >
                          {/* Major Header */}
                          <button
                            onClick={() => toggleMajor(mCode)}
                            className="w-full flex items-center justify-between p-2.5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {isExpMajor ? (
                                <ChevronDown className="w-3.5 h-3.5 text-brand-admin shrink-0" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="text-xs font-semibold text-text-primary">
                                {major.name} ({mCode})
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              #{major.id}
                            </span>
                          </button>

                          {/* Subjects List */}
                          {isExpMajor && (
                            <div className="pl-6 pr-2 pb-2 pt-1 border-t border-slate-100 bg-slate-50/30 space-y-1">
                              {isSubjectLoading ? (
                                <div className="py-1.5 text-xs text-slate-400 flex items-center gap-2">
                                  <div className="w-3 h-3 border-2 border-brand-admin border-t-transparent rounded-full animate-spin" />
                                  Đang tải Môn học...
                                </div>
                              ) : subjectsList.length === 0 ? (
                                <div className="py-1.5 text-xs text-slate-400 italic">
                                  Ngành này chưa có Môn học nào.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                  {subjectsList.map((sub) => {
                                    const sCode = sub.code || sub.subject_code;
                                    return (
                                      <div
                                        key={sub.id || sCode}
                                        className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-slate-200/70 rounded-md text-xs text-text-secondary"
                                      >
                                        <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span className="truncate font-medium">
                                          {sub.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 ml-auto shrink-0 font-mono">
                                          {sCode}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
