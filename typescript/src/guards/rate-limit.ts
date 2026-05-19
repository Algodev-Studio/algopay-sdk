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

export class RateLimitGuard extends Guard {
  private readonly _name: string;
  private readonly _maxPerMinute: number | null;
  private readonly _maxPerHour: number | null;
  private readonly _maxPerDay: number | null;
  private _storage: StorageBackend | null = null;

  constructor(opts: {
    maxPerMinute?: number | null;
    maxPerHour?: number | null;
    maxPerDay?: number | null;
    name?: string;
  }) {
    super();
    if (opts.maxPerMinute == null && opts.maxPerHour == null && opts.maxPerDay == null) {
      throw new Error("At least one rate limit must be specified");
    }
    this._name = opts.name ?? "rate_limit";
    this._maxPerMinute = opts.maxPerMinute ?? null;
    this._maxPerHour = opts.maxPerHour ?? null;
    this._maxPerDay = opts.maxPerDay ?? null;
  }

  override bindStorage(storage: StorageBackend): void {
    this._storage = storage;
  }

  get name(): string {
    return this._name;
  }

  private _getWindowKeys(walletId: string, ts: Date): Record<string, string> {
    const keys: Record<string, string> = {};
    if (this._maxPerMinute != null)
      keys.minute = `ratelimit:${walletId}:${this.name}:minute:${formatDate(ts, "minute")}`;
    if (this._maxPerHour != null)
      keys.hour = `ratelimit:${walletId}:${this.name}:hour:${formatDate(ts, "hour")}`;
    if (this._maxPerDay != null)
      keys.day = `ratelimit:${walletId}:${this.name}:day:${formatDate(ts, "day")}`;
    return keys;
  }

  async check(_context: PaymentContext): Promise<GuardResult> {
    return { allowed: true };
  }

  override async reserve(context: PaymentContext): Promise<string | null> {
    if (!this._storage) return null;
    const walletId = context.walletId;
    const now = new Date();
    const windowKeys = this._getWindowKeys(walletId, now);
    if (Object.keys(windowKeys).length === 0) return null;

    const limits: Record<string, number | null> = {
      minute: this._maxPerMinute,
      hour: this._maxPerHour,
      day: this._maxPerDay,
    };

    const reservedKeys: string[] = [];
    try {
      for (const [limitType, key] of Object.entries(windowKeys)) {
        const limit = limits[limitType];
        if (limit == null) continue;
        const newValStr = await this._storage.atomicAdd("guard_state", key, "1");
        reservedKeys.push(key);
        const newVal = Math.round(Number(newValStr));
        if (newVal > limit) {
          throw new Error(`Rate limit exceeded (${limitType}). Limit: ${limit}`);
        }
      }
    } catch (e) {
      for (const k of reservedKeys) {
        await this._storage.atomicAdd("guard_state", k, "-1");
      }
      throw e;
    }

    return JSON.stringify({ v: 2, w: walletId, ts: now.toISOString() });
  }

  override async commit(_token: string | null): Promise<void> {
    /* rate limit cost is paid on reserve */
  }

  override async release(token: string | null): Promise<void> {
    if (!token || !this._storage) return;
    try {
      const data = JSON.parse(token) as { v: number; w: string; ts: string };
      if (data.v !== 2) return;
      const ts = new Date(data.ts);
      const windowKeys = this._getWindowKeys(data.w, ts);
      for (const key of Object.values(windowKeys)) {
        await this._storage.atomicAdd("guard_state", key, "-1");
      }
    } catch {
      /* best effort */
    }
  }
}
