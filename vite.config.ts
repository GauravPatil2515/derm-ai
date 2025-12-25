import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5176,
    host: '0.0.0.0',
    strictPort: true,
    open: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});