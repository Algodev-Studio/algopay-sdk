import { describe, expect, it } from "vitest";
import { BudgetGuard } from "./budget.js";
import { InMemoryStorage } from "../storage/memory.js";
import type { PaymentContext } from "./base.js";

const ctx = (amount: string): PaymentContext => ({
  walletId: "w1",
  recipient: "RECIPIENT",
  amount,
});

describe("BudgetGuard", () => {
  it("requires at least one limit", () => {
    expect(() => new BudgetGuard({})).toThrow("At least one limit");
  });

  it("blocks when hourly spend would exceed limit", async () => {
    const storage = new InMemoryStorage();
    const guard = new BudgetGuard({ hourlyLimit: "10", name: "h" });
    guard.bindStorage(storage);
    const result = await guard.check(ctx("11"));
    expect(result.allowed).toBe(false);
  });

  it("commits spend then blocks total limit on reserve", async () => {
    const storage = new InMemoryStorage();
    const guard = new BudgetGuard({ totalLimit: "10", name: "tot" });
    guard.bindStorage(storage);
    const token = await guard.reserve(ctx("3"));
    await guard.commit(token);
    await expect(guard.reserve(ctx("8"))).rejects.toThrow(/budget limit/i);
  });

  it("allows spend after release", async () => {
    const storage = new InMemoryStorage();
    const guard = new BudgetGuard({ totalLimit: "10", name: "tot" });
    guard.bindStorage(storage);
    const token = await guard.reserve(ctx("3"));
    await guard.release(token);
    const token2 = await guard.reserve(ctx("3"));
    expect(token2).not.toBeNull();
  });
});
