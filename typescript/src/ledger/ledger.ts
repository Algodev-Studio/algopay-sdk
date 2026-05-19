import type { StorageBackend } from "../storage/base.js";

export enum LedgerEntryType {
  PAYMENT = "payment",
  REFUND = "refund",
  TRANSFER = "transfer",
  FEE = "fee",
}

export enum LedgerEntryStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  BLOCKED = "blocked",
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  walletId: string;
  walletSetId?: string | null;
  recipient: string;
  amount: string;
  entryType: LedgerEntryType;
  status: LedgerEntryStatus;
  txHash?: string | null;
  method: string;
  purpose?: string | null;
  metadata: Record<string, unknown>;
}

export function createLedgerEntry(partial: Partial<LedgerEntry> & { walletId: string; recipient: string; amount: string }): LedgerEntry {
  return {
    id: partial.id ?? crypto.randomUUID(),
    timestamp: partial.timestamp ?? new Date().toISOString(),
    walletId: partial.walletId,
    walletSetId: partial.walletSetId ?? null,
    recipient: partial.recipient,
    amount: partial.amount,
    entryType: partial.entryType ?? LedgerEntryType.PAYMENT,
    status: partial.status ?? LedgerEntryStatus.PENDING,
    txHash: partial.txHash ?? null,
    method: partial.method ?? "",
    purpose: partial.purpose ?? null,
    metadata: partial.metadata ?? {},
  };
}

const COLLECTION = "ledger_entries";

export class Ledger {
  private readonly _storage: StorageBackend;

  constructor(storage: StorageBackend) {
    this._storage = storage;
  }

  async record(entry: LedgerEntry): Promise<string> {
    await this._storage.save(COLLECTION, entry.id, entry as unknown as Record<string, unknown>);
    return entry.id;
  }

  async get(entryId: string): Promise<LedgerEntry | null> {
    const data = await this._storage.get(COLLECTION, entryId);
    return data ? (data as unknown as LedgerEntry) : null;
  }

  async updateStatus(
    entryId: string,
    status: LedgerEntryStatus,
    txHash?: string | null,
    metadataUpdates?: Record<string, unknown>,
  ): Promise<boolean> {
    const data = await this._storage.get(COLLECTION, entryId);
    if (!data) return false;

    const updates: Record<string, unknown> = { status };
    if (txHash) updates.txHash = txHash;
    if (metadataUpdates) {
      const currentMeta = (data.metadata as Record<string, unknown>) ?? {};
      updates.metadata = { ...currentMeta, ...metadataUpdates };
    }
    await this._storage.update(COLLECTION, entryId, updates);
    return true;
  }

  async query(opts?: {
    walletId?: string;
    walletSetId?: string;
    recipient?: string;
    entryType?: LedgerEntryType;
    status?: LedgerEntryStatus;
    fromDate?: string;
    toDate?: string;
    limit?: number;
  }): Promise<LedgerEntry[]> {
    const filters: Record<string, unknown> = {};
    if (opts?.walletId) filters.walletId = opts.walletId;
    if (opts?.walletSetId) filters.walletSetId = opts.walletSetId;
    if (opts?.recipient) filters.recipient = opts.recipient;
    if (opts?.entryType) filters.entryType = opts.entryType;
    if (opts?.status) filters.status = opts.status;

    const limit = opts?.limit ?? 100;
    const fetchLimit = opts?.fromDate || opts?.toDate ? limit * 2 : limit;

    const raw = await this._storage.query(COLLECTION, filters, fetchLimit);
    let entries = raw as unknown as LedgerEntry[];

    if (opts?.fromDate || opts?.toDate) {
      entries = entries.filter((e) => {
        if (opts?.fromDate && e.timestamp < opts.fromDate) return false;
        if (opts?.toDate && e.timestamp > opts.toDate) return false;
        return true;
      });
    }

    entries.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
    return entries.slice(0, limit);
  }

  async getTotalSpent(walletId: string, fromDate?: string): Promise<string> {
    const filters: Record<string, unknown> = {
      walletId,
      status: LedgerEntryStatus.COMPLETED,
    };
    const raw = await this._storage.query(COLLECTION, filters);
    let total = 0;
    for (const data of raw) {
      const entry = data as unknown as LedgerEntry;
      if (entry.entryType !== LedgerEntryType.PAYMENT && entry.entryType !== LedgerEntryType.TRANSFER) continue;
      if (fromDate && entry.timestamp < fromDate) continue;
      total += Number(entry.amount);
    }
    return String(total);
  }

  async clear(): Promise<number> {
    return this._storage.clear(COLLECTION);
  }
}
