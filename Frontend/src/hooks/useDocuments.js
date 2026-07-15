/**
 * useDocuments.js
 * Custom hooks cho Document operations.
 *
 * Query Key Convention:
 *  ['documents', 'search', params]  — Danh sách tìm kiếm
 *  ['documents', 'my']              — Tài liệu của tôi
 *  ['documents', 'trash']           — Thùng rác
 *  ['documents', 'bookmarks']       — Đã lưu
 *  ['documents', 'likes']           — Đã thích
 *  ['documents', 'detail', id]      — Chi tiết 1 tài liệu
 *
 * Invalidation strategy:
 *  - Sau khi Like/Bookmark: invalidate tất cả ['documents'] để đồng bộ count.
 *  - Sau khi upload/update/delete: invalidate ['documents', 'my'] và ['documents', 'search'].
 *  - Sau khi restore: invalidate ['documents', 'trash'] và ['documents', 'my'].
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  searchDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  softDeleteDocument,
  restoreDocument,
  toggleLike,
  toggleBookmark,
  getTrash,
  getBookmarks,
  getLikes,
} from '#/api/documentApi';

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export const useSearchDocuments = (params, options = {}) =>
  useQuery({
    queryKey: ['documents', 'search', params],
    queryFn: () => searchDocuments(params).then((r) => r.data.data),
    placeholderData: (prev) => prev, // keepPreviousData equivalent — tránh flicker khi đổi trang
    ...options,
  });

export const useMyDocuments = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['documents', 'my', params],
    queryFn: () => searchDocuments({ mine: true, ...params }).then((r) => r.data.data),
    placeholderData: (prev) => prev,
    ...options,
  });

export const useDocumentDetail = (id, options = {}) =>
  useQuery({
    queryKey: ['documents', 'detail', id],
    queryFn: () => getDocumentById(id).then((r) => r.data.data),
    enabled: !!id, // Không fetch khi id là null/undefined
    ...options,
  });

export const useTrash = (params, options = {}) =>
  useQuery({
    queryKey: ['documents', 'trash', params],
    queryFn: () => getTrash(params).then((r) => r.data.data),
    placeholderData: (prev) => prev,
    ...options,
  });

export const useBookmarks = (params, options = {}) =>
  useQuery({
    queryKey: ['documents', 'bookmarks', params],
    queryFn: () => getBookmarks(params).then((r) => r.data.data),
    placeholderData: (prev) => prev,
    ...options,
  });

export const useLikedDocuments = (params, options = {}) =>
  useQuery({
    queryKey: ['documents', 'likes', params],
    queryFn: () => getLikes(params).then((r) => r.data.data),
    placeholderData: (prev) => prev,
    ...options,
  });

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export const useUploadDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      toast.success('Tải lên tài liệu thành công!');
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['groups', 'documents'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Tải lên thất bại. Vui lòng thử lại.');
    },
  });
};

export const useUpdateDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateDocument(id, body),
    onSuccess: (_, { id }) => {
      toast.success('Cập nhật tài liệu thành công!');
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['groups', 'documents'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại.');
    },
  });
};

export const useSoftDeleteDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: softDeleteDocument,
    onSuccess: (_, deletedId) => {
      toast.success('Đã chuyển tài liệu vào Thùng rác.');

      // 1. Cập nhật cache tức thì (Optimistic UI removal) — Loại bỏ tài liệu vừa xóa khỏi tất cả danh sách đang hiển thị
      qc.setQueriesData({ queryKey: ['documents'] }, (oldData) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData)) {
          return oldData.filter((doc) => doc.id !== deletedId);
        }
        if (oldData?.documents) {
          const newDocs = oldData.documents.filter((doc) => doc.id !== deletedId);
          const newTotal = oldData.pagination
            ? Math.max(0, oldData.pagination.total - 1)
            : oldData.pagination;
          return {
            ...oldData,
            documents: newDocs,
            pagination: oldData.pagination
              ? { ...oldData.pagination, total: newTotal }
              : oldData.pagination,
          };
        }
        return oldData;
      });

      qc.setQueriesData({ queryKey: ['groups', 'documents'] }, (oldData) => {
        if (!oldData || !oldData.documents) return oldData;
        const newDocs = oldData.documents.filter((doc) => doc.id !== deletedId);
        const newTotal = oldData.pagination
          ? Math.max(0, oldData.pagination.total - 1)
          : oldData.pagination;
        return {
          ...oldData,
          documents: newDocs,
          pagination: oldData.pagination
            ? { ...oldData.pagination, total: newTotal }
            : oldData.pagination,
        };
      });

      // 2. Invalidate tất cả query liên quan để đồng bộ hoàn hảo với Server
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['groups', 'documents'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xóa thất bại.');
    },
  });
};

export const useRestoreDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: restoreDocument,
    onSuccess: (_, restoredId) => {
      toast.success('Đã khôi phục tài liệu thành công!');

      // Cập nhật ngay trong cache trash để xoá khỏi tab Thùng rác
      qc.setQueriesData({ queryKey: ['documents', 'trash'] }, (oldData) => {
        if (!oldData || !oldData.documents) return oldData;
        const newDocs = oldData.documents.filter((doc) => doc.id !== restoredId);
        return {
          ...oldData,
          documents: newDocs,
          pagination: oldData.pagination
            ? { ...oldData.pagination, total: Math.max(0, oldData.pagination.total - 1) }
            : oldData.pagination,
        };
      });

      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['groups', 'documents'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Khôi phục thất bại.');
    },
  });
};

/**
 * Optimistic Update cho Like.
 *
 * Flow:
 *  1. onMutate: Hủy các query đang chạy → snapshot cache → flip is_liked và like_count ngay lập tức.
 *  2. onError: Rollback về snapshot.
 *  3. onSettled: Invalidate để sync với server (luôn chạy kể cả khi thành công).
 *
 * Tại sao dùng cancelQueries trước khi optimistic update?
 *  Để tránh race condition: nếu có query đang refetch và trả về kết quả cũ
 *  SAU KHI ta đã update optimistically, nó sẽ ghi đè lên state mới của ta.
 */
