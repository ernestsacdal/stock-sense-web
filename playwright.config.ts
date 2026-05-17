import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the StockSense end-to-end golden path.
 *
 * Prerequisites (one-time):
 *   pnpm exec playwright install chromium
 *   The backend must be running on :8001 with the admin user seeded
 *   (run `python scripts/seed.py` in backend/).
 *
 * Run:
 *   pnpm test:e2e
 *
 * Playwright spins up `pnpm dev --port 3001` itself so the suite
 * doesn't fight the dev server you keep open at :3000.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3001",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:8001",
    },
  },
});
