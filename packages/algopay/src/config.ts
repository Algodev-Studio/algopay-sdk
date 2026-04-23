import { Network } from "./types.js";
import {
  ALGORAND_MAINNET_CAIP2,
  ALGORAND_TESTNET_CAIP2,
  USDC_MAINNET_ASA_ID,
  USDC_TESTNET_ASA_ID,
} from "./constants.js";

function env(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

export interface ConfigOptions {
  network?: Network;
  algodUrl?: string;
  indexerUrl?: string;
  usdcAsaId?: number;
}

export class Config {
  readonly network: Network;
  readonly algodUrl: string;
  readonly indexerUrl: string;
  readonly usdcAsaId: number;

  constructor(opts: ConfigOptions = {}) {
    const netRaw = opts.network ?? parseNetwork(env("ALGOPAY_NETWORK", "algorand-testnet")!);
    this.network = netRaw;
    this.usdcAsaId =
      opts.usdcAsaId ??
      (env("ALGOPAY_USDC_ASA_ID") ? Number(env("ALGOPAY_USDC_ASA_ID")) : defaultUsdc(netRaw));

    const algod =
      opts.algodUrl ?? env("ALGOD_URL") ?? env("ALGOPAY_ALGOD_URL") ?? defaultAlgod(netRaw);
    const indexer =
      opts.indexerUrl ??
      env("INDEXER_URL") ??
      env("ALGOPAY_INDEXER_URL") ??
      defaultIndexer(netRaw);

    this.algodUrl = algod;
    this.indexerUrl = indexer;
  }

  /** Algorand network as x402 CAIP-2 (for `@x402-avm` registration). */
  get networkCaip2(): string {
    return this.network === Network.ALGORAND_MAINNET
      ? ALGORAND_MAINNET_CAIP2
      : ALGORAND_TESTNET_CAIP2;
  }

  static fromEnv(overrides: ConfigOptions = {}): Config {
    return new Config(overrides);
  }
}

function parseNetwork(v: string): Network {
  const s = v.trim().toLowerCase().replaceAll("_", "-");
  if (s === Network.ALGORAND_MAINNET) return Network.ALGORAND_MAINNET;
  if (s === Network.ALGORAND_TESTNET) return Network.ALGORAND_TESTNET;
  throw new Error(`Unknown ALGOPAY_NETWORK: ${v}`);
}

function defaultUsdc(network: Network): number {
  return network === Network.ALGORAND_MAINNET ? USDC_MAINNET_ASA_ID : USDC_TESTNET_ASA_ID;
}

function defaultAlgod(network: Network): string {
  return network === Network.ALGORAND_MAINNET
    ? "https://mainnet-api.algonode.cloud"
    : "https://testnet-api.algonode.cloud";
}

function defaultIndexer(network: Network): string {
  return network === Network.ALGORAND_MAINNET
    ? "https://mainnet-idx.algonode.cloud"
    : "https://testnet-idx.algonode.cloud";
}
