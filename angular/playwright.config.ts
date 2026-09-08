import { defineConfig } from '@playwright/test';

const signalForms = Boolean(process.env['SLIDER_SIGNAL_FORMS']);
const baseURL = signalForms ? 'http://127.0.0.1:5182/react-circular-slider/angular/signals/' : 'http://127.0.0.1:5180/react-circular-slider/angular/';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: signalForms ? 'signal-forms.spec.ts' : 'slider.spec.ts',
  fullyParallel: true,
  workers: process.env['CI'] ? 2 : undefined,
  use: {
    baseURL: process.env['SLIDER_TEST_URL'] || baseURL,
    launchOptions: process.env['SLIDER_CHROME_PATH'] ? { executablePath: process.env['SLIDER_CHROME_PATH'] } : {},
    trace: 'retain-on-failure',
  },
  webServer: process.env['SLIDER_TEST_URL'] ? undefined : {
    command: process.env['SLIDER_CONSUMER_DIR'] ? `"${process.execPath}" node_modules/@angular/cli/bin/ng.js serve ${signalForms ? 'signals --port 5182' : 'demo --port 5180'} --host 127.0.0.1` : 'npm run dev -- --port 5180',
    cwd: process.env['SLIDER_CONSUMER_DIR'],
    url: baseURL,
    reuseExistingServer: !process.env['CI'],
    timeout: 120000,
  },
});
