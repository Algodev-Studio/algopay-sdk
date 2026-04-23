import { randomUUID } from "node:crypto";
import type { Network } from "../types.js";

export interface WalletRecord {
  id: string;
  walletSetId: string;
  address: string;
  secretMnemonic: string;
  network: Network;
  createdAt: Date;
}

export interface WalletSetRecord {
  id: string;
  name: string;
}

/** In-memory wallet store (Python default). Swap for encrypted remote store in hosted mode. */
export class WalletRepository {
  private readonly sets = new Map<string, WalletSetRecord>();
  private readonly wallets = new Map<string, WalletRecord>();

  createWalletSet(name: string): WalletSetRecord {
    const id = randomUUID();
    const rec = { id, name };
    this.sets.set(id, rec);
    return rec;
  }

  listWalletSets(): WalletSetRecord[] {
    return [...this.sets.values()];
  }

  getWalletSet(id: string): WalletSetRecord | undefined {
    return this.sets.get(id);
  }

  createWallet(walletSetId: string, address: string, secretMnemonic: string, network: Network): WalletRecord {
    const id = randomUUID();
    const rec: WalletRecord = {
      id,
      walletSetId,
      address,
      secretMnemonic,
      network,
      createdAt: new Date(),
    };
    this.wallets.set(id, rec);
    return rec;
  }

  getWallet(id: string): WalletRecord | undefined {
    return this.wallets.get(id);
  }

  listWallets(walletSetId?: string): WalletRecord[] {
    const all = [...this.wallets.values()];
    if (!walletSetId) return all;
    return all.filter((w) => w.walletSetId === walletSetId);
  }
}
