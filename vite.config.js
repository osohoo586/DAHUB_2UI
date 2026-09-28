import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, host: true },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor-vue', test: /node_modules[\\/](vue|@vue|vue-router|pinia)[\\/]/ },
            { name: 'vendor-chart', test: /node_modules[\\/](chart\.js|vue-chartjs|@kurkle)[\\/]/ },
            { name: 'vendor-xlsx', test: /node_modules[\\/]xlsx[\\/]/ },
            { name: 'vendor-katex', test: /node_modules[\\/]katex[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.js'],
  },
})
