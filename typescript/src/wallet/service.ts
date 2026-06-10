import algosdk from "algosdk";
import type { Config } from "../config.js";
import { TransactionState, type Network, type TransactionInfo, type WalletInfo, type WalletSetInfo } from "../types.js";
import { AlgorandClient } from "../algorand-client.js";
import { WalletRepository, type WalletRecord } from "./repository.js";

function feeMultiplier(level: string): number {
  switch (level) {
    case "LOW":
      return 1;
    case "HIGH":
      return 4;
    default:
      return 2;
  }
}

export class WalletService {
  private readonly _config: Config;
  private readonly _chain: AlgorandClient;
  private readonly _repo: WalletRepository;

  constructor(config: Config, chain?: AlgorandClient, repository?: WalletRepository) {
    this._config = config;
    this._chain = chain ?? new AlgorandClient(config);
    this._repo = repository ?? new WalletRepository();
  }

  get repository(): WalletRepository {
    return this._repo;
  }

  get chain(): AlgorandClient {
    return this._chain;
  }

  createWalletSet(name?: string | null): WalletSetInfo {
    const rec = this._repo.createWalletSet(name ?? "AlgoPay Wallet Set");
    return { id: rec.id, name: rec.name };
  }

  listWalletSets(): WalletSetInfo[] {
    return this._repo.listWalletSets().map((s) => ({ id: s.id, name: s.name }));
  }

  createWallet(walletSetId: string, _network?: Network): WalletInfo {
    const acc = algosdk.generateAccount();
    const mnemonic = algosdk.secretKeyToMnemonic(acc.sk);
    const addr = acc.addr.toString();
    const rec = this._repo.createWallet(walletSetId, addr, mnemonic, this._config.network);
    return this._toInfo(rec);
  }

  getWallet(walletId: string): WalletInfo {
    const rec = this._repo.getWallet(walletId);
    if (!rec) throw new Error(`Wallet not found: ${walletId}`);
    return this._toInfo(rec);
  }

  listWallets(walletSetId?: string): WalletInfo[] {
    return this._repo.listWallets(walletSetId).map((r) => this._toInfo(r));
  }

  /** USDC balance in human units (decimal string). */
  async getUsdcBalanceAmount(walletId: string): Promise<string> {
    const rec = this._repo.getWallet(walletId);
    if (!rec) throw new Error(`Wallet not found: ${walletId}`);
    const res = await this._chain.indexer.lookupAccountAssets(rec.address).do();
    const assets = res.assets ?? [];
    const row = assets.find((a) => Number(a.assetId) === this._config.usdcAsaId);
    const amount = row ? row.amount : 0n;
    return (Number(amount) / 1e6).toFixed(6);
  }

  /** Recent USDC asset transfers for a wallet from the indexer (best-effort). */
  async listTransactions(walletId?: string | null): Promise<TransactionInfo[]> {
    if (!walletId) return [];
    const w = this.getWallet(walletId);
    try {
      const resp = await this._chain.indexer
        .searchForTransactions()
        .address(w.address)
        .assetID(this._config.usdcAsaId)
        .limit(20)
        .do();
      const txs = resp.transactions ?? [];
      return txs.map((t) => ({
        id: String(t.id ?? ""),
        state: TransactionState.COMPLETE,
        txHash: t.id ? String(t.id) : null,
        walletId,
        sourceAddress: w.address,
        destinationAddress: null,
      }));
    } catch {
      return [];
    }
  }

  getMnemonic(walletId: string): string {
    const rec = this._repo.getWallet(walletId);
    if (!rec) throw new Error(`Wallet not found: ${walletId}`);
    return rec.secretMnemonic;
  }

  /**
   * Opt in to the configured USDC ASA. Must be called once per wallet before
   * receiving USDC. Submits a 0-amount self-transfer of the USDC asset.
   * Returns the transaction ID of the opt-in transaction.
   */
  async optInUsdc(walletId: string): Promise<{ txId: string }> {
    const rec = this._repo.getWallet(walletId);
    if (!rec) throw new Error(`Wallet not found: ${walletId}`);
    const suggested = await this._chain.algod.getTransactionParams().do();

    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: rec.address,
      receiver: rec.address,
      amount: 0n,
      assetIndex: this._config.usdcAsaId,
      suggestedParams: suggested,
    });

    const sk = algosdk.mnemonicToSecretKey(rec.secretMnemonic).sk;
    const signed = txn.signTxn(sk);
    const submitted = await this._chain.algod.sendRawTransaction(signed).do();
    return { txId: submitted.txid };
  }

  async submitAssetTransfer(params: {
    walletId: string;
    to: string;
    amountMicroUsdc: bigint;
    feeLevel?: string;
  }): Promise<{ txId: string }> {
    const rec = this._repo.getWallet(params.walletId);
    if (!rec) throw new Error(`Wallet not found: ${params.walletId}`);
    const suggested = await this._chain.algod.getTransactionParams().do();
    const mult = feeMultiplier(params.feeLevel ?? "MEDIUM");
    const fee = BigInt(Number(suggested.minFee) * mult);

    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: rec.address,
      receiver: params.to,
      amount: params.amountMicroUsdc,
      assetIndex: this._config.usdcAsaId,
      suggestedParams: { ...suggested, fee },
    });

    const sk = algosdk.mnemonicToSecretKey(rec.secretMnemonic).sk;
    const signed = txn.signTxn(sk);
    const submitted = await this._chain.algod.sendRawTransaction(signed).do();
    return { txId: submitted.txid };
  }

  private _toInfo(rec: WalletRecord): WalletInfo {
    return {
      id: rec.id,
      address: rec.address,
      walletSetId: rec.walletSetId,
      blockchain: `algorand:${rec.network}`,
    };
  }
}
