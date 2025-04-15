import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/derm-ai/', // Add base URL for GitHub Pages
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5176,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});