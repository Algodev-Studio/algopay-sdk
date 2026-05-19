// Main client
export { AlgoPay, Config, Network } from "./client.js";
export type { ConfigOptions } from "./config.js";

// Types
export * from "./types.js";

// Errors
export {
  AlgoPayError,
  ConfigurationError,
  WalletError,
  PaymentError,
  GuardError,
  ProtocolError,
  ValidationError,
  InsufficientBalanceError,
  NetworkError,
} from "./errors.js";

// Logging
export { configureLogging, getLogger, LogLevel, type Logger } from "./logging.js";

// Wallet
export { WalletService } from "./wallet/service.js";
export { WalletRepository } from "./wallet/repository.js";

// Payment
export { PaymentRouter } from "./payment/router.js";
export { BatchProcessor } from "./payment/batch.js";

// Guards
export {
  Guard,
  GuardChain,
  type GuardResult,
  type PaymentContext,
} from "./guards/base.js";
export { BudgetGuard } from "./guards/budget.js";
export { SingleTxGuard } from "./guards/single-tx.js";
export { RecipientGuard } from "./guards/recipient.js";
export { RateLimitGuard } from "./guards/rate-limit.js";
export { ConfirmGuard, type ConfirmCallback } from "./guards/confirm.js";
export { JustificationGuard } from "./guards/justification.js";
export { GuardManager, GuardType, type GuardConfig } from "./guards/manager.js";

// Ledger
export {
  Ledger,
  LedgerEntryType,
  LedgerEntryStatus,
  createLedgerEntry,
  type LedgerEntry,
} from "./ledger/ledger.js";

// Intents
export { PaymentIntentService } from "./intents/service.js";

// Storage
export type { StorageBackend } from "./storage/base.js";
export { InMemoryStorage } from "./storage/memory.js";
export { getStorage, registerStorageBackend } from "./storage/index.js";

// Constants
export { USDC_MAINNET_ASA_ID, USDC_TESTNET_ASA_ID } from "./constants.js";
