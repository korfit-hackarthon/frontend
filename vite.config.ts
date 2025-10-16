import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Kuuid',
        short_name: 'Kuuid',
        description: 'Kuuid App',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'kuuid_logo2.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      devOptions: {
        enabled: true, // 개발 환경에서도 PWA 테스트 가능
      },
    }),
  ],
  server: {
    host: true,
    port: 3000,
  },
});
