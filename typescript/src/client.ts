import { randomUUID } from "node:crypto";
import { Config, type ConfigOptions } from "./config.js";
import { PaymentError, ValidationError } from "./errors.js";
import { type PaymentContext } from "./guards/base.js";
import { BudgetGuard } from "./guards/budget.js";
import { ConfirmGuard } from "./guards/confirm.js";
import { JustificationGuard } from "./guards/justification.js";
import { GuardManager } from "./guards/manager.js";
import { RateLimitGuard } from "./guards/rate-limit.js";
import { RecipientGuard } from "./guards/recipient.js";
import { SingleTxGuard } from "./guards/single-tx.js";
import { PaymentIntentService } from "./intents/service.js";
import { createLedgerEntry, Ledger, LedgerEntryStatus } from "./ledger/ledger.js";
import { configureLogging, getLogger } from "./logging.js";
import { BatchProcessor } from "./payment/batch.js";
import { PaymentRouter } from "./payment/router.js";
import { getStorage } from "./storage/index.js";
import { TelemetryReporter } from "./telemetry/reporter.js";
import {
  FeeLevel,
  Network,
  PaymentIntentStatus,
  PaymentMethod,
  PaymentStatus,
  type BatchPaymentResult,
  type PaymentIntent,
  type PaymentRequest,
  type PaymentResult,
  type SimulationResult,
  type TransactionInfo,
  type WalletInfo,
  type WalletSetInfo,
} from "./types.js";
import { WalletService } from "./wallet/service.js";

export class AlgoPay {
  private readonly _config: Config;
  private readonly _walletService: WalletService;
  private readonly _router: PaymentRouter;
  private readonly _guardManager: GuardManager;
  private readonly _ledger: Ledger;
  private readonly _intentService: PaymentIntentService;
  private readonly _batchProcessor: BatchProcessor;
  private readonly _telemetry: TelemetryReporter;
  private readonly _logger;

  constructor(options: ConfigOptions & { logLevel?: string } = {}) {
    const logLevel = options.logLevel ?? process.env.ALGOPAY_LOG_LEVEL ?? "INFO";
    configureLogging(logLevel);
    this._logger = getLogger("client");

    this._config = Config.fromEnv(options);
    this._logger.info(`Initializing AlgoPay (network=${this._config.network})`);

    const storage = getStorage(process.env.ALGOPAY_STORAGE_BACKEND);
    this._ledger = new Ledger(storage);
    this._guardManager = new GuardManager(storage);

    this._walletService = new WalletService(this._config);
    this._router = new PaymentRouter(this._config, this._walletService);
    this._intentService = new PaymentIntentService(storage);
    this._batchProcessor = new BatchProcessor(this._router);
    this._telemetry = new TelemetryReporter();
  }

  get config(): Config {
    return this._config;
  }

  get wallet(): WalletService {
    return this._walletService;
  }

  get guards(): GuardManager {
    return this._guardManager;
  }

  get ledger(): Ledger {
    return this._ledger;
  }

  get intents(): PaymentIntentService {
    return this._intentService;
  }

  get telemetry(): TelemetryReporter {
    return this._telemetry;
  }

  // ---- Wallet methods ----

  async createWalletSet(name?: string | null): Promise<WalletSetInfo> {
    return this._walletService.createWalletSet(name);
  }

  async listWalletSets(): Promise<WalletSetInfo[]> {
    return this._walletService.listWalletSets();
  }

  async createWallet(walletSetId?: string, name?: string | null): Promise<WalletInfo> {
    let setId = walletSetId;
    if (!setId) {
      const setName = name ?? `set-${randomUUID().slice(0, 8)}`;
      const ws = await this.createWalletSet(setName);
      setId = ws.id;
    }
    return this._walletService.createWallet(setId);
  }

  async listWallets(walletSetId?: string): Promise<WalletInfo[]> {
    return this._walletService.listWallets(walletSetId);
  }

  async getWallet(walletId: string): Promise<WalletInfo> {
    return this._walletService.getWallet(walletId);
  }

  async getBalance(walletId: string): Promise<string> {
    return this._walletService.getUsdcBalanceAmount(walletId);
  }

  async listTransactions(walletId?: string | null): Promise<TransactionInfo[]> {
    return this._walletService.listTransactions(walletId);
  }

  // ---- Payment ----

