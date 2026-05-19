import algosdk from "algosdk";
import type { Config } from "./config.js";

/** Thin algod + indexer wrapper (mirrors Python `AlgorandClient`). */
export class AlgorandClient {
  readonly algod: algosdk.Algodv2;
  readonly indexer: algosdk.Indexer;

  constructor(config: Config) {
    const token = process.env.ALGOD_TOKEN ?? process.env.ALGOPAY_ALGOD_TOKEN ?? "";
    this.algod = new algosdk.Algodv2(token, config.algodUrl, "");
    this.indexer = new algosdk.Indexer(token, config.indexerUrl, "");
  }

  /** Lookup confirmed transaction via indexer (mirrors Python `transaction_by_id`). */
  async transactionById(txid: string): Promise<Record<string, unknown> | null> {
    try {
      const resp = (await this.indexer.lookupTransactionByID(txid).do()) as unknown as Record<string, unknown>;
      if (resp.transaction && typeof resp.transaction === "object") {
        return resp.transaction as Record<string, unknown>;
      }
      const txs = (resp.transactions as Record<string, unknown>[] | undefined) ?? [];
      return txs[0] ?? null;
    } catch {
      return null;
    }
  }
}
