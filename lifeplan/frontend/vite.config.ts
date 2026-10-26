import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// เปิด host เพื่อทดสอบผ่าน LAN บนมือถือ (ตามแผนวันที่ 13 ต.ค.)
// proxy /api -> backend ทำให้มือถือเรียก API ผ่านพอร์ตเดียวกันได้ ไม่ต้องแก้ IP
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
