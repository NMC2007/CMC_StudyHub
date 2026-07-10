/**
 * useAdmin.js
 * Custom TanStack Query hooks dành riêng cho Quản trị viên (Admin).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSystemStats,
  getSystemHealth,
  updateUserStatus,
  triggerTrashCleanup,
  triggerTokenCleanup,
} from "#/api/adminApi";
import { getAllUsers } from "#/api/userApi";
import {
  getCohorts,
  createCohort,
  updateCohort,
  deleteCohort,
  getAllFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getMajorsByFacultyAdmin,
  createMajor,
  updateMajor,
  deleteMajor,
  getSubjectsByMajorAdmin,
  createSubject,
  updateSubject,
  deleteSubject,
} from "#/api/academicApi";

// ─── ADMIN STATS & HEALTH ─────────────────────────────────────────────────────

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await getSystemStats();
      return res.data?.data || null;
    },
    staleTime: 60 * 1000, // 1 phút
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ["systemHealth"],
    queryFn: async () => {
      const res = await getSystemHealth();
      return res.data?.data || null;
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000, // Tự động cập nhật sau mỗi 30s
  });
};

// ─── ADMIN USERS MANAGEMENT ───────────────────────────────────────────────────

export const useAdminUsers = (params = {}) => {
  return useQuery({
    queryKey: ["adminUsers", params],
    queryFn: async () => {
      const res = await getAllUsers(params);
      return res.data?.data || { users: [], pagination: {} };
    },
    staleTime: 30 * 1000,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }) => {
      const res = await updateUserStatus(userId, { status });
      return res.data?.data;
    },
    onSuccess: (data) => {
      toast.success(`Cập nhật trạng thái tài khoản thành ${data?.status || "công"}!`);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message || "Không thể cập nhật trạng thái người dùng.";
      toast.error(msg);
    },
  });
};

// ─── CRON JOBS MANAGEMENT ─────────────────────────────────────────────────────

export const useCronTriggers = () => {
  const queryClient = useQueryClient();

  const trashMutation = useMutation({
    mutationFn: async ({ days }) => {
      const res = await triggerTrashCleanup({ days });
      return res.data?.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || `Đã dọn dẹp ${data?.deleted_count || 0} tài liệu rác.`
      );
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi khi dọn dẹp thùng rác.");
    },
  });

  const tokenMutation = useMutation({
    mutationFn: async () => {
      const res = await triggerTokenCleanup();
      return res.data?.data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || `Đã thu hồi ${data?.deleted_count || 0} token hết hạn.`
      );
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi khi dọn dẹp token.");
    },
  });

  return {
    triggerTrashCleanup: trashMutation,
    triggerTokenCleanup: tokenMutation,
  };
};

// ─── ADMIN ACADEMIC CRUD ──────────────────────────────────────────────────────

export const useAdminCohorts = () => {
  const queryClient = useQueryClient();

  const cohortsQuery = useQuery({
    queryKey: ["adminCohorts"],
    queryFn: async () => {
      const res = await getCohorts();
      const data = res.data?.data;
      return Array.isArray(data) ? data : data?.cohorts || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (body) => (await createCohort(body)).data?.data,
    onSuccess: () => {
      toast.success("Thêm Khóa học thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminCohorts"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi thêm khóa học"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }) => (await updateCohort(id, body)).data?.data,
    onSuccess: () => {
      toast.success("Cập nhật Khóa học thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminCohorts"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi cập nhật"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await deleteCohort(id)).data?.data,
    onSuccess: () => {
      toast.success("Xóa Khóa học thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminCohorts"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Không thể xóa"),
  });

  return { cohortsQuery, createMutation, updateMutation, deleteMutation };
};

export const useAdminFaculties = () => {
  const queryClient = useQueryClient();

  const facultiesQuery = useQuery({
    queryKey: ["adminFaculties"],
    queryFn: async () => {
      const res = await getAllFaculties();
      const data = res.data?.data;
      return Array.isArray(data) ? data : data?.faculties || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (body) => (await createFaculty(body)).data?.data,
    onSuccess: () => {
      toast.success("Thêm Khoa thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminFaculties"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi thêm khoa"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }) => (await updateFaculty(id, body)).data?.data,
    onSuccess: () => {
      toast.success("Cập nhật Khoa thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminFaculties"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi cập nhật"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await deleteFaculty(id)).data?.data,
    onSuccess: () => {
      toast.success("Xóa Khoa thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminFaculties"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Không thể xóa"),
  });

  return { facultiesQuery, createMutation, updateMutation, deleteMutation };
};

export const useAdminMajors = (facultyCode = null) => {
  const queryClient = useQueryClient();

  const majorsQuery = useQuery({
    queryKey: ["adminMajors", facultyCode || "all"],
    queryFn: async () => {
      const res = await getMajorsByFacultyAdmin(facultyCode);
      const data = res.data?.data;
      return Array.isArray(data) ? data : data?.majors || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (body) => (await createMajor(body)).data?.data,
    onSuccess: () => {
      toast.success("Thêm Ngành học thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminMajors"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi thêm ngành"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }) => (await updateMajor(id, body)).data?.data,
    onSuccess: () => {
      toast.success("Cập nhật Ngành học thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminMajors"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi cập nhật"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await deleteMajor(id)).data?.data,
    onSuccess: () => {
      toast.success("Xóa Ngành học thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminMajors"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Không thể xóa"),
  });

  return { majorsQuery, createMutation, updateMutation, deleteMutation };
};

export const useAdminSubjects = (majorCode = null) => {
  const queryClient = useQueryClient();

  const subjectsQuery = useQuery({
    queryKey: ["adminSubjects", majorCode || "all"],
    queryFn: async () => {
      const res = await getSubjectsByMajorAdmin(majorCode);
      const data = res.data?.data;
      return Array.isArray(data) ? data : data?.subjects || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (body) => (await createSubject(body)).data?.data,
    onSuccess: () => {
      toast.success("Thêm Môn học thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminSubjects"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi thêm môn học"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }) => (await updateSubject(id, body)).data?.data,
    onSuccess: () => {
      toast.success("Cập nhật Môn học thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminSubjects"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Lỗi cập nhật"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await deleteSubject(id)).data?.data,
    onSuccess: () => {
      toast.success("Xóa Môn học thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminSubjects"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Không thể xóa"),
  });

  return { subjectsQuery, createMutation, updateMutation, deleteMutation };
};
