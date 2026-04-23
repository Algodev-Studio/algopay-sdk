# Agent payment platform — feature matrix (AlgoPay)

**Purpose:** Map **AlgoPay** (Python SDK, TypeScript SDK, hosted console) to the capability areas common in **agent payment platforms** (hosted wallet + USDC + API billing + x402 + dashboards). This document does **not** reference third-party products by name.

**Navigation:** [Documentation map](DOCUMENTATION_MAP.md) · [Control plane](ecosystem/CONTROL_PLANE.md) · [Publishing](PUBLISHING.md)

---

## Common “agent payments” doc themes (neutral)

Typical platform documentation groups **quick start**, **wallets**, **USDC transfers**, **spending controls**, **x402 / HTTP pay-per-call**, **wrapped or catalog APIs**, **checkout / merchants**, **beta isolation**, and sometimes **deploy-to-cloud** or **marketplace** verticals. The table below states AlgoPay coverage without naming any vendor.

| Theme | AlgoPay |
| ----- | ------- |
| Quick start / onboarding | **Yes** — [Getting started](getting-started.md), console routes |
| Wallets & balances | **Yes** — SDKs + console vault |
| USDC transfers | **Yes** |
| Policies / limits / justification | **Yes** (SDK + console policies); approvals **UI partial** |
| x402 | **Yes** — [x402 guide](guides/x402.md) |
| Wrapped / proxy API catalog | **Planned** — [Wrapped APIs](ecosystem/wrapped-apis.md) |
| Checkout / sessions / webhooks | **Planned** — [Checkout](ecosystem/checkout-and-facilitator.md) |
| Multi-chain MPP-style (non-Algorand) | **Optional / not default** |
| Paid infrastructure deploy | **Out of scope** |
| Tasks / cards / credits programs | **Out of scope** (partner) |

---

## Summary

| Area | AlgoPay today | Notes |
| ---- | ------------- | ----- |
| **Wallets & USDC on Algorand** | **Shipped** | Python + TS SDKs; console vault + `POST /api/agent/pay` |
| **Spending policies** (budgets, per-tx caps, justification, allowlists) | **Shipped** (SDK + partial UI) | Console policies; guards in SDK |
| **x402 (HTTP 402) pay-per-call** | **Shipped** | Python `x402-avm`; TS `@x402-avm/*` |
| **Transaction / activity history** | **Shipped** | Console ledger views; SDK ledger |
| **Human-in-the-loop approvals** | **Partial** | `ConfirmGuard` / intents in SDK; **UI queue stub** |
| **Orders / commerce state machine** | **Stub** | Console placeholder route only |
| **Wrapped API catalog / proxy billing** | **Planned** | Strategy: [Wrapped APIs](ecosystem/wrapped-apis.md); no gateway in repo yet |
| **Merchant checkout (sessions, webhooks, buyer flow)** | **Planned** | See [Checkout & facilitator](ecosystem/checkout-and-facilitator.md) |
| **Multi-chain “machine payable” protocols beyond Algorand** | **Optional / out of scope** | Default settlement is **Algorand USDC** |
| **Paid infrastructure deploy (git/API provisioning)** | **Out of scope** | Not part of this SDK |
| **Human task marketplaces, card issuance, promotional credits** | **Out of scope** | Partner or separate product |

---

## Console (`apps/console`) vs dashboard patterns

| Dashboard pattern | AlgoPay console | Python `algopay-sdk` |
| ----------------- | --------------- | -------------------- |
| **Onboarding — create wallet** | `/onboarding` + **Wallets** | `create_wallet` / wallet sets |
| **Onboarding — user-held key backup** | **Different model:** keys are **server-vaulted** by default; optional future **export backup** flow | N/A (in-memory or custom repo) |
| **Login / register** | `/login`, `/register` | N/A |
| **Overview — allowance, max tx, approval threshold** | **Policies** (daily/single-tx caps, justification); approval threshold ↔ confirm guard — **no pending queue UI yet** | `BudgetGuard`, `SingleTxGuard`, `ConfirmGuard`, `JustificationGuard` |
| **Wallet card** (QR, fund, send) | **Wallets:** address + USDC balance; **no** QR / Fund / Send widgets yet | `get_usdc_balance`, `pay()`, transfers |
| **Transactions** | `/dashboard/transactions` | `ledger` |
| **Orders** | `/dashboard/orders` — **stub** | N/A |
| **Approvals queue** | `/dashboard/approvals` — **stub** | `ConfirmGuard`, intents |
| **APIs & keys** | `/dashboard/apis` — keys + placeholders for custom x402 endpoints | x402 client in SDKs |
| **Docs link** | Points to published MkDocs site | — |

---

## SDK parity

| Capability | Python (`algopay-sdk`) | TypeScript (`@algodev-studio/algopay`) |
| ---------- | ---------------------- | --------------------------------------- |
| Wallet sets / addresses | Yes | Yes |
| USDC transfer | Yes | Yes |
| x402 `https://` recipients | Yes (`x402-avm`) | Yes (`@x402-avm/fetch`, `@x402-avm/avm`) |
| Guards / ledger / intents | Yes | Align where exposed in TS package |

---

## Roadmap (closer platform parity)

1. **Approvals inbox** — Wire console to `PaymentIntent` / confirm guard; operators approve/reject from UI.
2. **Orders** — Persisted order model and API for agent-initiated commerce.
3. **Overview UX** — QR for receive address, Fund/Send actions.
4. **Wrapped API gateway** — Catalog, reserve/charge, provider toggles (see [wrapped-apis.md](ecosystem/wrapped-apis.md)).
5. **Checkout** — Session lifecycle + webhooks + optional React embed (see [checkout-and-facilitator.md](ecosystem/checkout-and-facilitator.md)).
6. **Optional mnemonic export** — Disaster recovery with strong UX warnings.

---

## Deployment surface

- **Python:** PyPI package **`algopay-sdk`** — see [Publishing](PUBLISHING.md).
- **TypeScript:** npm **`@algodev-studio/algopay`** — same document (npm section).
- **Console:** Deploy as a standard Next.js app (env vars in [Control plane](ecosystem/CONTROL_PLANE.md)); not published to PyPI/npm as a library.
