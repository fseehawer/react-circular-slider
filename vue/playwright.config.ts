import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5187/react-circular-slider/vue/',
    browserName: 'chromium',
    viewport: { width: 1280, height: 960 },
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5187/react-circular-slider/vue/',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
