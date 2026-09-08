import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/react-circular-slider/web-component/',
  build: {
    outDir: fileURLToPath(new URL('../../build/web-component', import.meta.url)),
    emptyOutDir: true,
  },
  server: { fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] } },
});
