import { describe, expect, it } from "vitest";
import { Config } from "./config.js";
import { Network } from "./types.js";
import { USDC_TESTNET_ASA_ID } from "./constants.js";

describe("Config", () => {
  it("defaults to testnet algonode URLs and USDC ASA", () => {
    const c = new Config({ network: Network.ALGORAND_TESTNET });
    expect(c.algodUrl).toContain("testnet");
    expect(c.usdcAsaId).toBe(USDC_TESTNET_ASA_ID);
  });
});
