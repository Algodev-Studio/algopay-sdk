import { Guard, type GuardResult, type PaymentContext } from "./base.js";

export class SingleTxGuard extends Guard {
  private readonly _name: string;
  private readonly _maxAmount: string;
  private readonly _minAmount: string;

  constructor(opts: { maxAmount: string; minAmount?: string | null; name?: string }) {
    super();
    this._name = opts.name ?? "single_tx";
    this._maxAmount = opts.maxAmount;
    this._minAmount = opts.minAmount ?? "0";
  }

  get name(): string {
    return this._name;
  }

  get maxAmount(): string {
    return this._maxAmount;
  }

  get minAmount(): string {
    return this._minAmount;
  }

  async check(context: PaymentContext): Promise<GuardResult> {
    const amount = Number(context.amount);
    const max = Number(this._maxAmount);
    const min = Number(this._minAmount);

    if (amount > max) {
      return {
        allowed: false,
        reason: `Transaction amount ${amount} exceeds maximum ${max}`,
        guardName: this.name,
        metadata: { requested: String(amount), max_allowed: this._maxAmount },
      };
    }

    if (amount < min) {
      return {
        allowed: false,
        reason: `Transaction amount ${amount} below minimum ${min}`,
        guardName: this.name,
        metadata: { requested: String(amount), min_required: this._minAmount },
      };
    }

    return { allowed: true, guardName: this.name };
  }
}
