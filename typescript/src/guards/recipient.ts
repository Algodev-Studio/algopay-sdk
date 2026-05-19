import { Guard, type GuardResult, type PaymentContext } from "./base.js";

export class RecipientGuard extends Guard {
  private readonly _name: string;
  private readonly _mode: "whitelist" | "blacklist";
  private readonly _addresses: Set<string>;
  private readonly _domains: Set<string>;
  private readonly _patterns: RegExp[];

  constructor(opts: {
    mode?: "whitelist" | "blacklist";
    addresses?: string[];
    patterns?: string[];
    domains?: string[];
    name?: string;
  }) {
    super();
    const mode = opts.mode ?? "whitelist";
    if (mode !== "whitelist" && mode !== "blacklist") {
      throw new Error("mode must be 'whitelist' or 'blacklist'");
    }
    this._name = opts.name ?? "recipient";
    this._mode = mode;
    this._addresses = new Set((opts.addresses ?? []).map((a) => a.toLowerCase()));
    this._domains = new Set((opts.domains ?? []).map((d) => d.toLowerCase()));
    this._patterns = (opts.patterns ?? []).map((p) => new RegExp(p, "i"));
  }

  get name(): string {
    return this._name;
  }

  get mode(): string {
    return this._mode;
  }

  addAddress(address: string): void {
    this._addresses.add(address.toLowerCase());
  }

  removeAddress(address: string): void {
    this._addresses.delete(address.toLowerCase());
  }

  addDomain(domain: string): void {
    this._domains.add(domain.toLowerCase());
  }

  addPattern(pattern: string): void {
    this._patterns.push(new RegExp(pattern, "i"));
  }

  private _matches(recipient: string): boolean {
    const lower = recipient.toLowerCase();
    if (this._addresses.has(lower)) return true;
    for (const domain of this._domains) {
      if (lower.includes(domain)) return true;
    }
    return this._patterns.some((p) => p.test(recipient));
  }

  async check(context: PaymentContext): Promise<GuardResult> {
    const { recipient } = context;
    const matches = this._matches(recipient);

    if (this._mode === "whitelist") {
      return matches
        ? { allowed: true, guardName: this.name, metadata: { mode: "whitelist", matched: true } }
        : {
            allowed: false,
            reason: `Recipient ${recipient} not in whitelist`,
            guardName: this.name,
            metadata: { mode: "whitelist", matched: false },
          };
    }

    return matches
      ? {
          allowed: false,
          reason: `Recipient ${recipient} is blacklisted`,
          guardName: this.name,
          metadata: { mode: "blacklist", matched: true },
        }
      : { allowed: true, guardName: this.name, metadata: { mode: "blacklist", matched: false } };
  }

  clear(): void {
    this._addresses.clear();
    this._domains.clear();
    this._patterns.length = 0;
  }
}
