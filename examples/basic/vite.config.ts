import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue3-adaptive-card-engine': path.resolve(
        __dirname,
        '../../packages/core/src'
      )
    }
  },
  server: {
    port: 5173
  }
});
