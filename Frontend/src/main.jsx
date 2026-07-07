import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.jsx";

/**
 * QueryClient Configuration
 *
 * staleTime: 60_000 (1 phút) — Dữ liệu được coi là "tươi" trong 1 phút.
 *   Trong thời gian này, useQuery sẽ dùng cache mà không gọi lại API.
 *   Phù hợp với dữ liệu tài liệu, nhóm học tập — không cần realtime.
 *
 * gcTime: 5 * 60_000 (5 phút) — Cache được giữ lại 5 phút sau khi component unmount.
 *   Khi user điều hướng qua lại giữa các trang, dữ liệu vẫn có sẵn trong cache.
 *
 * retry: 1 — Thử lại 1 lần khi request thất bại.
 *   Tránh spam backend khi gặp lỗi thực sự (ví dụ: 404, 403).
 *   Interceptor của Axios đã xử lý 401 riêng — không cần retry ở đây.
 *
 * refetchOnWindowFocus: false — Tắt auto-refetch khi focus lại cửa sổ.
 *   Tránh gọi API không cần thiết khi user chuyển tab rồi quay lại.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // Mutation không retry — tránh submit form 2 lần
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/*
       * Toaster đặt ở đây (ngoài App routing) để đảm bảo toast
       * hiển thị được ở mọi trang kể cả khi đang navigate.
       * richColors: Tự động dùng màu đúng ngữ nghĩa (success=xanh, error=đỏ).
       * closeButton: Cho user tắt toast thủ công nếu muốn.
       */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>,
);
