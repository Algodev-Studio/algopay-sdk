# Guards

**Guards** enforce policy **before** a payment is routed and executed. They can **reserve** capacity (budget, rate limit), **block** invalid recipients, or require **human confirmation**.

## Execution model

On **`pay()`**, AlgoPay builds a [`PaymentContext`](https://github.com/Algodev-Studio/algopay-sdk/blob/main/src/algopay/guards/base.py) and runs the **guard chain** from [`GuardManager`](https://github.com/Algodev-Studio/algopay-sdk/blob/main/src/algopay/guards/manager.py). If any guard fails, the payment returns **`PaymentStatus.BLOCKED`** and the ledger is updated accordingly. On success, reservations are **committed**; on failure or exception, they are **released**.

## Wallet vs wallet set

- **Wallet-scoped** — Applies to one `wallet_id`.
- **Set-scoped** — Applies to **every wallet** in a `wallet_set_id` (shared limits / policies).

AlgoPay exposes helpers such as `add_budget_guard` / `add_budget_guard_for_set`, `add_rate_limit_guard` / `add_rate_limit_guard_for_set`, etc. See the [API reference](../reference/api.md).

## Built-in guard types

| Guard | Purpose |
| ----- | ------- |
| **Budget** | Daily / hourly / total spend caps |
| **Single transaction** | Min/max per payment |
| **Recipient** | Allowlist or denylist for addresses, regex patterns, **domains** (x402 URLs) |
| **Rate limit** | Max payments per minute / hour / day |
| **Confirm** | Human-in-the-loop above a threshold or for all payments |

## Listing guards

```python
names = await client.list_guards(wallet_id)
set_names = await client.list_guards_for_set(wallet_set_id)
```

## Storage backend

Guard state (counters, reservations) uses the same storage as ledger and intents: **`memory`** or **`redis`** via [environment variables](../ENVIRONMENT.md). Use **Redis** when multiple processes share one agent budget.

## Related

- [Payments & routing](payments.md) — `skip_guards` escape hatch
- [Ledger & storage](ledger-storage.md)