  async pay(
    walletId: string,
    recipient: string,
    amount: string | number,
    options: {
      destinationChain?: string | null;
      walletSetId?: string | null;
      purpose?: string | null;
      idempotencyKey?: string | null;
      feeLevel?: string;
      skipGuards?: boolean;
      metadata?: Record<string, unknown>;
      waitForCompletion?: boolean;
      timeoutSeconds?: number;
    } = {},
  ): Promise<PaymentResult> {
    if (!walletId) throw new ValidationError("walletId is required");
    const amountStr = String(amount);
    if (Number(amountStr) <= 0) throw new ValidationError(`Payment amount must be positive. Got: ${amountStr}`);

    const idempotencyKey = options.idempotencyKey ?? randomUUID();
    const meta = { ...(options.metadata ?? {}), idempotency_key: idempotencyKey };

    const context: PaymentContext = {
      walletId,
      walletSetId: options.walletSetId,
      recipient,
      amount: amountStr,
      purpose: options.purpose,
      metadata: meta,
    };

    const ledgerEntry = createLedgerEntry({
      walletId,
      recipient,
      amount: amountStr,
      purpose: options.purpose,
      metadata: options.metadata ?? {},
    });
    await this._ledger.record(ledgerEntry);

    const _telemBase = {
      walletId,
      recipient,
      amount: amountStr,
      purpose: options.purpose ?? null,
      idempotencyKey: idempotencyKey,
    };
    this._telemetry.emit("payment.initiated", _telemBase);

    let guardsChain: Awaited<ReturnType<GuardManager["getGuardChain"]>> | null = null;
    let reservationTokens: [string, string | null][] = [];
    const guardsPassed: string[] = [];

    if (!options.skipGuards) {
      guardsChain = await this._guardManager.getGuardChain(walletId, options.walletSetId);
      try {
        reservationTokens = await guardsChain.reserve(context);
        for (const g of guardsChain) guardsPassed.push(g.name);
        this._telemetry.emit("payment.guard_passed", { ..._telemBase, guardsPassed });
      } catch (e) {
        await this._ledger.updateStatus(ledgerEntry.id, LedgerEntryStatus.BLOCKED);
        const reason = e instanceof Error ? e.message : String(e);
        this._telemetry.emit("payment.guard_blocked", {
          ..._telemBase,
          guardsPassed,
          guardBlockReason: reason,
        });
        return {
          success: false,
          transactionId: null,
          blockchainTx: null,
          amount: amountStr,
          recipient,
          method: PaymentMethod.TRANSFER,
          status: PaymentStatus.BLOCKED,
          error: `Blocked by guard: ${reason}`,
          guardsPassed,
          metadata: { guard_reason: reason },
        };
      }
    }

    try {
      const result = await this._router.pay({
        walletId,
        recipient,
        amount: amountStr,
        purpose: options.purpose,
        feeLevel: options.feeLevel ?? FeeLevel.MEDIUM,
      });

      result.guardsPassed = guardsPassed;

      if (result.success) {
        await this._ledger.updateStatus(
          ledgerEntry.id,
          result.status === PaymentStatus.COMPLETED ? LedgerEntryStatus.COMPLETED : LedgerEntryStatus.PENDING,
          result.blockchainTx,
          { transaction_id: result.transactionId },
        );
        if (guardsChain) await guardsChain.commit(reservationTokens);
        this._telemetry.emit("payment.completed", {
          ..._telemBase,
          guardsPassed,
          txHash: result.blockchainTx,
        });
      } else {
        await this._ledger.updateStatus(ledgerEntry.id, LedgerEntryStatus.FAILED);
        if (guardsChain) await guardsChain.release(reservationTokens);
        this._telemetry.emit("payment.failed", {
          ..._telemBase,
          guardsPassed,
          guardBlockReason: result.error,
        });
      }

      return result;
    } catch (e) {
      if (guardsChain) await guardsChain.release(reservationTokens);
      await this._ledger.updateStatus(ledgerEntry.id, LedgerEntryStatus.FAILED);
      throw e;
    }
  }

  // ---- Simulation ----

  async simulate(
    walletId: string,
    recipient: string,
    amount: string | number,
    walletSetId?: string | null,
  ): Promise<SimulationResult> {
    if (!walletId) {
      return { wouldSucceed: false, route: PaymentMethod.TRANSFER, reason: "walletId is required" };
    }

    const amountStr = String(amount);
    const context: PaymentContext = {
      walletId,
      walletSetId,
      recipient,
      amount: amountStr,
      purpose: "Simulation",
    };

    const { allowed, reason } = await this._guardManager.check(context);
    if (!allowed) {
      return {
        wouldSucceed: false,
        route: PaymentMethod.TRANSFER,
        reason: `Would be blocked by guard: ${reason}`,
      };
    }

    return this._router.simulate({ walletId, recipient, amount: amountStr });
  }

  canPay(recipient: string): boolean {
    return this._router.canHandle(recipient);
  }

