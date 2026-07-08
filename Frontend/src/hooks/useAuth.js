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
      const status = error.response?.status;
      // Luôn hiển thị lỗi chung chung cho các mã lỗi xác thực để bảo mật (tránh hacker dò tài khoản)
      const message = [400, 401, 404].includes(status)
        ? 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
        : error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại sau.';
      toast.error(message);
    },
  });
};

/**
 * Hook đăng ký.
 * Sau khi thành công: redirect về Login + toast hướng dẫn đăng nhập.
 * Hỗ trợ truyền identifier (username/email) sang LoginPage qua navigate state
 * để tự động điền sẵn (pre-fill) ô đăng nhập — giảm thao tác cho người dùng.
 */
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onSuccess: (_response, variables) => {
      toast.success('Tạo tài khoản thành công! Vui lòng đăng nhập.');
      // Truyền username hoặc email vừa đăng ký sang LoginPage để pre-fill
      navigate('/login', {
        state: { prefillIdentifier: variables.username || variables.email },
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(message);
    },
  });
};

/**
 * Hook đăng xuất.
 * Gọi API logout (gửi kèm refreshToken trong body để xóa trên server) → clear store → clear localStorage → navigate login.
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const clearCredentials = useAuthStore((s) => s.clearCredentials);

  return useMutation({
    mutationFn: () => logout({ refreshToken: localStorage.getItem('refreshToken') }),
    onSettled: () => {
      // onSettled (chạy cả khi success lẫn error) đảm bảo user luôn bị logout ở FE
      // kể cả khi API gọi thất bại (ví dụ: mất mạng)
      clearCredentials();
      localStorage.removeItem('refreshToken');
      navigate('/login');
    },
  });
};
