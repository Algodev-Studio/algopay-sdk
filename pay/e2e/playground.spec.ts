import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

test.describe("Playground", () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, `pg-${Date.now()}@algopay.test`, "testpass123");
    await page.goto("/dashboard/playground");
  });

  test("runs list-agents command successfully", async ({ page }) => {
    await page.getByRole("button", { name: /list agents/i }).click();
    await page.getByRole("button", { name: /^run$/i }).click();
    await expect(page.getByText(/success|200|\[\]/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("runs list-merchants command successfully", async ({ page }) => {
    await page.getByRole("button", { name: /list merchants/i }).click();
    await page.getByRole("button", { name: /^run$/i }).click();
    await expect(page.getByText(/success|200|\[\]/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
