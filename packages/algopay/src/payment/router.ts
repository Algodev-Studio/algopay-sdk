import type { WalletService } from "../wallet/service.js";
import { PaymentMethod, PaymentStatus, type PaymentResult } from "../types.js";

function isLikelyAlgorandAddress(recipient: string): boolean {
  const s = recipient.trim();
  if (s.length !== 58) return false;
  return /^[A-Z2-7]+$/.test(s);
}

function isX402Url(recipient: string): boolean {
  try {
    const u = new URL(recipient);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export class PaymentRouter {
  constructor(private readonly _wallets: WalletService) {}

  detectMethod(recipient: string): PaymentMethod | null {
    if (isLikelyAlgorandAddress(recipient)) return PaymentMethod.TRANSFER;
    if (isX402Url(recipient)) return PaymentMethod.X402;
    return null;
  }

  async pay(params: {
    walletId: string;
    recipient: string;
    amount: string;
    feeLevel?: string;
    purpose?: string | null;
  }): Promise<PaymentResult> {
    const method = this.detectMethod(params.recipient);
    if (!method) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        method: PaymentMethod.TRANSFER,
        amount: params.amount,
        recipient: params.recipient,
        blockchainTx: null,
        transactionId: null,
        error: "Recipient is neither an Algorand address nor an HTTP URL (x402)",
      };
    }

    if (method === PaymentMethod.X402) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        method: PaymentMethod.X402,
        amount: params.amount,
        recipient: params.recipient,
        blockchainTx: null,
        transactionId: null,
        error:
          "x402 client not bundled in this release — use Python algopay-sdk with x402-avm or add @x402-avm fetch client",
      };
    }

    const dec = params.amount.includes(".") ? params.amount : `${params.amount}.0`;
    const micro = BigInt(Math.round(Number(dec) * 1_000_000));
    if (micro <= 0n) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        method: PaymentMethod.TRANSFER,
        amount: params.amount,
        recipient: params.recipient,
        blockchainTx: null,
        transactionId: null,
        error: "Amount must be positive",
      };
    }

    try {
      const { txId } = await this._wallets.submitAssetTransfer({
        walletId: params.walletId,
        to: params.recipient,
        amountMicroUsdc: micro,
        feeLevel: params.feeLevel,
      });
      return {
        success: true,
        status: PaymentStatus.COMPLETED,
        method: PaymentMethod.TRANSFER,
        amount: params.amount,
        recipient: params.recipient,
        blockchainTx: txId,
        transactionId: txId,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        status: PaymentStatus.FAILED,
        method: PaymentMethod.TRANSFER,
        amount: params.amount,
        recipient: params.recipient,
        blockchainTx: null,
        transactionId: null,
        error: msg,
      };
    }
  }
}
