import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies API calls and uploaded images to the Express backend,
// so the frontend can use relative URLs (/api/..., /uploads/...) with no CORS setup.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
