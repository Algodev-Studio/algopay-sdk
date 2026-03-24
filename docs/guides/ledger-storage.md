# Ledger & storage

## Ledger

Every **`pay()`** creates a **ledger entry** before guards and routing. Status transitions include **pending**, **completed**, **failed**, and **blocked** (guard rejection).

**`await client.sync_transaction(entry_id)`** loads the entry, reads the Algorand **transaction id** from metadata / `tx_hash`, fetches confirmation from the **Indexer** via `AlgorandClient`, and updates ledger metadata (e.g. `indexer_confirmed`).

Use the ledger for **auditing**, reconciliation, and surfacing history to operators.

## Storage backends

Configured with **`ALGOPAY_STORAGE_BACKEND`**:

| Value | Use case |
| ----- | -------- |
| **`memory`** (default) | Single process, tests, quick demos |
| **`redis`** | Multiple workers, shared guard counters, shared intents |

Set **`ALGOPAY_REDIS_URL`** when using Redis.

!!! warning "Wallet keys"
    **Wallet private keys** are **not** stored in Redis by default; they remain in the in-process `WalletRepository`. Only guard/ledger/intent **metadata** uses the pluggable storage.

## Accessing services in code

On `AlgoPay`:

- **`client.ledger`** — [`Ledger`](https://github.com/Algodev-Studio/algopay-sdk/blob/main/src/algopay/ledger/ledger.py) instance
- **`client.config`** — [`Config`](../reference/api.md#algopay.core.config.Config)

## Related

- [Environment variables](../ENVIRONMENT.md)
- [Guards](guards.md)
