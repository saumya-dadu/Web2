import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Local development only (npm run dev): forward /api to a backend running on the host.
// In containers this file is not used at runtime - nginx does the proxying (see nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: process.env.VITE_DEV_BACKEND || 'http://localhost:8080', changeOrigin: true },
    },
  },
});
