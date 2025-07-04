import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://118.196.22.104:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1')
      }
    }
  }
})
