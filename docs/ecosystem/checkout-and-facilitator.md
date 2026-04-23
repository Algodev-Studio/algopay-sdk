# Checkout and x402 facilitator (arc-merchant track)

Merchant-side pieces stay **outside** the Python `algopay` package (see [REFERENCE_LEGACY_OMNIAGENTPAY_AND_ARC_MERCHANT](../REFERENCE_LEGACY_OMNIAGENTPAY_AND_ARC_MERCHANT.md)).

## Target architecture

1. **Resource server** — HTTP routes return `402 Payment Required` with `scheme_exact_algo` requirements ([Algorand x402 guide](https://algorand.co/agentic-commerce/x402/developers)).
2. **Facilitator** — Verifies `paymentGroup`, optional fee payer, submits to Algorand. Use a **managed facilitator** for speed or **self-hosted** for custom policy.
3. **Checkout** — Session model: `PENDING` → `PAID` | `EXPIRED` | `CANCELLED`; webhook on confirmation; optional React embed package alongside `@algodev-studio/algopay`.

## Scaffold status

The repo includes **agent pay** (`/api/agent/pay`) and **dashboard** only. Add a `checkout` workspace package or routes when you implement merchant checkout sessions.
