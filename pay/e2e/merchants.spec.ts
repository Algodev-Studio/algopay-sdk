import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

const TEST_ADDRESS = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";

test.describe("Merchants CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, `merch-${Date.now()}@algopay.test`, "testpass123");
  });

  test("creates merchant and lists it", async ({ page }) => {
    const name = `Merchant ${Date.now()}`;
    await page.goto("/dashboard/merchants/create");
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Algorand Address").fill(TEST_ADDRESS);
    await page.getByRole("button", { name: /create merchant/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/merchants/);
    await expect(page.getByText(name)).toBeVisible();
  });
});
