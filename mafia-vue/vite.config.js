import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [BootstrapVueNextResolver()]
    })
  ],
  server: {
    port: 8082,
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
