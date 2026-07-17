import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 40 * 1024 * 1024,
      },
      manifest: {
        name: 'MotionSplit',
        short_name: 'MotionSplit',
        description: 'Free, private video frame extraction to PNG or JPG sequences and ZIP files.',
        theme_color: '#050816',
        background_color: '#050816',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