  detectMethod(recipient: string): PaymentMethod | null {
    return this._router.detectMethod(recipient);
  }

  // ---- Payment Intents ----

  async createPaymentIntent(
    walletId: string,
    recipient: string,
    amount: string | number,
    options?: {
      purpose?: string | null;
      idempotencyKey?: string | null;
    },
  ): Promise<PaymentIntent> {
    const amountStr = String(amount);
    const simResult = await this.simulate(walletId, recipient, amountStr);
    if (!simResult.wouldSucceed) {
      throw new PaymentError(`Authorization failed: ${simResult.reason}`);
    }

    const metadata: Record<string, unknown> = {
      purpose: options?.purpose,
      idempotency_key: options?.idempotencyKey,
      simulated_route: simResult.route,
    };

    return this._intentService.create({
      walletId,
      recipient,
      amount: amountStr,
      metadata,
    });
  }

  async confirmPaymentIntent(intentId: string): Promise<PaymentResult> {
    const intent = await this._intentService.get(intentId);
    if (!intent) throw new ValidationError(`Intent not found: ${intentId}`);
    if (intent.status !== PaymentIntentStatus.REQUIRES_CONFIRMATION) {
      throw new ValidationError(`Intent cannot be confirmed. Status: ${intent.status}`);
    }

    try {
      await this._intentService.updateStatus(intent.id, PaymentIntentStatus.PROCESSING);

      const execMeta = { ...(intent.metadata ?? {}) } as Record<string, unknown>;
      const purpose = execMeta.purpose as string | undefined;
      const idempotencyKey = execMeta.idempotency_key as string | undefined;
      delete execMeta.purpose;
      delete execMeta.idempotency_key;
      delete execMeta.simulated_route;

      const result = await this.pay(intent.walletId, intent.recipient, intent.amount, {
        purpose,
        idempotencyKey,
      });

      await this._intentService.updateStatus(
        intent.id,
        result.success ? PaymentIntentStatus.SUCCEEDED : PaymentIntentStatus.FAILED,
      );

      return result;
    } catch (e) {
      await this._intentService.updateStatus(intent.id, PaymentIntentStatus.FAILED);
      throw e;
    }
  }

  async getPaymentIntent(intentId: string): Promise<PaymentIntent | null> {
    return this._intentService.get(intentId);
  }

  async cancelPaymentIntent(intentId: string): Promise<PaymentIntent> {
    const intent = await this._intentService.get(intentId);
    if (!intent) throw new ValidationError(`Intent not found: ${intentId}`);
    if (intent.status !== PaymentIntentStatus.REQUIRES_CONFIRMATION) {
      throw new ValidationError(`Cannot cancel intent in status: ${intent.status}`);
    }
    return this._intentService.updateStatus(intent.id, PaymentIntentStatus.CANCELED);
  }

  // ---- Batch ----

  async batchPay(requests: PaymentRequest[], concurrency = 5): Promise<BatchPaymentResult> {
    return this._batchProcessor.process(requests, concurrency);
  }

  // ---- Ledger sync ----

  async syncTransaction(entryId: string): Promise<ReturnType<Ledger["get"]>> {
    const entry = await this._ledger.get(entryId);
    if (!entry) throw new ValidationError(`Ledger entry not found: ${entryId}`);

    const txId = entry.txHash ?? (entry.metadata?.transaction_id as string | undefined);
    if (!txId) throw new ValidationError("Ledger entry has no transaction id / txHash to sync");

    const tx = await this._walletService.chain.transactionById(txId);
    if (!tx) {
      throw new PaymentError(
        `Transaction not found on indexer: ${txId}`,
        entry.recipient,
        entry.amount,
      );
    }

    await this._ledger.updateStatus(entry.id, LedgerEntryStatus.COMPLETED, txId, {
      last_synced: new Date().toISOString(),
      indexer_confirmed: true,
    });

    return this._ledger.get(entry.id);
  }

  // ---- Guard convenience methods ----

  async addBudgetGuard(
    walletId: string,
    opts: { dailyLimit?: string | null; hourlyLimit?: string | null; totalLimit?: string | null; name?: string },
  ): Promise<void> {
    const guard = new BudgetGuard({
      dailyLimit: opts.dailyLimit,
      hourlyLimit: opts.hourlyLimit,
      totalLimit: opts.totalLimit,
      name: opts.name ?? "budget",
    });
    await this._guardManager.addGuard(walletId, guard);
  }

