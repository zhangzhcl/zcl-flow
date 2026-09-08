import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          flowgram: ['@flowgram.ai/free-layout-editor'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
