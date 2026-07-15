import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ==========================================
  // PATH ALIASES — Khớp với jsconfig.json
  // ==========================================
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './src'),
    },
  },

  // ==========================================
  // CẤU HÌNH DEV SERVER (LAN TESTING)
  // ==========================================
  // host: true → Vite lắng nghe trên 0.0.0.0, cho phép các thiết bị
  //              khác trong mạng LAN truy cập qua http://<IP_LAN>:5173
  // port: 5173  → Cố định cổng, tránh tự động đổi sang cổng khác
  server: {
    host: true,
    port: 5173,
  },

  // ==========================================
  // CẤU HÌNH BUILD PRODUCTION
  // ==========================================
  build: {
    // Tăng ngưỡng cảnh báo chunk size (từ 500kB lên 1MB) — phù hợp với SPA có nhiều libs
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Phân tách vendor chunks để tận dụng cache trình duyệt:
        // - Nếu chỉ code app thay đổi, trình duyệt không cần tải lại vendor chunk
        manualChunks: {
          // React core runtime (ít thay đổi nhất)
          'vendor-react': ['react', 'react-dom', 'react-router'],
          // State management & data fetching
          'vendor-state': ['zustand', '@tanstack/react-query'],
          // UI libraries (icons, toasts)
          'vendor-ui': ['lucide-react', 'sonner'],
          // HTTP client
          'vendor-axios': ['axios'],
        },
      },
    },
  },
})

