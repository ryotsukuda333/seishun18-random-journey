import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: parseInt(env.FRONTEND_PORT || '3000'),
      host: true, // Docker内から外部へのアクセスを許可
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
})