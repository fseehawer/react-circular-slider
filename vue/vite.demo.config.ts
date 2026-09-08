import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: fileURLToPath(new URL('./demo', import.meta.url)),
  base: '/react-circular-slider/vue/',
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@fiojs/vue-circular-slider/style.css', replacement: fileURLToPath(new URL('./dist/style.css', import.meta.url)) },
      { find: '@fiojs/vue-circular-slider', replacement: fileURLToPath(new URL('./dist/index.js', import.meta.url)) },
    ],
    dedupe: ['vue'],
  },
  build: {
    outDir: fileURLToPath(new URL('../build/vue', import.meta.url)),
    emptyOutDir: true,
  },
  server: { port: 5187, strictPort: true },
});
