import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

test.describe("API keys", () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, `keys-${Date.now()}@algopay.test`, "testpass123");
    await page.goto("/dashboard/settings");
  });

  test("generates API key with one-time display", async ({ page }) => {
    await page.getByPlaceholder(/key name|name/i).fill("E2E Key");
    await page.getByRole("button", { name: /generate/i }).click();
    await expect(page.getByText(/copy|saved|shown once/i)).toBeVisible({ timeout: 10_000 });
  });
});
