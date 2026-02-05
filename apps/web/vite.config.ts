import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // <--- Import this

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `global` variable
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@air-portal/shared": path.resolve(__dirname, "../../packages/shared/index.ts"),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
});