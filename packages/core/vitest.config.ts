import path from 'path';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    pool: 'threads',
    server: {
      deps: {
        inline: ['@exodus/bytes']
      }
    },
    alias: {
      'vue3-adaptive-card-engine': path.resolve(__dirname, 'src/index.ts')
    }
  }
});
