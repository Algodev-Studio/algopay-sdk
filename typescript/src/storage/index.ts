export type { StorageBackend } from "./base.js";
export { InMemoryStorage } from "./memory.js";

import { InMemoryStorage } from "./memory.js";
import type { StorageBackend } from "./base.js";

const _backends = new Map<string, () => StorageBackend>();
_backends.set("memory", () => new InMemoryStorage());

export function registerStorageBackend(name: string, factory: () => StorageBackend): void {
  _backends.set(name, factory);
}

export function getStorage(backendName?: string | null): StorageBackend {
  const name = backendName ?? process.env.ALGOPAY_STORAGE_BACKEND ?? "memory";
  const factory = _backends.get(name);
  if (!factory) {
    throw new Error(
      `Unknown storage backend: "${name}". Available: ${[..._backends.keys()].join(", ")}`,
    );
  }
  return factory();
}
