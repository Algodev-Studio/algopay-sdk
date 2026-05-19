import type { StorageBackend } from "./base.js";

export class InMemoryStorage implements StorageBackend {
  private readonly _data = new Map<string, Map<string, Record<string, unknown>>>();

  private _collection(name: string): Map<string, Record<string, unknown>> {
    let coll = this._data.get(name);
    if (!coll) {
      coll = new Map();
      this._data.set(name, coll);
    }
    return coll;
  }

  async save(collection: string, key: string, data: Record<string, unknown>): Promise<void> {
    this._collection(collection).set(key, structuredClone(data));
  }

  async get(collection: string, key: string): Promise<Record<string, unknown> | null> {
    const d = this._collection(collection).get(key);
    return d ? structuredClone(d) : null;
  }

  async delete(collection: string, key: string): Promise<boolean> {
    return this._collection(collection).delete(key);
  }

  async query(
    collection: string,
    filters?: Record<string, unknown> | null,
    limit?: number | null,
    offset = 0,
  ): Promise<Record<string, unknown>[]> {
    const coll = this._collection(collection);
    const results: Record<string, unknown>[] = [];
    for (const [key, data] of coll) {
      if (filters) {
        const match = Object.entries(filters).every(([fk, fv]) => data[fk] === fv);
        if (!match) continue;
      }
      results.push({ ...structuredClone(data), _key: key });
    }
    const sliced = results.slice(offset);
    return limit != null ? sliced.slice(0, limit) : sliced;
  }

  async update(collection: string, key: string, data: Record<string, unknown>): Promise<boolean> {
    const coll = this._collection(collection);
    const existing = coll.get(key);
    if (!existing) return false;
    Object.assign(existing, structuredClone(data));
    return true;
  }

  async count(collection: string, filters?: Record<string, unknown> | null): Promise<number> {
    if (filters) return (await this.query(collection, filters)).length;
    return this._collection(collection).size;
  }

  async clear(collection: string): Promise<number> {
    const coll = this._collection(collection);
    const n = coll.size;
    coll.clear();
    return n;
  }

  async atomicAdd(collection: string, key: string, amount: string): Promise<string> {
    const coll = this._collection(collection);
    const cur = coll.get(key);
    let current = 0;
    if (cur && typeof cur === "object" && !Array.isArray(cur)) {
      current = 0;
    } else if (typeof cur === "string") {
      current = Number(cur);
    }
    // For atomic add, store raw string value instead of object
    const newVal = current + Number(amount);
    coll.set(key, { _value: String(newVal) } as Record<string, unknown>);
    return String(newVal);
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
