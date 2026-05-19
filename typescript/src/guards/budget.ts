import type { StorageBackend } from "../storage/base.js";
import { Guard, type GuardResult, type PaymentContext } from "./base.js";

function formatDate(d: Date, fmt: string): string {
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, "0");
  const D = String(d.getDate()).padStart(2, "0");
  const H = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  if (fmt === "day") return `${Y}${M}${D}`;
  if (fmt === "hour") return `${Y}${M}${D}${H}`;
  if (fmt === "minute") return `${Y}${M}${D}${H}${m}`;
  return `${Y}${M}${D}`;
}

export class BudgetGuard extends Guard {
  private readonly _name: string;
  private readonly _dailyLimit: string | null;
  private readonly _hourlyLimit: string | null;
  private readonly _totalLimit: string | null;
  private _storage: StorageBackend | null = null;

  constructor(opts: {
    dailyLimit?: string | null;
    hourlyLimit?: string | null;
    totalLimit?: string | null;
    name?: string;
    storage?: StorageBackend;
  }) {
    super();
    if (!opts.dailyLimit && !opts.hourlyLimit && !opts.totalLimit) {
      throw new Error("At least one limit must be specified");
    }
    this._name = opts.name ?? "budget";
    this._dailyLimit = opts.dailyLimit ?? null;
    this._hourlyLimit = opts.hourlyLimit ?? null;
    this._totalLimit = opts.totalLimit ?? null;
    this._storage = opts.storage ?? null;
  }

  override bindStorage(storage: StorageBackend): void {
    this._storage = storage;
  }

  get name(): string {
    return this._name;
  }

  private _getPeriodKeys(walletId: string, ts: Date): Record<string, string> {
    const keys: Record<string, string> = {};
    if (this._totalLimit != null) keys.total = `budget:${walletId}:${this.name}:total`;
    if (this._dailyLimit != null)
      keys.daily = `budget:${walletId}:${this.name}:daily:${formatDate(ts, "day")}`;
    if (this._hourlyLimit != null)
      keys.hourly = `budget:${walletId}:${this.name}:hourly:${formatDate(ts, "hour")}`;
    return keys;
  }

  private async _getSpent(walletId: string, window: "hourly" | "daily" | "total"): Promise<number> {
    if (!this._storage) return 0;
    const now = new Date();
    const keys = this._getPeriodKeys(walletId, now);
    const key = keys[window];
    if (!key) return 0;
    const data = await this._storage.get("guard_state", key);
    if (!data) return 0;
    if (typeof data._value === "string") return Number(data._value);
    if (typeof data.value === "string") return Number(data.value);
    return 0;
  }

  async check(context: PaymentContext): Promise<GuardResult> {
    const amount = Number(context.amount);
    const walletId = context.walletId;

    if (this._hourlyLimit != null) {
      const hourlySpent = await this._getSpent(walletId, "hourly");
      if (hourlySpent + amount > Number(this._hourlyLimit)) {
        return {
          allowed: false,
          reason: `Hourly limit exceeded. Spent: ${hourlySpent}, Limit: ${this._hourlyLimit}, Requested: ${amount}`,
          guardName: this.name,
          metadata: { limit_type: "hourly", current_spent: String(hourlySpent), limit: this._hourlyLimit, requested: String(amount) },
        };
      }
    }

    if (this._dailyLimit != null) {
      const dailySpent = await this._getSpent(walletId, "daily");
      if (dailySpent + amount > Number(this._dailyLimit)) {
        return {
          allowed: false,
          reason: `Daily limit exceeded. Spent today: ${dailySpent}, Limit: ${this._dailyLimit}, Requested: ${amount}`,
          guardName: this.name,
          metadata: { limit_type: "daily", current_spent: String(dailySpent), limit: this._dailyLimit, requested: String(amount) },
        };
      }
    }

    if (this._totalLimit != null) {
      const totalSpent = await this._getSpent(walletId, "total");
      if (totalSpent + amount > Number(this._totalLimit)) {
        return {
          allowed: false,
          reason: `Total limit exceeded. Total spent: ${totalSpent}, Limit: ${this._totalLimit}, Requested: ${amount}`,
          guardName: this.name,
          metadata: { limit_type: "total", current_spent: String(totalSpent), limit: this._totalLimit, requested: String(amount) },
        };
      }
    }

    return { allowed: true, guardName: this.name };
  }

  override async reserve(context: PaymentContext): Promise<string | null> {
    if (!this._storage) return null;
    const amount = context.amount;
    const walletId = context.walletId;
    const now = new Date();
    const periodKeys = this._getPeriodKeys(walletId, now);
    if (Object.keys(periodKeys).length === 0) return null;

    const reservedKeys: string[] = [];
    const limits: Record<string, string | null> = {
      total: this._totalLimit,
      daily: this._dailyLimit,
      hourly: this._hourlyLimit,
    };

    try {
      for (const [limitType, keyBase] of Object.entries(periodKeys)) {
        const keyReserved = `${keyBase}:reserved`;
        const limit = limits[limitType];
        if (limit == null) continue;

        await this._storage.atomicAdd("guard_state", keyReserved, amount);
        reservedKeys.push(keyReserved);

        const mainData = await this._storage.get("guard_state", keyBase);
        const resData = await this._storage.get("guard_state", keyReserved);
        const mainVal = mainData ? Number(mainData._value ?? mainData.value ?? 0) : 0;
        const resVal = resData ? Number(resData._value ?? resData.value ?? 0) : 0;

        if (mainVal + resVal > Number(limit)) {
          throw new Error(`${limitType.charAt(0).toUpperCase() + limitType.slice(1)} budget limit exceeded. Limit: ${limit}`);
        }
      }
    } catch (e) {
      for (const rk of reservedKeys) {
        await this._storage.atomicAdd("guard_state", rk, String(-Number(amount)));
      }
      throw e;
    }

    return JSON.stringify({ v: 2, w: walletId, a: amount, ts: now.toISOString() });
  }

  override async commit(token: string | null): Promise<void> {
    if (!token || !this._storage) return;
    try {
      const data = JSON.parse(token) as { v: number; w: string; a: string; ts: string };
      if (data.v !== 2) return;
      const ts = new Date(data.ts);
      const periodKeys = this._getPeriodKeys(data.w, ts);
      for (const keyBase of Object.values(periodKeys)) {
        const keyReserved = `${keyBase}:reserved`;
        await this._storage.atomicAdd("guard_state", keyBase, data.a);
        await this._storage.atomicAdd("guard_state", keyReserved, String(-Number(data.a)));
      }
    } catch {
      /* best effort */
    }
  }

  override async release(token: string | null): Promise<void> {
    if (!token || !this._storage) return;
    try {
      const data = JSON.parse(token) as { v: number; w: string; a: string; ts: string };
      if (data.v !== 2) return;
      const ts = new Date(data.ts);
      const periodKeys = this._getPeriodKeys(data.w, ts);
      for (const keyBase of Object.values(periodKeys)) {
        const keyReserved = `${keyBase}:reserved`;
        await this._storage.atomicAdd("guard_state", keyReserved, String(-Number(data.a)));
      }
    } catch {
      /* best effort */
    }
  }
}
