/**
 * App.jsx
 * Root Component — Chứa RouterProvider và cơ chế Khôi phục phiên làm việc (Session Restoration).
 *
 * Sử dụng kỹ thuật Promise Deduplication (Singleton restorePromise) để ngăn lỗi Race Condition:
 * Khi chạy trong chế độ React Strict Mode (dev) hoặc có nhiều yêu cầu khôi phục đồng thời,
 * chỉ duy nhất 1 request /auth/refresh được gửi lên Server (tránh lỗi 401 do Token Rotation).
 */
import { useEffect, useState, Suspense } from "react";
import { RouterProvider } from "react-router";
import axios from "axios";
import router from "#/router/index";
import { useAuthStore } from "#/stores/useAuthStore";
import { getProfile } from "#/api/userApi";
import ErrorBoundary from "#/components/layout/ErrorBoundary";
import PageLoader from "#/components/layout/PageLoader";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1";

// Singleton promise để deduplicate (chống gọi trùng) request refresh khi mount
let restorePromise = null;

export default function App() {
  const [isRestoring, setIsRestoring] = useState(true);
  const { isAuthenticated, setCredentials, clearCredentials } = useAuthStore();

  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = localStorage.getItem("refreshToken");

      // Nếu đã login trong bộ nhớ hoặc không có refreshToken -> không cần khôi phục
      if (useAuthStore.getState().isAuthenticated || !refreshToken) {
        setIsRestoring(false);
        return;
      }

      // Nếu chưa có request khôi phục nào đang chạy, khởi tạo promise mới
      if (!restorePromise) {
        restorePromise = (async () => {
          try {
            // 1. Gọi API refresh token bằng axios gốc (để không kích hoạt interceptor)
            const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
              data.data;
            let user = data.data.user;

            // Cập nhật accessToken vào memory store và refreshToken vào localStorage trước khi tải profile
            useAuthStore.getState().setAccessToken(newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            // 2. Nếu API refresh không trả về user profile, gọi API getProfile (dùng token mới trong memory)
            if (!user) {
              try {
                const profileRes = await getProfile();
                user = profileRes.data?.data?.user || profileRes.data?.data;
              } catch (profileErr) {
                if (import.meta.env.DEV) {
                  console.warn("Không thể tải thông tin profile:", profileErr);
                }
              }
            }

            // 3. Cập nhật đầy đủ user và token vào store (xác nhận isAuthenticated = true và set role)
            if (user) {
              setCredentials(user, newAccessToken);
            } else {
              clearCredentials();
              localStorage.removeItem("refreshToken");
            }
            return true;
          } catch (error) {
            // Khôi phục thất bại (token hết hạn, bị thu hồi, hoặc lỗi server)
            clearCredentials();
            localStorage.removeItem("refreshToken");
            throw error;
          } finally {
            restorePromise = null; // Reset promise khi hoàn thành
          }
        })();
      }

      try {
        // Nếu có 2 lần mount (ví dụ React Strict Mode), lần thứ 2 sẽ chờ promise của lần 1
        await restorePromise;
      } catch (error) {
        // Lỗi đã được xử lý trong promise (clear credentials), chỉ cần catch để không bị unhandled rejection
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, []);

  // Hiển thị màn hình chờ trong lúc khôi phục session để tránh nhấp nháy giao diện (flicker/redirect)
  if (isRestoring) {
    return <PageLoader message="Đang khôi phục phiên làm việc..." />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  );
}
