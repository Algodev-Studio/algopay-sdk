import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

test.describe("Dashboard shell", () => {
  test.beforeEach(async ({ page }) => {
    await registerUser(page, `nav-${Date.now()}@algopay.test`, "testpass123");
  });

  test("sidebar links navigate to key pages", async ({ page }) => {
    const links = [
      { name: "Overview", url: /\/dashboard$/ },
      { name: "Payments", url: /\/dashboard\/payments/ },
      { name: "Agents", url: /\/dashboard\/agents/ },
      { name: "Merchants", url: /\/dashboard\/merchants/ },
      { name: "Gas Pools", url: /\/dashboard\/gas/ },
      { name: "Settings", url: /\/dashboard\/settings/ },
      { name: "SDK Events", url: /\/dashboard\/sdk-events/ },
      { name: "Playground", url: /\/dashboard\/playground/ },
    ];
    for (const link of links) {
      await page.getByRole("link", { name: link.name, exact: true }).first().click();
      await expect(page).toHaveURL(link.url);
    }
  });

  test("network toggle switches testnet/mainnet label", async ({ page }) => {
    const toggle = page.getByRole("button", { name: /testnet|mainnet/i }).first();
    const before = await toggle.textContent();
    await toggle.click();
    const after = await toggle.textContent();
    expect(before).not.toEqual(after);
  });
});
