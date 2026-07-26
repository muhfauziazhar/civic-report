import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run dev --workspace=@civic-report/server',
      url: 'http://localhost:3001/api/health',
      cwd: '..',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev --workspace=@civic-report/web',
      url: 'http://localhost:5173',
      cwd: '..',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
