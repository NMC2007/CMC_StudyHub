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
        // Phân tách vendor chunks theo dạng function để tương thích với Vite 8 / Rolldown:
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'vendor-state';
            }
            if (id.includes('sonner')) {
              return 'vendor-ui';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            return 'vendor-core';
          }
        },
      },
    },
  },
})

