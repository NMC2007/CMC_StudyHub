/**
 * useAcademic.js
 * Custom hooks cho Academic Structure queries.
 * Dùng trong: CascadeSelect (RegisterPage, UploadModal, SearchPage).
 *
 * staleTime dài (10 phút) vì data học thuật hầu như không thay đổi trong 1 session.
 * Không cần invalidate thường xuyên — Admin thay đổi rất hiếm.
 */
import { useQuery } from '@tanstack/react-query';
import {
  getCohorts,
  getFacultiesByCohort,
  getMajorsByFaculty,
  getSubjectsByMajor,
} from '#/api/academicApi';

const ACADEMIC_STALE_TIME = 10 * 60_000; // 10 phút

export const useCohorts = (options = {}) =>
  useQuery({
    queryKey: ['academic', 'cohorts'],
    queryFn: () => getCohorts().then((r) => r.data.data),
    staleTime: ACADEMIC_STALE_TIME,
    ...options,
  });

/**
 * Chỉ fetch khi cohortId có giá trị (đã chọn Khóa).
 */
export const useFaculties = (cohortId, options = {}) =>
  useQuery({
    queryKey: ['academic', 'faculties', cohortId],
    queryFn: () => getFacultiesByCohort(cohortId).then((r) => r.data.data),
    enabled: !!cohortId,
    staleTime: ACADEMIC_STALE_TIME,
    ...options,
  });

/**
 * Chỉ fetch khi facultyId có giá trị (đã chọn Khoa).
 */
export const useMajors = (facultyId, options = {}) =>
  useQuery({
    queryKey: ['academic', 'majors', facultyId],
    queryFn: () => getMajorsByFaculty(facultyId).then((r) => r.data.data),
    enabled: !!facultyId,
    staleTime: ACADEMIC_STALE_TIME,
    ...options,
  });

/**
 * Chỉ fetch khi majorId có giá trị (đã chọn Ngành).
 */
export const useSubjects = (majorId, options = {}) =>
  useQuery({
    queryKey: ['academic', 'subjects', majorId],
    queryFn: () => getSubjectsByMajor(majorId).then((r) => r.data.data),
    enabled: !!majorId,
    staleTime: ACADEMIC_STALE_TIME,
    ...options,
  });
