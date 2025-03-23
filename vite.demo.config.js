import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    root: 'demo',
    plugins: [react(), svgr()],
    base: '/react-circular-slider/',
    build: {
        outDir: '../build',
        emptyOutDir: true,
    },
});
