import { defineConfig, devices } from '@playwright/test';

const UI_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: UI_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Starts the backend and frontend unless they are already running.
  // Postgres must be up first: `docker compose -f services/docker-compose.yml up -d`.
  webServer: [
    {
      command: 'pnpm --filter @space/services dev',
      cwd: '..',
      port: 4000,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @space/ui dev',
      cwd: '..',
      url: UI_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
