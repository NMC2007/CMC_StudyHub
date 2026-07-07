/**
 * useGroups.js
 * Custom hooks cho Study Groups operations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getMyGroups,
  getGroupById,
  createGroup,
  addMembers,
  removeMember,
  disbandGroup,
  shareDocumentToGroup,
  getGroupDocuments,
} from '#/api/groupApi';

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export const useMyGroups = (options = {}) =>
  useQuery({
    queryKey: ['groups', 'my'],
    queryFn: () => getMyGroups().then((r) => r.data.data),
    ...options,
  });

export const useGroupDetail = (groupId, options = {}) =>
  useQuery({
    queryKey: ['groups', 'detail', groupId],
    queryFn: () => getGroupById(groupId).then((r) => r.data.data),
    enabled: !!groupId,
    ...options,
  });

export const useGroupDocuments = (groupId, params, options = {}) =>
  useQuery({
    queryKey: ['groups', 'documents', groupId, params],
    queryFn: () => getGroupDocuments(groupId, params).then((r) => r.data.data),
    enabled: !!groupId,
    placeholderData: (prev) => prev,
    ...options,
  });

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export const useCreateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      toast.success('Tạo nhóm học tập thành công!');
      qc.invalidateQueries({ queryKey: ['groups', 'my'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tạo nhóm thất bại.');
    },
  });
};

export const useAddMembers = (groupId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => addMembers(groupId, body),
    onSuccess: () => {
      toast.success('Đã thêm thành viên vào nhóm!');
      qc.invalidateQueries({ queryKey: ['groups', 'detail', groupId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Thêm thành viên thất bại.');
    },
  });
};

export const useRemoveMember = (groupId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId) => removeMember(groupId, userId),
    onSuccess: () => {
      toast.success('Đã xóa thành viên khỏi nhóm.');
      qc.invalidateQueries({ queryKey: ['groups', 'detail', groupId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa thành viên thất bại.');
    },
  });
};

export const useDisbandGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disbandGroup,
    onSuccess: () => {
      toast.success('Đã giải tán nhóm học tập.');
      qc.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Giải tán nhóm thất bại.');
    },
  });
};

export const useShareDocumentToGroup = (groupId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => shareDocumentToGroup(groupId, body),
    onSuccess: () => {
      toast.success('Đã chia sẻ tài liệu vào nhóm!');
      qc.invalidateQueries({ queryKey: ['groups', 'documents', groupId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Chia sẻ tài liệu thất bại.');
    },
  });
};
