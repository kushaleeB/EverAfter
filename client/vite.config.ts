import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_API_TARGET = 'http://localhost:3001';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ROOT_DIR, '');
  const apiProxyTarget = (env.VITE_API_PROXY_TARGET || DEFAULT_API_TARGET).replace(/\/$/, '');

  return {
    envDir: ROOT_DIR,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
        },
        '/uploads': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
