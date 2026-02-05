import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@air-portal/shared": path.resolve(__dirname, "../../packages/shared/index.ts"),
    },
  },
  define: {
    global: 'window',
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
});