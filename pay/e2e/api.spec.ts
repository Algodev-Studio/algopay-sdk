import { test, expect } from "@playwright/test";
import { registerUser } from "./helpers";

const TEST_ADDRESS = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";

test.describe("API contracts", () => {
  test("returns 401 without session cookie", async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/api/agents`);
    expect(res.status()).toBe(401);
  });

  test("returns 401 on agent pay without bearer", async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}/api/agent/pay`, {
      data: { amount: "1", recipient: TEST_ADDRESS },
    });
    expect(res.status()).toBe(401);
  });

  test("processes pending payment with SIM txn id", async ({ page, request, baseURL }) => {
    await registerUser(page, `pay-${Date.now()}@algopay.test`, "testpass123");

    await page.goto("/dashboard/gas/create");
    await page.getByLabel(/Initial Balance/i).fill("100");
    await page.getByLabel(/Daily Cap/i).fill("100000");
    await page.getByLabel(/Alert Threshold/i).fill("10");
    await page.getByRole("button", { name: /create gas pool/i }).click();
    await page.waitForURL(/\/dashboard\/gas/);

    const poolsRes = await request.get(`${baseURL}/api/gas-pools`);
    expect(poolsRes.ok()).toBeTruthy();
    const pools = (await poolsRes.json()) as { id: string }[];
    const poolId = pools[0]?.id;
    expect(poolId).toBeTruthy();

    const agentRes = await request.post(`${baseURL}/api/agents`, {
      data: {
        name: "E2E Agent",
        algoAddress: TEST_ADDRESS,
        dailyLimitCents: 50000,
        poolId,
      },
    });
    expect(agentRes.ok()).toBeTruthy();
    const agent = (await agentRes.json()) as { id: string };

    const paymentRes = await request.post(`${baseURL}/api/payments`, {
      data: {
        agentId: agent.id,
        amountCents: 100,
        recipient: TEST_ADDRESS,
        purpose: "e2e test",
      },
    });
    expect(paymentRes.ok()).toBeTruthy();
    const payment = (await paymentRes.json()) as { id: string };

    const processRes = await request.post(`${baseURL}/api/payments/${payment.id}/process`);
    expect(processRes.ok()).toBeTruthy();
    const settled = (await processRes.json()) as { status: string; algoTxnId: string };
    expect(settled.status).toBe("settled");
    expect(settled.algoTxnId).toMatch(/^SIM_/);
  });
});
