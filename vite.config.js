import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project site lives under /<repo>/ — relative base keeps
  // assets, SW scope, and manifest working both locally and in production.
  base: '/resilient-mesh/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Auto-update SW: critical for emergency app — users always get latest shell.
      registerType: 'autoUpdate',

      // Workbox handles offline caching. No server needed — 100% client-side.
      workbox: {
        // Precache all built static assets (JS/CSS/HTML/icons).
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Runtime cache for Leaflet map tiles so maps work 100% offline
        // after first visit. CacheFirst = serve from cache when offline.
        runtimeCaching: [
          {
            // OpenStreetMap standard tiles
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-map-tiles',
              expiration: {
                maxEntries: 500, // ~ a city-level region
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // OSM tile mirror / humanitarian layer (fallback source)
            urlPattern: /^https:\/\/.*\.tile\.opentopomap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-topo-tiles',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      // PWA manifest — makes the app installable on phones/desktops.
      manifest: {
        name: 'Resilient Mesh — Offline Emergency P2P',
        short_name: 'ResilientMesh',
        description:
          'Zero-cost, serverless, offline-first P2P emergency communication. Messages & alerts stored locally in IndexedDB.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0f172a',
        theme_color: '#dc2626',
        categories: ['utilities', 'medical', 'navigation'],
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      devOptions: {
        // Generates SW even in `npm run dev` so offline behavior is testable.
        enabled: true,
      },
    }),
  ],
})
