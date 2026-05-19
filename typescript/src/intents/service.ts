import { ValidationError } from "../errors.js";
import type { StorageBackend } from "../storage/base.js";
import { PaymentIntentStatus, type PaymentIntent } from "../types.js";

const COLLECTION = "payment_intents";

export class PaymentIntentService {
  private readonly _storage: StorageBackend;

  constructor(storage: StorageBackend) {
    this._storage = storage;
  }

  private _makeKey(intentId: string): string {
    return `intent:${intentId}`;
  }

  async create(opts: {
    walletId: string;
    recipient: string;
    amount: string;
    currency?: string;
    metadata?: Record<string, unknown>;
    clientSecret?: string | null;
  }): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      id: crypto.randomUUID(),
      walletId: opts.walletId,
      recipient: opts.recipient,
      amount: opts.amount,
      currency: opts.currency ?? "USDC",
      status: PaymentIntentStatus.REQUIRES_CONFIRMATION,
      createdAt: new Date().toISOString(),
      metadata: opts.metadata ?? {},
      clientSecret: opts.clientSecret ?? null,
    };
    await this._save(intent);
    return intent;
  }

  async get(intentId: string): Promise<PaymentIntent | null> {
    return this._load(intentId);
  }

  async updateStatus(intentId: string, status: PaymentIntentStatus): Promise<PaymentIntent> {
    const intent = await this.get(intentId);
    if (!intent) throw new ValidationError(`Intent not found: ${intentId}`);
    intent.status = status;
    await this._save(intent);
    return intent;
  }

  private async _save(intent: PaymentIntent): Promise<void> {
    const key = this._makeKey(intent.id);
    await this._storage.save(COLLECTION, key, intent as unknown as Record<string, unknown>);
  }

  private async _load(intentId: string): Promise<PaymentIntent | null> {
    const key = this._makeKey(intentId);
    const data = await this._storage.get(COLLECTION, key);
    return data ? (data as unknown as PaymentIntent) : null;
  }
}
