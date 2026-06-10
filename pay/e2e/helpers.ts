import type { APIRequestContext, Page } from "@playwright/test";

export const TEST_EMAIL = `e2e-${Date.now()}@algopay.test`;
export const TEST_PASSWORD = "testpass123";

export async function registerUser(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/Password/i).fill(password);
  await page.getByRole("button", { name: /sign up/i }).click();
  await page.waitForURL("**/dashboard**");
}

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/Password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/dashboard**");
}

export async function registerViaApi(request: APIRequestContext, baseURL: string) {
  const email = `api-${Date.now()}@algopay.test`;
  const password = "testpass123";
  const res = await request.post(`${baseURL}/api/auth/register`, {
    data: { email, password },
  });
  if (!res.ok()) {
    throw new Error(`register failed: ${res.status()} ${await res.text()}`);
  }
  return { email, password };
}
