/**
 * useUsers.js
 * Custom TanStack Query hooks cho User Profile & Avatar operations.
 *
 * Tính năng:
 *  - `useProfile`: Lấy thông tin profile chi tiết của user đang đăng nhập.
 *  - `useUpdateProfile`: Mutation cập nhật họ tên, số điện thoại, ngày sinh + đồng bộ Zustand store.
 *  - `useUpdateAvatar`: Mutation tải lên ảnh đại diện mới + đồng bộ Zustand store.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProfile, updateProfile, updateAvatar } from '#/api/userApi';
import { useAuthStore } from '#/stores/useAuthStore';

/**
 * Hook truy vấn thông tin Profile cá nhân.
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await getProfile();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};

/**
 * Hook cập nhật thông tin cá nhân (full_name, phone, dob).
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (body) => updateProfile(body),
    onSuccess: (response) => {
      const updatedUser = response.data?.data || {};
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateUser(updatedUser);
      toast.success('Cập nhật thông tin cá nhân thành công!');
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.';
      toast.error(msg);
    },
  });
};

/**
 * Hook tải lên và cập nhật ảnh đại diện (Avatar).
 */
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (formData) => updateAvatar(formData),
    onSuccess: (response) => {
      const avatarUrl = response.data?.data?.avatar_url || response.data?.data?.avatar;
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (avatarUrl) {
        updateUser({ avatar: avatarUrl, avatar_url: avatarUrl });
      }
      toast.success('Cập nhật ảnh đại diện mới thành công!');
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Không thể tải lên ảnh đại diện. Vui lòng kiểm tra dung lượng định dạng file.';
      toast.error(msg);
    },
  });
};
