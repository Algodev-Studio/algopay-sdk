import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

test.describe("SDK telemetry", () => {
  test("posts SDK event via Bearer key and shows on dashboard", async ({ page, request, baseURL }) => {
    await registerUser(page, `tel-${Date.now()}@algopay.test`, "testpass123");
    await page.goto("/dashboard/settings");
    const keyName = `Telemetry Key ${Date.now()}`;
    await page.getByPlaceholder(/key name|name/i).fill(keyName);
    await page.getByRole("button", { name: /generate/i }).click();
    const keyLocator = page.locator("code").filter({ hasText: /sk_live_/ }).first();
    await expect(keyLocator).toBeVisible({ timeout: 10_000 });
    const apiKey = (await keyLocator.textContent())?.trim() ?? "";
    expect(apiKey).toMatch(/^sk_live_/);

    const eventType = "payment.completed";
    const res = await request.post(`${baseURL}/api/sdk/events`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      data: {
        eventType,
        sdkLanguage: "python",
        walletId: "w-e2e",
        amount: "1.50",
        recipient: "ADDR",
      },
    });
    expect(res.ok()).toBeTruthy();

    await page.goto("/dashboard/sdk-events");
    await expect(page.getByText(eventType)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/python/i)).toBeVisible();
  });
});
