import type { StorageBackend } from "../storage/base.js";

export interface GuardResult {
  allowed: boolean;
  reason?: string | null;
  guardName?: string;
  metadata?: Record<string, unknown> | null;
}

export interface PaymentContext {
  walletId: string;
  recipient: string;
  amount: string;
  walletSetId?: string | null;
  purpose?: string | null;
  metadata?: Record<string, unknown> | null;
  currentBalance?: string | null;
  totalSpentToday?: string | null;
  totalSpentHour?: string | null;
  paymentCountToday?: number;
}

export abstract class Guard {
  abstract get name(): string;
  abstract check(context: PaymentContext): Promise<GuardResult>;

  bindStorage(_storage: StorageBackend): void {
    /* override in subclasses that need storage */
  }

  async reserve(context: PaymentContext): Promise<string | null> {
    const result = await this.check(context);
    if (!result.allowed) throw new Error(result.reason ?? "Guard check failed");
    return null;
  }

  async commit(_token: string | null): Promise<void> {
    /* override in stateful guards */
  }

  async release(_token: string | null): Promise<void> {
    /* override in stateful guards */
  }

  reset(): void {
    /* override if guard has resettable state */
  }
}

export class GuardChain {
  private readonly _guards: Guard[] = [];

  constructor(guards?: Guard[]) {
    if (guards) this._guards.push(...guards);
  }

  add(guard: Guard): this {
    this._guards.push(guard);
    return this;
  }

  remove(name: string): boolean {
    const idx = this._guards.findIndex((g) => g.name === name);
    if (idx >= 0) {
      this._guards.splice(idx, 1);
      return true;
    }
    return false;
  }

  getByName(name: string): Guard | null {
    return this._guards.find((g) => g.name === name) ?? null;
  }

  get guards(): Guard[] {
    return [...this._guards];
  }

  get length(): number {
    return this._guards.length;
  }

  async check(context: PaymentContext): Promise<GuardResult> {
    const passedGuards: string[] = [];
    for (const guard of this._guards) {
      const result = await guard.check(context);
      if (!result.allowed) {
        result.metadata = result.metadata ?? {};
        (result.metadata as Record<string, unknown>).passed_guards = passedGuards;
        return result;
      }
      passedGuards.push(guard.name);
    }
    return {
      allowed: true,
      reason: "All guards passed",
      guardName: "chain",
      metadata: { passed_guards: passedGuards },
    };
  }

  async checkAll(context: PaymentContext): Promise<GuardResult[]> {
    const results: GuardResult[] = [];
    for (const guard of this._guards) {
      results.push(await guard.check(context));
    }
    return results;
  }

  resetAll(): void {
    for (const guard of this._guards) guard.reset();
  }

  async reserve(context: PaymentContext): Promise<[string, string | null][]> {
    const tokens: [string, string | null][] = [];
    try {
      for (const guard of this._guards) {
        const token = await guard.reserve(context);
        tokens.push([guard.name, token]);
      }
    } catch (e) {
      await this.release(tokens);
      throw e;
    }
    return tokens;
  }

  async commit(tokens: [string, string | null][]): Promise<void> {
    for (const [name, token] of tokens) {
      const guard = this.getByName(name);
      if (guard) await guard.commit(token);
    }
  }

  async release(tokens: [string, string | null][]): Promise<void> {
    for (const [name, token] of tokens) {
      const guard = this.getByName(name);
      if (guard) await guard.release(token);
    }
  }

  [Symbol.iterator](): Iterator<Guard> {
    return this._guards[Symbol.iterator]();
  }
}
