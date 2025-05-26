import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'ResourceRellationnelle PWA',
        short_name: 'ResourceRel',
        description: 'Application de gestion des ressources relationnelles - Progressive Web App',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'fr',
        categories: ['productivity', 'utilities', 'business'],
        screenshots: [
          {
            src: 'http://localhost:3000/img/screenshot_web.png',
            sizes: '1091x916',
            type: 'image/png',
            form_factor: "wide"          },
          {
            src: 'http://localhost:3000/img/screenshot_tel.png',
            sizes: '452x920',
            type: 'image/png',
            form_factor: "narrow"
          }
        ],
        icons: [
          {
            src: 'http://localhost:3000/img/favicon-ressources-relationnelles.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400 // 24 heures
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
})