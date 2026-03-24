# Payment intents & batch

## Payment intents (authorize / capture)

A **payment intent** separates **authorization** (simulation + persistence of intent) from **capture** (actual `pay()`).

1. **`await client.create_payment_intent(wallet_id, recipient, amount, ...)`**  
   Runs **`simulate()`** first. If it would fail, raises **`PaymentError`**. Otherwise creates a **[`PaymentIntent`](../reference/api.md#algopay.core.types.PaymentIntent)** with status **`requires_confirmation`**.

2. **`await client.confirm_payment_intent(intent_id)`**  
   Loads the intent, transitions to processing, calls **`pay()`** with metadata from the intent, then marks **succeeded** or **failed**.

3. **`await client.cancel_payment_intent(intent_id)`** — Cancels intents still in **`requires_confirmation`**.

4. **`await client.get_payment_intent(intent_id)`** — Lookup.

Use intents when a human or another service must **approve** before funds move, or when you want a durable **two-phase** flow.

## Batch payments

**`await client.batch_pay(requests, concurrency=5)`** accepts a list of **[`PaymentRequest`](../reference/api.md#algopay.core.types.PaymentRequest)** (`wallet_id`, `recipient`, `amount`, optional `purpose`, `idempotency_key`, `destination_chain`, `metadata`).

Returns **[`BatchPaymentResult`](../reference/api.md#algopay.core.types.BatchPaymentResult)** with aggregate counts and per-item **`PaymentResult`** entries. Tune **`concurrency`** for throughput vs RPC load.

## Related

- [Payments & routing](payments.md)
- [API reference](../reference/api.md)
