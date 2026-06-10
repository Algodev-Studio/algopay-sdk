import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

const TEST_ADDRESS = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";

test.describe("Agents CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, `agent-${Date.now()}@algopay.test`, "testpass123");
    await page.goto("/dashboard/gas/create");
    await page.getByLabel(/Initial Balance/i).fill("50");
    await page.getByLabel(/Daily Cap/i).fill("50000");
    await page.getByLabel(/Alert Threshold/i).fill("5");
    await page.getByRole("button", { name: /create gas pool/i }).click();
    await page.waitForURL(/\/dashboard\/gas/);
  });

  test("creates agent and lists it", async ({ page }) => {
    const name = `Agent ${Date.now()}`;
    await page.goto("/dashboard/agents/create");
    await page.getByLabel(/^Name$/i).fill(name);
    await page.getByLabel(/Algo Address|Algorand Address/i).fill(TEST_ADDRESS);
    await page.getByLabel(/Daily Limit/i).fill("50000");
    const poolSelect = page.locator("select").first();
    await poolSelect.waitFor();
    const options = await poolSelect.locator("option").all();
    if (options.length > 1) {
      await poolSelect.selectOption({ index: 1 });
    }
    await page.getByRole("button", { name: /create agent/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/agents/);
    await expect(page.getByText(name)).toBeVisible();
  });
});
