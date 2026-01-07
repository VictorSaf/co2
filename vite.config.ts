import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'chartjs-plugin-annotation'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'utils-vendor': ['date-fns', 'axios', 'uuid'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  server: {
    host: '0.0.0.0',
    port: Number((globalThis as { process?: { env?: { PORT?: string } } }).process?.env?.PORT) || 3000,
    cors: true,
    allowedHosts: ['platonos.mooo.com', 'localhost', '127.0.0.1'],
    hmr: {
      host: 'localhost',
      port: Number((globalThis as { process?: { env?: { PORT?: string } } }).process?.env?.PORT) || 3000,
      protocol: 'ws',
      // Reduce HMR errors by being more lenient with chunk loading
      overlay: false // Disable error overlay for HMR issues (we handle them manually)
    },
    // Watch options to reduce unnecessary reloads
    watch: {
      // Ignore node_modules to reduce file watching overhead
      ignored: ['**/node_modules/**', '**/dist/**']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})