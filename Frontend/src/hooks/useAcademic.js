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
 * Lấy danh sách Khoa (áp dụng chung toàn trường).
 * enabled: Mặc định luôn fetch; có thể tắt qua options.enabled = false.
 */
export const useFaculties = (cohortCode, options = {}) =>
  useQuery({
    queryKey: ['academic', 'faculties'],
    queryFn: () => getFacultiesByCohort(cohortCode).then((r) => r.data.data),
    staleTime: ACADEMIC_STALE_TIME,
    ...options,
  });

/**
 * Lấy danh sách Ngành theo mã Khoa (faculty_code).
 * Chỉ fetch khi facultyCode có giá trị.
 */
export const useMajors = (facultyCode, options = {}) =>
  useQuery({
    queryKey: ['academic', 'majors', facultyCode],
    queryFn: () => getMajorsByFaculty(facultyCode).then((r) => r.data.data),
    enabled: !!facultyCode,
    staleTime: ACADEMIC_STALE_TIME,
    ...options,
  });

/**
 * Lấy danh sách Môn học theo mã Ngành (major_code).
 * Chỉ fetch khi majorCode có giá trị.
 */
export const useSubjects = (majorCode, options = {}) =>
  useQuery({
    queryKey: ['academic', 'subjects', majorCode],
    queryFn: () => getSubjectsByMajor(majorCode).then((r) => r.data.data),
    enabled: !!majorCode,
    staleTime: ACADEMIC_STALE_TIME,
    ...options,
  });
