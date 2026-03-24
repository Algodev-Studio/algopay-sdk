# Payments & routing

## `AlgoPay.pay`

The main payment API is **`await client.pay(wallet_id, recipient, amount, ...)`**.

- **`recipient`** — Either a **58-character Algorand address** (direct **USDC transfer**) or an **`https://` URL** (**[x402](x402.md)** flow).
- **`amount`** — For transfers, the **exact** USDC amount. For x402, the **maximum** USDC you allow the resource to charge (safety cap).
- **Guards** run before routing unless `skip_guards=True` (dangerous).
- **Ledger** records the attempt and updates status from success, failure, or guard block.

Key parameters:

| Parameter | Role |
| --------- | ---- |
| `wallet_set_id` | Scope **set-level** guards |
| `purpose` | Human-readable note; stored in ledger metadata |
| `idempotency_key` | Deduplication key (auto-generated if omitted) |
| `fee_level` | `FeeLevel` for Algorand fees |
| `wait_for_completion` / `timeout_seconds` | Poll until confirmed |
| `metadata` | Extra dict merged into routing / ledger |
| `skip_guards` | Bypass guard chain (use only when you fully trust the call path) |

Returns **[`PaymentResult`](../reference/api.md#algopay.core.types.PaymentResult)** (`success`, `blockchain_tx`, `status`, `method`, `error`, `guards_passed`, `resource_data` for x402, …).

## Routing

[`PaymentRouter`](https://github.com/Algodev-Studio/algopay-sdk/blob/main/src/algopay/payment/router.py) registers:

- **`X402Adapter`** — HTTPS recipients
- **`TransferAdapter`** — Algorand address recipients

Helpers on `AlgoPay`:

- **`can_pay(recipient)`** — Whether any adapter accepts the recipient
- **`detect_method(recipient)`** — `PaymentMethod.X402` or `TRANSFER`, or `None`

## Simulation

**`await client.simulate(wallet_id, recipient, amount, ...)`** runs guard checks and router simulation **without** spending funds. Returns **[`SimulationResult`](../reference/api.md#algopay.core.types.SimulationResult)** (`would_succeed`, `route`, `reason`, …).

Use this for UX pre-checks or policy validation before showing a confirm button.

## Batch payments

**`await client.batch_pay(requests, concurrency=5)`** executes multiple **[`PaymentRequest`](../reference/api.md#algopay.core.types.PaymentRequest)** objects concurrently (see [Intents & batch](intents-batch.md)).

## Errors

Validation and business failures surface as **`ValidationError`**, **`PaymentError`**, **`InsufficientBalanceError`**, etc. See the [exceptions section in the API reference](../reference/api.md#exceptions).

## Related

- [x402 HTTP payments](x402.md)
- [Guards](guards.md)
- [Ledger & storage](ledger-storage.md)
