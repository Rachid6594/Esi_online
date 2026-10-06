import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['react-pdf'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        /*
         * Le chunk principal est React + react-router + le radix/ui utilise par
         * les composants shadcn : ~470 Ko qui ne changent pas d'une version a
         * l'autre. Sans ce decoupage, chaque modification d'une page le
         * reinventait, et le navigateur le retelechargait entierement.
         *
         * Il faut nommer le chunk "vendor" et non "react" : le bundle contient
         * aussi lucide-react, next-themes et tout radix/ui. "vendor" survit a
         * une montee de version comme a un changement de page.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|react-responsive|@remix-run)[\\/]/.test(id)) {
            return 'vendor'
          }
          if (/[\\/]node_modules[\\/](@radix-ui|lucide-react|next-themes|sonner|class-variance-authority|clsx|tailwind-merge)[\\/]/.test(id)) {
            return 'vendor-ui'
          }
          if (/[\\/]node_modules[\\/](react-pdf|pdfjs-dist)[\\/]/.test(id)) {
            return 'vendor-pdf'
          }
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
})
