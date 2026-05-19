import { getLogger } from "../logging.js";
import type { StorageBackend } from "../storage/base.js";
import { Guard, GuardChain, type PaymentContext } from "./base.js";
import { BudgetGuard } from "./budget.js";
import { ConfirmGuard } from "./confirm.js";
import { JustificationGuard } from "./justification.js";
import { RateLimitGuard } from "./rate-limit.js";
import { RecipientGuard } from "./recipient.js";
import { SingleTxGuard } from "./single-tx.js";

export enum GuardType {
  BUDGET = "budget",
  SINGLE_TX = "single_tx",
  RECIPIENT = "recipient",
  RATE_LIMIT = "rate_limit",
  CONFIRM = "confirm",
  JUSTIFICATION = "justification",
}

export interface GuardConfig {
  id: string;
  guardType: GuardType;
  name: string;
  dailyLimit?: string | null;
  hourlyLimit?: string | null;
  totalLimit?: string | null;
  maxAmount?: string | null;
  minAmount?: string | null;
  recipientMode?: string;
  recipientAddresses?: string[];
  maxPerMinute?: number | null;
  maxPerHour?: number | null;
  maxPerDay?: number | null;
  confirmThreshold?: string | null;
  alwaysConfirm?: boolean;
  justificationMinLength?: number | null;
}

function detectGuardType(guard: Guard): GuardType {
  if (guard instanceof BudgetGuard) return GuardType.BUDGET;
  if (guard instanceof SingleTxGuard) return GuardType.SINGLE_TX;
  if (guard instanceof RecipientGuard) return GuardType.RECIPIENT;
  if (guard instanceof RateLimitGuard) return GuardType.RATE_LIMIT;
  if (guard instanceof ConfirmGuard) return GuardType.CONFIRM;
  if (guard instanceof JustificationGuard) return GuardType.JUSTIFICATION;
  return GuardType.BUDGET;
}

function guardToConfig(guard: Guard): GuardConfig {
  const cfg: GuardConfig = {
    id: crypto.randomUUID(),
    guardType: detectGuardType(guard),
    name: guard.name,
  };

  if (guard instanceof BudgetGuard) {
    const g = guard as BudgetGuard & { _dailyLimit?: string; _hourlyLimit?: string; _totalLimit?: string };
    cfg.dailyLimit = (g as unknown as Record<string, unknown>)._dailyLimit as string | undefined ?? null;
    cfg.hourlyLimit = (g as unknown as Record<string, unknown>)._hourlyLimit as string | undefined ?? null;
    cfg.totalLimit = (g as unknown as Record<string, unknown>)._totalLimit as string | undefined ?? null;
  }
  if (guard instanceof SingleTxGuard) {
    cfg.maxAmount = guard.maxAmount;
    cfg.minAmount = guard.minAmount;
  }
  if (guard instanceof RecipientGuard) {
    cfg.recipientMode = guard.mode;
  }
  if (guard instanceof ConfirmGuard) {
    cfg.confirmThreshold = guard.threshold;
  }
  if (guard instanceof JustificationGuard) {
    cfg.justificationMinLength = guard.minLength;
  }

  return cfg;
}

function configToGuard(cfg: GuardConfig, storage: StorageBackend): Guard {
  let guard: Guard;
  switch (cfg.guardType) {
    case GuardType.BUDGET:
      guard = new BudgetGuard({
        name: cfg.name,
        dailyLimit: cfg.dailyLimit,
        hourlyLimit: cfg.hourlyLimit,
        totalLimit: cfg.totalLimit,
      });
      break;
    case GuardType.SINGLE_TX:
      guard = new SingleTxGuard({
        name: cfg.name,
        maxAmount: cfg.maxAmount ?? "0",
        minAmount: cfg.minAmount,
      });
      break;
    case GuardType.RECIPIENT:
      guard = new RecipientGuard({
        name: cfg.name,
        mode: (cfg.recipientMode as "whitelist" | "blacklist") ?? "whitelist",
        addresses: cfg.recipientAddresses,
      });
      break;
    case GuardType.RATE_LIMIT:
      guard = new RateLimitGuard({
        name: cfg.name,
        maxPerMinute: cfg.maxPerMinute,
        maxPerHour: cfg.maxPerHour,
        maxPerDay: cfg.maxPerDay,
      });
      break;
    case GuardType.CONFIRM:
      guard = new ConfirmGuard({
        name: cfg.name,
        threshold: cfg.confirmThreshold,
        alwaysConfirm: cfg.alwaysConfirm,
      });
      break;
    case GuardType.JUSTIFICATION:
      guard = new JustificationGuard({
        minLength: cfg.justificationMinLength ?? 1,
        name: cfg.name,
      });
      break;
    default:
      throw new Error(`Unknown guard type: ${cfg.guardType}`);
  }
  guard.bindStorage(storage);
  return guard;
}

const COLLECTION = "guard_registrations";

export class GuardManager {
  private readonly _storage: StorageBackend;
  private readonly _logger = getLogger("guards");

