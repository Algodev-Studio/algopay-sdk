import algosdk from "algosdk";
import { registerExactAvmScheme } from "@x402-avm/avm/exact/client";
import { toClientAvmSigner } from "@x402-avm/avm";
import { wrapFetchWithPayment } from "@x402-avm/fetch";
import { x402Client } from "@x402-avm/core/client";
import type { Config } from "../config.js";
import type { WalletService } from "../wallet/service.js";
import { PaymentMethod, PaymentStatus, type PaymentResult, type SimulationResult } from "../types.js";

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

function algodToken(): string {
  return process.env.ALGOD_TOKEN ?? process.env.ALGOPAY_ALGOD_TOKEN ?? "";
}

/** Base64-encode algosdk 64-byte secret key for `toClientAvmSigner`. */
function skToBase64(mnemonic: string): string {
  const sk = algosdk.mnemonicToSecretKey(mnemonic).sk;
  return Buffer.from(sk).toString("base64");
}

export class PaymentRouter {
  constructor(
    private readonly _config: Config,
    private readonly _wallets: WalletService,
  ) {}

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
      return this._payX402(params);
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

  canHandle(recipient: string): boolean {
    return this.detectMethod(recipient) !== null;
  }

  async simulate(params: {
    walletId: string;
    recipient: string;
    amount: string;
  }): Promise<SimulationResult> {
    const method = this.detectMethod(params.recipient);
    if (!method) {
      return {
        wouldSucceed: false,
        route: PaymentMethod.TRANSFER,
        reason: `No adapter found for recipient: ${params.recipient}`,
      };
    }

    if (method === PaymentMethod.TRANSFER) {
      try {
        const balance = await this._wallets.getUsdcBalanceAmount(params.walletId);
        const balNum = Number(balance);
        const amtNum = Number(params.amount);
        if (balNum >= amtNum) {
          return {
            wouldSucceed: true,
            route: PaymentMethod.TRANSFER,
            reason: null,
          };
        }
        return {
          wouldSucceed: false,
          route: PaymentMethod.TRANSFER,
          reason: `Insufficient balance: ${balance} < ${params.amount}`,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { wouldSucceed: false, route: PaymentMethod.TRANSFER, reason: msg };
      }
    }

    return { wouldSucceed: true, route: PaymentMethod.X402, reason: null };
  }

  private async _payX402(params: {
    walletId: string;
    recipient: string;
    amount: string;
    purpose?: string | null;
  }): Promise<PaymentResult> {
    const url = params.recipient;
    let mnemonic: string;
    try {
      mnemonic = this._wallets.getMnemonic(params.walletId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        status: PaymentStatus.FAILED,
        method: PaymentMethod.X402,
        amount: params.amount,
        recipient: url,
        blockchainTx: null,
        transactionId: null,
        error: msg,
      };
    }

    try {
      const signer = toClientAvmSigner(skToBase64(mnemonic));
      const client = new x402Client();
      registerExactAvmScheme(client, {
        signer,
        algodConfig: {
          algodUrl: this._config.algodUrl,
          algodToken: algodToken(),
        },
        networks: [this._config.networkCaip2 as `${string}:${string}`],
      });
      const fetchPay = wrapFetchWithPayment(globalThis.fetch, client);
      const response = await fetchPay(url, { method: "GET" });

      const payHdr = response.headers.get("PAYMENT-RESPONSE");
      let txId: string | null = null;
      if (payHdr) {
        try {
          const decoded = JSON.parse(Buffer.from(payHdr, "base64").toString("utf8")) as {
            transaction?: string;
          };
          txId = decoded.transaction ?? null;
        } catch {
          /* ignore */
        }
      }

      if (response.ok) {
        return {
          success: true,
          status: PaymentStatus.COMPLETED,
          method: PaymentMethod.X402,
          amount: params.amount,
          recipient: url,
          blockchainTx: txId,
          transactionId: txId,
        };
      }

      return {
        success: false,
        status: PaymentStatus.FAILED,
        method: PaymentMethod.X402,
        amount: params.amount,
        recipient: url,
        blockchainTx: null,
        transactionId: null,
        error: `HTTP ${response.status} after x402 flow`,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        success: false,
        status: PaymentStatus.FAILED,
        method: PaymentMethod.X402,
        amount: params.amount,
        recipient: url,
        blockchainTx: null,
        transactionId: null,
        error: msg,
      };
    }
  }
}
