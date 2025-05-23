import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Movie Party',
        short_name: 'App',
        description: 'Movie matcher',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '../public/trex.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '../public/shrek.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      }
    })
  ],
});