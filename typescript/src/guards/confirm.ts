import { Guard, type GuardResult, type PaymentContext } from "./base.js";

export type ConfirmCallback = (context: PaymentContext) => Promise<boolean>;

export class ConfirmGuard extends Guard {
  private readonly _name: string;
  private readonly _callback: ConfirmCallback | null;
  private readonly _threshold: string | null;
  private readonly _alwaysConfirm: boolean;

  constructor(opts?: {
    confirmCallback?: ConfirmCallback | null;
    threshold?: string | null;
    alwaysConfirm?: boolean;
    name?: string;
  }) {
    super();
    this._name = opts?.name ?? "confirm";
    this._callback = opts?.confirmCallback ?? null;
    this._threshold = opts?.threshold ?? null;
    this._alwaysConfirm = opts?.alwaysConfirm ?? false;
  }

  get name(): string {
    return this._name;
  }

  get threshold(): string | null {
    return this._threshold;
  }

  private _needsConfirmation(amount: number): boolean {
    if (this._alwaysConfirm) return true;
    return this._threshold != null && amount >= Number(this._threshold);
  }

  async check(context: PaymentContext): Promise<GuardResult> {
    const amount = Number(context.amount);
    if (!this._needsConfirmation(amount)) {
      return {
        allowed: true,
        guardName: this.name,
        metadata: { confirmation_required: false },
      };
    }

    if (this._callback) {
      try {
        const confirmed = await this._callback(context);
        if (confirmed) {
          return {
            allowed: true,
            guardName: this.name,
            metadata: { confirmation_required: true, confirmed: true },
          };
        }
        return {
          allowed: false,
          reason: "Payment not confirmed by user",
          guardName: this.name,
          metadata: { confirmation_required: true, confirmed: false },
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
          allowed: false,
          reason: `Confirmation callback failed: ${msg}`,
          guardName: this.name,
          metadata: { confirmation_required: true, error: msg },
        };
      }
    }

    return {
      allowed: false,
      reason: `Payment of ${context.amount} requires confirmation. Set a confirmCallback or handle confirmation externally.`,
      guardName: this.name,
      metadata: {
        confirmation_required: true,
        amount: context.amount,
        threshold: this._threshold,
      },
    };
  }
}
