import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number((globalThis as any).process?.env?.PORT) || 5174,
    cors: true,
    allowedHosts: ['platonos.mooo.com', 'localhost', '127.0.0.1'],
    hmr: {
      host: 'localhost',
      port: Number((globalThis as any).process?.env?.PORT) || 5174,
      protocol: 'ws'
    }
  }
})