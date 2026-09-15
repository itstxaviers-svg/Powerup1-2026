import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  base: mode === 'github' ? '/Powerup1-2026/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'assets/*.jpg'],
      workbox: {
        globIgnores: ['**/*.{png,webp}'],
        runtimeCaching: [{
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'word-code-art-v2',
            expiration: { maxEntries: 260, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        }],
      },
      manifest: {
        name: 'WORD//CODE',
        short_name: 'WORD//CODE',
        description: 'Decode, repair and master written English.',
        theme_color: '#eaf5ff',
        background_color: '#f6fbff',
        display: 'standalone',
        start_url: './',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
    }),
  ],
}))
