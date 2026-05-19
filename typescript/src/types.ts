export enum Network {
  ALGORAND_MAINNET = "algorand-mainnet",
  ALGORAND_TESTNET = "algorand-testnet",
}

export enum FeeLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum PaymentMethod {
  X402 = "x402",
  TRANSFER = "transfer",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  BLOCKED = "blocked",
}

export enum PaymentIntentStatus {
  REQUIRES_CONFIRMATION = "requires_confirmation",
  PROCESSING = "processing",
  SUCCEEDED = "succeeded",
  CANCELED = "canceled",
  FAILED = "failed",
}

export enum WalletState {
  LIVE = "LIVE",
  FROZEN = "FROZEN",
}

export enum AccountType {
  EOA = "EOA",
}

export enum TransactionState {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETE = "COMPLETE",
  FAILED = "FAILED",
}

export interface TokenInfo {
  id: string;
  blockchain: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative?: boolean;
  tokenAddress?: string | null;
}

export interface Balance {
  amount: string;
  token: TokenInfo;
}

export interface WalletSetInfo {
  id: string;
  name: string | null;
  createDate?: string | null;
  updateDate?: string | null;
}

export interface WalletInfo {
  id: string;
  address: string;
  walletSetId: string;
  blockchain: string;
  state?: WalletState;
  accountType?: AccountType;
  name?: string | null;
  createDate?: string | null;
  updateDate?: string | null;
}

export interface TransactionInfo {
  id: string;
  state: TransactionState;
  blockchain?: string | null;
  txHash?: string | null;
  walletId?: string | null;
  sourceAddress?: string | null;
  destinationAddress?: string | null;
  errorReason?: string | null;
}

export interface PaymentRequest {
  walletId: string;
  recipient: string;
  amount: string;
  purpose?: string | null;
  idempotencyKey?: string | null;
  destinationChain?: string | null;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntent {
  id: string;
  walletId: string;
  recipient: string;
  amount: string;
  currency: string;
  status: PaymentIntentStatus;
  createdAt: string;
  expiresAt?: string | null;
  metadata?: Record<string, unknown>;
  clientSecret?: string | null;
}

export interface PaymentResult {
  success: boolean;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: string;
  recipient: string;
  blockchainTx: string | null;
  transactionId: string | null;
  error?: string;
  guardsPassed?: string[];
  metadata?: Record<string, unknown>;
  resourceData?: unknown;
}

export interface SimulationResult {
  wouldSucceed: boolean;
  route: PaymentMethod;
  guardsThatWouldPass?: string[];
  guardsThatWouldFail?: string[];
  estimatedFee?: string | null;
  reason?: string | null;
}

export interface BatchPaymentResult {
  totalCount: number;
  successCount: number;
  failedCount: number;
  results: PaymentResult[];
  transactionIds: string[];
}