  constructor(storage: StorageBackend) {
    this._storage = storage;
  }

  private _makeKey(scopeType: string, scopeId: string): string {
    return `${scopeType}:${scopeId}`;
  }

  async addGuard(walletId: string, guard: Guard): Promise<this> {
    const key = this._makeKey("wallet", walletId);
    const data = (await this._storage.get(COLLECTION, key)) ?? { guards: [] };
    const cfg = guardToConfig(guard);
    (data.guards as unknown[]).push(cfg);
    await this._storage.save(COLLECTION, key, data);
    return this;
  }

  async addGuardForSet(walletSetId: string, guard: Guard): Promise<this> {
    const key = this._makeKey("wallet_set", walletSetId);
    const data = (await this._storage.get(COLLECTION, key)) ?? { guards: [] };
    const cfg = guardToConfig(guard);
    (data.guards as unknown[]).push(cfg);
    await this._storage.save(COLLECTION, key, data);
    return this;
  }

  async removeGuard(walletId: string, guardName: string): Promise<boolean> {
    const key = this._makeKey("wallet", walletId);
    const data = await this._storage.get(COLLECTION, key);
    if (!data) return false;
    const guards = data.guards as GuardConfig[];
    const original = guards.length;
    data.guards = guards.filter((g) => g.name !== guardName);
    if ((data.guards as unknown[]).length < original) {
      await this._storage.save(COLLECTION, key, data);
      return true;
    }
    return false;
  }

  async removeGuardFromSet(walletSetId: string, guardName: string): Promise<boolean> {
    const key = this._makeKey("wallet_set", walletSetId);
    const data = await this._storage.get(COLLECTION, key);
    if (!data) return false;
    const guards = data.guards as GuardConfig[];
    const original = guards.length;
    data.guards = guards.filter((g) => g.name !== guardName);
    if ((data.guards as unknown[]).length < original) {
      await this._storage.save(COLLECTION, key, data);
      return true;
    }
    return false;
  }

  async getWalletGuards(walletId: string): Promise<GuardChain> {
    const key = this._makeKey("wallet", walletId);
    const data = await this._storage.get(COLLECTION, key);
    const chain = new GuardChain();
    if (data) {
      for (const gcfg of (data.guards as GuardConfig[]) ?? []) {
        chain.add(configToGuard(gcfg, this._storage));
      }
    }
    return chain;
  }

  async getWalletSetGuards(walletSetId: string): Promise<GuardChain> {
    const key = this._makeKey("wallet_set", walletSetId);
    const data = await this._storage.get(COLLECTION, key);
    const chain = new GuardChain();
    if (data) {
      for (const gcfg of (data.guards as GuardConfig[]) ?? []) {
        chain.add(configToGuard(gcfg, this._storage));
      }
    }
    return chain;
  }

  async listWalletGuardNames(walletId: string): Promise<string[]> {
    const key = this._makeKey("wallet", walletId);
    const data = await this._storage.get(COLLECTION, key);
    if (!data) return [];
    return ((data.guards as GuardConfig[]) ?? []).map((g) => g.name ?? "unnamed");
  }

  async listWalletSetGuardNames(walletSetId: string): Promise<string[]> {
    const key = this._makeKey("wallet_set", walletSetId);
    const data = await this._storage.get(COLLECTION, key);
    if (!data) return [];
    return ((data.guards as GuardConfig[]) ?? []).map((g) => g.name ?? "unnamed");
  }

  async getGuardChain(walletId: string, walletSetId?: string | null): Promise<GuardChain> {
    const combined = new GuardChain();
    if (walletSetId) {
      const setChain = await this.getWalletSetGuards(walletSetId);
      for (const g of setChain) combined.add(g);
    }
    const walletChain = await this.getWalletGuards(walletId);
    for (const g of walletChain) combined.add(g);
    return combined;
  }

  async check(context: PaymentContext): Promise<{ allowed: boolean; reason: string | null; passedGuards: string[] }> {
    const chain = await this.getGuardChain(context.walletId, context.walletSetId);
    if (chain.length === 0) return { allowed: true, reason: null, passedGuards: [] };
    this._logger.debug(`Checking ${chain.length} guards for wallet=${context.walletId}`);
    const result = await chain.check(context);
    const passed = ((result.metadata as Record<string, unknown>)?.passed_guards as string[]) ?? [];
    if (!result.allowed) {
      this._logger.warn(`Payment BLOCKED by guard: ${result.reason} (Wallet: ${context.walletId})`);
    } else {
      this._logger.debug(`Guards passed: ${JSON.stringify(passed)}`);
    }
    return { allowed: result.allowed, reason: result.reason ?? null, passedGuards: passed };
  }

  async clearWalletGuards(walletId: string): Promise<void> {
    await this._storage.delete(COLLECTION, this._makeKey("wallet", walletId));
  }

  async clearWalletSetGuards(walletSetId: string): Promise<void> {
    await this._storage.delete(COLLECTION, this._makeKey("wallet_set", walletSetId));
  }
}
