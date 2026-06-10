import { describe, expect, it, vi } from "vitest";
import { AlgoPay } from "./client.js";
import { PaymentRouter } from "./payment/router.js";
import { PaymentMethod, PaymentStatus } from "./types.js";

describe("AlgoPay", () => {
  it("detectMethod delegates to router", () => {
    const client = new AlgoPay({ network: "algorand-testnet" });
    expect(client.detectMethod("https://pay.example.com/api")).toBe(PaymentMethod.X402);
  });

  it("pay uses router for settlement", async () => {
    const client = new AlgoPay({ network: "algorand-testnet" });
    const router = (client as unknown as { _router: PaymentRouter })._router;
    const spy = vi.spyOn(router, "pay").mockResolvedValue({
      success: true,
      status: PaymentStatus.COMPLETED,
      method: PaymentMethod.TRANSFER,
      amount: "1.0",
      recipient: "ADDR",
      blockchainTx: "TX",
      transactionId: "TX",
      error: null,
    });
    const result = await client.pay({
      walletId: "w1",
      recipient: "ADDR",
      amount: "1.0",
    });
    expect(spy).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
