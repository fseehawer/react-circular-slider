import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
    root: 'demo',
    plugins: [react(), svgr()],
    base: '/react-circular-slider/',
    resolve: {
        alias: {
            'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom/client')
        }
    },
    build: {
        outDir: '../build',
        emptyOutDir: true,
    },
});
