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

export interface WalletSetInfo {
  id: string;
  name: string | null;
}

export interface WalletInfo {
  id: string;
  address: string;
  walletSetId: string;
  blockchain: string;
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
}
