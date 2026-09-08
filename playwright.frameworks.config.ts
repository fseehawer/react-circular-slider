import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/frameworks',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: process.env.SLIDER_FRAMEWORK_URL || 'http://127.0.0.1:5190/react-circular-slider/',
    launchOptions: process.env.SLIDER_CHROME_PATH ? { executablePath: process.env.SLIDER_CHROME_PATH } : {},
    trace: 'retain-on-failure',
  },
  webServer: process.env.SLIDER_FRAMEWORK_URL ? undefined : {
    command: 'npm run build-demo:vue && npm run build-demo:web-component && npm exec vite -- preview --config vite.demo.config.js --host 127.0.0.1 --port 5190 --strictPort',
    url: 'http://127.0.0.1:5190/react-circular-slider/vue/',
    timeout: 120000,
  },
});
