export interface StorageBackend {
  save(collection: string, key: string, data: Record<string, unknown>): Promise<void>;
  get(collection: string, key: string): Promise<Record<string, unknown> | null>;
  delete(collection: string, key: string): Promise<boolean>;
  query(
    collection: string,
    filters?: Record<string, unknown> | null,
    limit?: number | null,
    offset?: number,
  ): Promise<Record<string, unknown>[]>;
  update(collection: string, key: string, data: Record<string, unknown>): Promise<boolean>;
  count(collection: string, filters?: Record<string, unknown> | null): Promise<number>;
  clear(collection: string): Promise<number>;
  atomicAdd(collection: string, key: string, amount: string): Promise<string>;
  healthCheck(): Promise<boolean>;
}
