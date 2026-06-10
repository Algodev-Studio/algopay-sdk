import { describe, expect, it } from "vitest";
import { GuardChain } from "./base.js";
import { BudgetGuard } from "./budget.js";
import { JustificationGuard } from "./justification.js";
import { GuardManager } from "./manager.js";
import { InMemoryStorage } from "../storage/memory.js";
import type { PaymentContext } from "./base.js";

const ctx: PaymentContext = {
  walletId: "w1",
  recipient: "RECIPIENT",
  amount: "5",
  purpose: "",
};

describe("GuardChain", () => {
  it("short-circuits on first failing guard", async () => {
    const chain = new GuardChain([
      new JustificationGuard({ minLength: 10 }),
      new BudgetGuard({ totalLimit: "100" }),
    ]);
    const result = await chain.check(ctx);
    expect(result.allowed).toBe(false);
    expect(result.guardName).toBeDefined();
  });
});

describe("GuardManager", () => {
  it("persists and runs wallet guards", async () => {
    const storage = new InMemoryStorage();
    const manager = new GuardManager(storage);
    await manager.addGuard("w1", new JustificationGuard({ minLength: 3 }));
    const allowed = await manager.check({ ...ctx, purpose: "yes" });
    expect(allowed.allowed).toBe(true);
    const fail = await manager.check({ ...ctx, purpose: "no" });
    expect(fail.allowed).toBe(false);
  });
});
