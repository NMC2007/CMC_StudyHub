/**
 * useAuth.js
 * Custom hooks cho Authentication operations.
 * Wrap useMutation + xử lý side effects (toast, navigate, store).
 */
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { login, register, logout } from '#/api/authApi';
import { useAuthStore } from '#/stores/useAuthStore';

/**
 * Hook đăng nhập.
 * Sau khi thành công: lưu credentials vào store + refreshToken vào localStorage → navigate '/'.
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((s) => s.setCredentials);

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setCredentials(user, accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success(`Chào mừng trở lại, ${user.full_name}!`);
      navigate('/');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      toast.error(message);
    },
  });
};

/**
 * Hook đăng ký.
 * Sau khi thành công: redirect về Login + toast hướng dẫn đăng nhập.
 */
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success('Tạo tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(message);
    },
  });
};

/**
 * Hook đăng xuất.
 * Gọi API logout (xóa refreshToken trên server) → clear store → clear localStorage → navigate login.
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const clearCredentials = useAuthStore((s) => s.clearCredentials);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      // onSettled (chạy cả khi success lẫn error) đảm bảo user luôn bị logout
      // kể cả khi API gọi thất bại (ví dụ: mất mạng)
      clearCredentials();
      localStorage.removeItem('refreshToken');
      navigate('/login');
    },
  });
};
