import { describe, expect, it } from "vitest";
import { Config } from "../config.js";
import { Network } from "../types.js";
import { PaymentMethod } from "../types.js";
import { PaymentRouter } from "./router.js";
import { WalletService } from "../wallet/service.js";

describe("PaymentRouter", () => {
  const config = new Config({ network: Network.ALGORAND_TESTNET });
  const wallets = new WalletService(config);
  const router = new PaymentRouter(config, wallets);

  it("detects Algorand address recipient", () => {
    expect(router.detectMethod("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ")).toBe(
      PaymentMethod.TRANSFER,
    );
  });

  it("detects x402 HTTP URL recipient", () => {
    expect(router.detectMethod("https://api.example.com/resource")).toBe(PaymentMethod.X402);
  });

  it("returns null for invalid recipient", () => {
    expect(router.detectMethod("not-a-valid-recipient")).toBeNull();
  });

  it("fails pay for invalid recipient without hitting chain", async () => {
    const result = await router.pay({
      walletId: "w1",
      recipient: "invalid",
      amount: "1.0",
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("neither an Algorand address nor an HTTP URL");
  });
});
