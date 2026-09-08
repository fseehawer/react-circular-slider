import { defineConfig } from '@playwright/test';
import config from './playwright.frameworks.config';

export default defineConfig({
  ...config,
  testDir: './tests/layout',
  use: { ...config.use, baseURL: process.env.SLIDER_LAYOUT_URL || 'http://127.0.0.1:5193/react-circular-slider/' },
  webServer: process.env.SLIDER_LAYOUT_URL ? undefined : {
    command: 'npm run build-demo && npm exec vite -- preview --config vite.demo.config.js --host 127.0.0.1 --port 5193 --strictPort',
    url: 'http://127.0.0.1:5193/react-circular-slider/',
    timeout: 120000,
  },
});
