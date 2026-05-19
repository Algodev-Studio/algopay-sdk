import { Guard, type GuardResult, type PaymentContext } from "./base.js";

export class JustificationGuard extends Guard {
  private readonly _name: string;
  private readonly _minLength: number;

  constructor(opts?: { minLength?: number; name?: string }) {
    super();
    const minLen = opts?.minLength ?? 1;
    if (minLen < 1) throw new Error("minLength must be >= 1");
    this._name = opts?.name ?? "justification";
    this._minLength = minLen;
  }

  get name(): string {
    return this._name;
  }

  get minLength(): number {
    return this._minLength;
  }

  async check(context: PaymentContext): Promise<GuardResult> {
    const raw = (context.purpose ?? "").trim();
    if (raw.length < this._minLength) {
      return {
        allowed: false,
        reason: `Payment purpose (justification) required: min length ${this._minLength}, got ${raw.length}`,
        guardName: this.name,
        metadata: { purpose_len: raw.length },
      };
    }
    return { allowed: true, guardName: this.name };
  }
}
