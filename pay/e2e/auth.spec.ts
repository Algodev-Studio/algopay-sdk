import { test, expect } from "@playwright/test";
import { loginUser, registerUser } from "./helpers";

test.describe("Auth", () => {
  test("registers new user and lands on dashboard", async ({ page }) => {
    const email = `reg-${Date.now()}@algopay.test`;
    await registerUser(page, email, "testpass123");
    await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible({ timeout: 15_000 });
  });

  test("logs in with valid credentials", async ({ page }) => {
    const email = `login-${Date.now()}@algopay.test`;
    await registerUser(page, email, "testpass123");
    await page.context().clearCookies();
    await loginUser(page, email, "testpass123");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nobody@algopay.test");
    await page.getByLabel(/Password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid|failed|incorrect/i)).toBeVisible();
  });

  test("redirects unauthenticated dashboard access to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
