import { PaymentMethod, PaymentStatus, type PaymentRequest, type PaymentResult } from "../types.js";
import type { PaymentRouter } from "./router.js";

export interface BatchPaymentResult {
  totalCount: number;
  successCount: number;
  failedCount: number;
  results: PaymentResult[];
  transactionIds: string[];
}

async function withConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = new Array(tasks.length);
  let idx = 0;

  async function worker(): Promise<void> {
    while (idx < tasks.length) {
      const i = idx++;
      try {
        results[i] = { status: "fulfilled", value: await tasks[i]() };
      } catch (e) {
        results[i] = { status: "rejected", reason: e };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export class BatchProcessor {
  private readonly _router: PaymentRouter;

  constructor(router: PaymentRouter) {
    this._router = router;
  }

  async process(requests: PaymentRequest[], concurrency = 5): Promise<BatchPaymentResult> {
    const tasks = requests.map(
      (req) => () =>
        this._router.pay({
          walletId: req.walletId,
          recipient: req.recipient,
          amount: req.amount,
          purpose: req.purpose,
          feeLevel: undefined,
        }),
    );

    const settled = await withConcurrency(tasks, concurrency);

    const results: PaymentResult[] = settled.map((s, i) => {
      if (s.status === "fulfilled") return s.value;
      const req = requests[i];
      return {
        success: false,
        transactionId: null,
        blockchainTx: null,
        amount: req.amount,
        recipient: req.recipient,
        method: PaymentMethod.TRANSFER,
        status: PaymentStatus.FAILED,
        error: String(s.reason),
      };
    });

    const successCount = results.filter((r) => r.success).length;
    const transactionIds = results
      .map((r) => r.transactionId)
      .filter((id): id is string => id != null);

    return {
      totalCount: results.length,
      successCount,
      failedCount: results.length - successCount,
      results,
      transactionIds,
    };
  }
}
