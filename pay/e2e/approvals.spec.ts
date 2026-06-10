import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

test.describe("Approvals page", () => {
  test("loads approvals UI", async ({ page }) => {
    await registerUser(page, `appr-${Date.now()}@algopay.test`, "testpass123");
    await page.goto("/dashboard/approvals");
    await expect(page.getByRole("heading", { name: /approval/i })).toBeVisible();
  });

  test.fixme("approve action calls missing API route", async ({ page }) => {
    // POST /api/payments/{id}/approve and /reject are not implemented yet.
    await registerUser(page, `appr2-${Date.now()}@algopay.test`, "testpass123");
    await page.goto("/dashboard/approvals");
  });
});
