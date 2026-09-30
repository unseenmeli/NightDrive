import { defineConfig, devices } from "@playwright/test";

// BASE_URL set  -> test an already-deployed site (staging/production smoke tests).
// BASE_URL unset -> build output is started locally against a throwaway database.
const remote = process.env.BASE_URL;
const port = 3100;
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: remote ?? `http://localhost:${port}`,
    trace: "retain-on-failure",
    // Lets automated requests through Vercel's deployment protection on preview/staging.
    extraHTTPHeaders: bypass
      ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" }
      : undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: remote
    ? undefined
    : {
        command: `npm run db:setup && npm run start -- -p ${port}`,
        url: `http://localhost:${port}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          PGLITE_DIR: process.env.PGLITE_DIR ?? ".pglite-e2e",
          ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@nightdrive.local",
          ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "change-me-please",
        },
      },
});
