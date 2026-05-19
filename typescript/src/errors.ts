export class AlgoPayError extends Error {
  readonly details: Record<string, unknown>;

  constructor(message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "AlgoPayError";
    this.details = details;
  }

  override toString(): string {
    if (Object.keys(this.details).length > 0) {
      return `${this.message} | Details: ${JSON.stringify(this.details)}`;
    }
    return this.message;
  }
}

export class ConfigurationError extends AlgoPayError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
    this.name = "ConfigurationError";
  }
}

export class WalletError extends AlgoPayError {
  readonly walletId: string | null;

  constructor(
    message: string,
    walletId: string | null = null,
    details?: Record<string, unknown>,
  ) {
    super(message, details);
    this.name = "WalletError";
    this.walletId = walletId;
  }
}

export class PaymentError extends AlgoPayError {
  readonly recipient: string | null;
  readonly amount: string | null;

  constructor(
    message: string,
    recipient: string | null = null,
    amount: string | null = null,
    details?: Record<string, unknown>,
  ) {
    super(message, details);
    this.name = "PaymentError";
    this.recipient = recipient;
    this.amount = amount;
  }
}

export class GuardError extends PaymentError {
  readonly guardName: string;
  readonly reason: string;

  constructor(
    message: string,
    guardName: string,
    reason: string,
    recipient: string | null = null,
    amount: string | null = null,
    details?: Record<string, unknown>,
  ) {
    super(message, recipient, amount, details);
    this.name = "GuardError";
    this.guardName = guardName;
    this.reason = reason;
  }

  override toString(): string {
    return `[${this.guardName}] ${this.reason}`;
  }
}

export class ProtocolError extends PaymentError {
  readonly protocol: string;

  constructor(
    message: string,
    protocol = "unknown",
    details?: Record<string, unknown>,
  ) {
    super(message, null, null, details);
    this.name = "ProtocolError";
    this.protocol = protocol;
  }

  override toString(): string {
    return `[${this.protocol}] ${this.message}`;
  }
}

export class ValidationError extends AlgoPayError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
    this.name = "ValidationError";
  }
}

export class InsufficientBalanceError extends PaymentError {
  readonly currentBalance: string;
  readonly requiredAmount: string;
  readonly walletId: string | null;
  readonly shortfall: string;

  constructor(
    message: string,
    currentBalance: string,
    requiredAmount: string,
    walletId: string | null = null,
    details?: Record<string, unknown>,
  ) {
    super(message, null, requiredAmount, details);
    this.name = "InsufficientBalanceError";
    this.currentBalance = currentBalance;
    this.requiredAmount = requiredAmount;
    this.walletId = walletId;
    this.shortfall = String(Number(requiredAmount) - Number(currentBalance));
  }

  override toString(): string {
    return (
      `${this.message} | ` +
      `Balance: ${this.currentBalance}, Required: ${this.requiredAmount}, ` +
      `Shortfall: ${this.shortfall}`
    );
  }
}

export class NetworkError extends AlgoPayError {
  readonly statusCode: number | null;
  readonly url: string | null;

  constructor(
    message: string,
    statusCode: number | null = null,
    url: string | null = null,
    details?: Record<string, unknown>,
  ) {
    super(message, details);
    this.name = "NetworkError";
    this.statusCode = statusCode;
    this.url = url;
  }
}
