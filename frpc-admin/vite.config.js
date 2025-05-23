import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 路径别名
  resolve: {
    alias: {
      '@': '/src'
    }
  }
  ,
  // 代理 ，将 /api 代理到 127.0.0.1:8080
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

