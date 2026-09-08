import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/browser',
  outputDir: './test-results',
  use: { baseURL: 'http://127.0.0.1:5188/react-circular-slider/web-component/', headless: true, channel: process.env.PLAYWRIGHT_CHANNEL },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5188/react-circular-slider/web-component/', reuseExistingServer: !process.env.CI, timeout: 60000 },
});