  async addBudgetGuardForSet(
    walletSetId: string,
    opts: { dailyLimit?: string | null; hourlyLimit?: string | null; totalLimit?: string | null; name?: string },
  ): Promise<void> {
    const guard = new BudgetGuard({
      dailyLimit: opts.dailyLimit,
      hourlyLimit: opts.hourlyLimit,
      totalLimit: opts.totalLimit,
      name: opts.name ?? "budget",
    });
    await this._guardManager.addGuardForSet(walletSetId, guard);
  }

  async addSingleTxGuard(
    walletId: string,
    opts: { maxAmount: string; minAmount?: string | null; name?: string },
  ): Promise<void> {
    const guard = new SingleTxGuard({
      maxAmount: opts.maxAmount,
      minAmount: opts.minAmount,
      name: opts.name ?? "single_tx",
    });
    await this._guardManager.addGuard(walletId, guard);
  }

  async addRecipientGuard(
    walletId: string,
    opts?: {
      mode?: "whitelist" | "blacklist";
      addresses?: string[];
      patterns?: string[];
      domains?: string[];
      name?: string;
    },
  ): Promise<void> {
    const guard = new RecipientGuard({
      mode: opts?.mode ?? "whitelist",
      addresses: opts?.addresses,
      patterns: opts?.patterns,
      domains: opts?.domains,
      name: opts?.name ?? "recipient",
    });
    await this._guardManager.addGuard(walletId, guard);
  }

  async addRecipientGuardForSet(
    walletSetId: string,
    opts?: {
      mode?: "whitelist" | "blacklist";
      addresses?: string[];
      patterns?: string[];
      domains?: string[];
      name?: string;
    },
  ): Promise<void> {
    const guard = new RecipientGuard({
      mode: opts?.mode ?? "whitelist",
      addresses: opts?.addresses,
      patterns: opts?.patterns,
      domains: opts?.domains,
      name: opts?.name ?? "recipient",
    });
    await this._guardManager.addGuardForSet(walletSetId, guard);
  }

  async addRateLimitGuard(
    walletId: string,
    opts: { maxPerMinute?: number | null; maxPerHour?: number | null; maxPerDay?: number | null; name?: string },
  ): Promise<void> {
    const guard = new RateLimitGuard({
      maxPerMinute: opts.maxPerMinute,
      maxPerHour: opts.maxPerHour,
      maxPerDay: opts.maxPerDay,
      name: opts.name ?? "rate_limit",
    });
    await this._guardManager.addGuard(walletId, guard);
  }

  async addRateLimitGuardForSet(
    walletSetId: string,
    opts: { maxPerMinute?: number | null; maxPerHour?: number | null; maxPerDay?: number | null; name?: string },
  ): Promise<void> {
    const guard = new RateLimitGuard({
      maxPerMinute: opts.maxPerMinute,
      maxPerHour: opts.maxPerHour,
      maxPerDay: opts.maxPerDay,
      name: opts.name ?? "rate_limit",
    });
    await this._guardManager.addGuardForSet(walletSetId, guard);
  }

  async addConfirmGuard(
    walletId: string,
    opts?: { threshold?: string | null; alwaysConfirm?: boolean; name?: string },
  ): Promise<void> {
    const guard = new ConfirmGuard({
      threshold: opts?.threshold,
      alwaysConfirm: opts?.alwaysConfirm,
      name: opts?.name ?? "confirm",
    });
    await this._guardManager.addGuard(walletId, guard);
  }

  async addConfirmGuardForSet(
    walletSetId: string,
    opts?: { threshold?: string | null; alwaysConfirm?: boolean; name?: string },
  ): Promise<void> {
    const guard = new ConfirmGuard({
      threshold: opts?.threshold,
      alwaysConfirm: opts?.alwaysConfirm,
      name: opts?.name ?? "confirm",
    });
    await this._guardManager.addGuardForSet(walletSetId, guard);
  }

  async addJustificationGuard(
    walletId: string,
    opts?: { minLength?: number; name?: string },
  ): Promise<void> {
    const guard = new JustificationGuard({
      minLength: opts?.minLength ?? 1,
      name: opts?.name ?? "justification",
    });
    await this._guardManager.addGuard(walletId, guard);
  }

  async addJustificationGuardForSet(
    walletSetId: string,
    opts?: { minLength?: number; name?: string },
  ): Promise<void> {
    const guard = new JustificationGuard({
      minLength: opts?.minLength ?? 1,
      name: opts?.name ?? "justification",
    });
    await this._guardManager.addGuardForSet(walletSetId, guard);
  }

  async listGuards(walletId: string): Promise<string[]> {
    return this._guardManager.listWalletGuardNames(walletId);
  }

  async listGuardsForSet(walletSetId: string): Promise<string[]> {
    return this._guardManager.listWalletSetGuardNames(walletSetId);
  }
}

export { Config, Network };
