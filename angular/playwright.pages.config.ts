import { defineConfig } from '@playwright/test';
import config from './playwright.config';

export default defineConfig({
  ...config,
  testMatch: 'pages.spec.ts',
  use: { ...config.use, baseURL: 'http://127.0.0.1:5183/react-circular-slider/' },
  webServer: {
    command: 'npm run build-demo && npm exec vite -- preview --config vite.demo.config.js --host 127.0.0.1 --port 5183 --strictPort',
    cwd: '..',
    url: 'http://127.0.0.1:5183/react-circular-slider/',
    timeout: 120000,
  },
});