export const useToggleLike = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: toggleLike,

    onMutate: async (documentId) => {
      // 1. Hủy tất cả query liên quan đang fetch
      await qc.cancelQueries({ queryKey: ['documents'] });

      // 2. Snapshot cache hiện tại để rollback nếu lỗi
      const previousData = qc.getQueriesData({ queryKey: ['documents'] });

      // 3. Optimistic update: flip is_liked và cập nhật like_count trong tất cả cache chứa document này
      qc.setQueriesData({ queryKey: ['documents'] }, (oldData) => {
        if (!oldData) return oldData;

        // Handle cả dạng object { documents: [] } lẫn dạng array
        const updateDoc = (doc) => {
          if (doc?.id !== documentId) return doc;
          const liked = !doc.is_liked;
          return {
            ...doc,
            is_liked: liked,
            like_count: liked ? (doc.like_count || 0) + 1 : Math.max(0, (doc.like_count || 0) - 1),
          };
        };

        if (Array.isArray(oldData)) return oldData.map(updateDoc);
        if (oldData?.documents) return { ...oldData, documents: oldData.documents.map(updateDoc) };
        return oldData;
      });

      return { previousData }; // Context để rollback
    },

    onError: (_err, _id, context) => {
      // Rollback
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          qc.setQueryData(queryKey, data);
        });
      }
      toast.error('Không thể thực hiện. Vui lòng thử lại.');
    },

    onSettled: () => {
      // Sync với server sau cùng
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

/**
 * Optimistic Update cho Bookmark — logic tương tự Like.
 */
export const useToggleBookmark = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: toggleBookmark,

    onMutate: async (documentId) => {
      await qc.cancelQueries({ queryKey: ['documents'] });
      const previousData = qc.getQueriesData({ queryKey: ['documents'] });

      qc.setQueriesData({ queryKey: ['documents'] }, (oldData) => {
        if (!oldData) return oldData;

        const updateDoc = (doc) => {
          if (doc?.id !== documentId) return doc;
          return { ...doc, is_bookmarked: !doc.is_bookmarked };
        };

        if (Array.isArray(oldData)) return oldData.map(updateDoc);
        if (oldData?.documents) return { ...oldData, documents: oldData.documents.map(updateDoc) };
        return oldData;
      });

      return { previousData };
    },

    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          qc.setQueryData(queryKey, data);
        });
      }
      toast.error('Không thể thực hiện. Vui lòng thử lại.');
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
