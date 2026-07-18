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
  // CẤU HÌNH DEV / PREVIEW SERVER (LAN & HOSTING)
  // ==========================================
  // host: true → Vite lắng nghe trên 0.0.0.0, cho phép các thiết bị/hosting truy cập
  // allowedHosts: true → Cho phép tất cả các tên miền (Render, Vercel, LAN IP...)
  // port: 5173  → Cố định cổng
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
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

