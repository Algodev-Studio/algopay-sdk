import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

test.describe("Gas pools", () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, `gas-${Date.now()}@algopay.test`, "testpass123");
  });

  test("creates gas pool and lists it", async ({ page }) => {
    await page.goto("/dashboard/gas/create");
    await page.getByLabel(/Initial Balance/i).fill("100");
    await page.getByLabel(/Daily Cap/i).fill("100000");
    await page.getByLabel(/Alert Threshold/i).fill("10");
    await page.getByRole("button", { name: /create gas pool/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/gas/);
    await expect(page.getByText(/100\.00|100 USDC/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
