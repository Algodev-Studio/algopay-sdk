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
}
