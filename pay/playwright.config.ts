import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    cwd: root,
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://algopay_e2e:algopay_e2e@localhost:5433/algopay_e2e?schema=public",
      DIRECT_URL:
        process.env.DIRECT_URL ??
        "postgresql://algopay_e2e:algopay_e2e@localhost:5433/algopay_e2e?schema=public",
      SESSION_SECRET: process.env.SESSION_SECRET ?? "0123456789abcdef0123456789abcdef",
      ALGOPAY_VAULT_MASTER_KEY:
        process.env.ALGOPAY_VAULT_MASTER_KEY ?? "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
      NEXT_PUBLIC_APP_NAME: "AlgoPay",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      NEXT_PUBLIC_DOCS_URL: "http://localhost:3000/docs",
      ALGOPAY_NETWORK: "algorand-testnet",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
