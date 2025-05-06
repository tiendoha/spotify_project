import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://3.0.19.68',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env.REACT_APP_BACKEND_URL': JSON.stringify('http://3.0.19.68'),
    'process.env.REACT_APP_GOOGLE_API_KEY': JSON.stringify('AIzaSyDfIyaLMuJR2C-f2lyHCdaFvWXsTp36BLs'),
  },
});