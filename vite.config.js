import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import copy from 'rollup-plugin-copy';

export default defineConfig({
    plugins: [
        react(),
        svgr(),
        copy({
            targets: [
                { src: 'public/**/*', dest: 'dist/public' }
            ],
            hook: 'writeBundle'
        })
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'ReactCircularSlider',
            fileName: (format) => `react-circular-slider.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                }
            }
        }
    }
});
