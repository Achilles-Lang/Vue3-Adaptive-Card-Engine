import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist',
      rollupTypes: true
    })
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AdaptiveCardEngine',
      formats: ['es', 'umd'],
      fileName: (format) => `vue3-adaptive-card-engine.${format === 'umd' ? 'umd' : 'es'}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
