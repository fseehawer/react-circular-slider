import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/react-circular-slider/', // this is important for GitHub Pages!
    build: {
        outDir: 'build',
    },
});
