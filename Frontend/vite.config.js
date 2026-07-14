import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

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
})
