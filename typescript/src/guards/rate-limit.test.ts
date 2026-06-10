import { describe, expect, it } from "vitest";
import { RateLimitGuard } from "./rate-limit.js";
import { InMemoryStorage } from "../storage/memory.js";
import type { PaymentContext } from "./base.js";

const ctx: PaymentContext = {
  walletId: "w1",
  recipient: "RECIPIENT",
  amount: "1",
};

describe("RateLimitGuard", () => {
  it("requires at least one rate limit", () => {
    expect(() => new RateLimitGuard({})).toThrow("At least one rate limit");
  });

  it("release allows retry within daily window", async () => {
    const storage = new InMemoryStorage();
    const guard = new RateLimitGuard({ maxPerDay: 1, name: "rld" });
    guard.bindStorage(storage);
    const token = await guard.reserve(ctx);
    await guard.release(token);
    await expect(guard.reserve(ctx)).resolves.toBeTruthy();
  });
});
