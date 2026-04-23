import { randomUUID } from "node:crypto";
import { Config, type ConfigOptions } from "./config.js";
import { Network } from "./types.js";
import { WalletService } from "./wallet/service.js";
import { PaymentRouter } from "./payment/router.js";
import type { PaymentResult, WalletInfo, WalletSetInfo } from "./types.js";

/**
 * AlgoPay entry point (TypeScript) — mirrors Python `AlgoPay` subset:
 * wallet sets, wallets, USDC balance, `pay()` with ASA transfer; x402 returns explicit not-implemented message.
 */
export class AlgoPay {
  private readonly _config: Config;
  private readonly _walletService: WalletService;
  private readonly _router: PaymentRouter;

  constructor(options: ConfigOptions = {}) {
    this._config = Config.fromEnv(options);
    this._walletService = new WalletService(this._config);
    this._router = new PaymentRouter(this._walletService);
  }

  get config(): Config {
    return this._config;
  }

  get wallet(): WalletService {
    return this._walletService;
  }

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

  async pay(
    walletId: string,
    recipient: string,
    amount: string | number,
    options: {
      purpose?: string | null;
      feeLevel?: string;
    } = {},
  ): Promise<PaymentResult> {
    return this._router.pay({
      walletId,
      recipient,
      amount: String(amount),
      feeLevel: options.feeLevel,
      purpose: options.purpose,
    });
  }
}

export { Config, Network };
