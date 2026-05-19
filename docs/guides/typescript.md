# TypeScript SDK

Package: **[`@algodev-studio/algopay`](https://www.npmjs.com/package/@algodev-studio/algopay)** in **`typescript/`**. Mirrors the Python **`algopay-sdk`** client with **camelCase** method names.

## Install

```bash
npm install @algodev-studio/algopay@0.1.0-alpha.2
```

Monorepo development (repo root, Node 20+):

```bash
npm install
npm run build --workspace=@algodev-studio/algopay
```

## Configure the network

Environment variables match [Environment variables](../ENVIRONMENT.md). Constructor overrides:

```typescript
import { AlgoPay, Network } from "@algodev-studio/algopay";

const client = new AlgoPay({
  network: Network.ALGORAND_TESTNET,
  algodUrl: "https://testnet-api.algonode.cloud",
  indexerUrl: "https://testnet-idx.algonode.cloud",
});
```

## Wallet and pay

```typescript
const set = await client.createWalletSet("demo");
const w = await client.createWallet(set.id);
console.log(w.address);

// After fund ALGO, opt-in USDC, acquire USDC on testnet:
await client.addBudgetGuard(w.id, { dailyLimit: "50" });
const result = await client.pay(w.id, "RECEIVER58CHAR...", "0.01", {
  purpose: "demo payment",
  waitForCompletion: true,
});
```

Access wallet helpers via `client.wallet` (same as top-level shortcuts for create/list/get).

## x402

```typescript
const result = await client.pay(
  w.id,
  "https://api.example.com/paid-resource",
  "1.0", // maximum USDC allowed
);
```

## Guards, ledger, intents, batch

Behavior matches [Guards](guards.md), [Intents & batch](intents-batch.md), and [Ledger & storage](ledger-storage.md) for Python.

```typescript
await client.addRecipientGuard(w.id, {
  mode: "whitelist",
  addresses: ["RECEIVER58CHARALGORANDADDRESSAAAAAAAAAAAA"],
});

const sim = await client.simulate(w.id, recipient, "1.0");
const intent = await client.createPaymentIntent(w.id, recipient, "1.0");
const captured = await client.confirmPaymentIntent(intent.id);

const batch = await client.batchPay(
  [
    { walletId: w.id, recipient, amount: "0.01" },
  ],
  5,
);
```

## Python ↔ TypeScript method map

| Python (`AlgoPay`) | TypeScript (`AlgoPay`) |
| ------------------ | ---------------------- |
| `create_wallet_set` | `createWalletSet` |
| `create_wallet` | `createWallet` |
| `list_wallets` | `listWallets` |
| `list_wallet_sets` | `listWalletSets` |
| `get_wallet` | `getWallet` |
| `get_balance` | `getBalance` |
| `list_transactions` | `listTransactions` |
| `pay` | `pay` |
| `simulate` | `simulate` |
| `can_pay` | `canPay` |
| `detect_method` | `detectMethod` |
| `create_payment_intent` | `createPaymentIntent` |
| `confirm_payment_intent` | `confirmPaymentIntent` |
| `get_payment_intent` | `getPaymentIntent` |
| `cancel_payment_intent` | `cancelPaymentIntent` |
| `batch_pay` | `batchPay` |
| `sync_transaction` | `syncTransaction` |
| `add_budget_guard` | `addBudgetGuard` |
| `add_budget_guard_for_set` | `addBudgetGuardForSet` |
| `add_single_tx_guard` | `addSingleTxGuard` |
| `add_recipient_guard` | `addRecipientGuard` |
| `add_recipient_guard_for_set` | `addRecipientGuardForSet` |
| `add_rate_limit_guard` | `addRateLimitGuard` |
| `add_rate_limit_guard_for_set` | `addRateLimitGuardForSet` |
| `add_confirm_guard` | `addConfirmGuard` |
| `add_confirm_guard_for_set` | `addConfirmGuardForSet` |
| `add_justification_guard` | `addJustificationGuard` |
| `add_justification_guard_for_set` | `addJustificationGuardForSet` |
| `list_guards` | `listGuards` |
| `list_guards_for_set` | `listGuardsForSet` |

Properties: `client.wallet`, `client.guards`, `client.ledger`, `client.intents` (Python: `client.intents` property + intent methods on client).

## Known limitations (0.1.0 alpha)

| Topic | TypeScript | Python |
| ----- | ---------- | ------ |
| Redis storage | Not built-in; `registerStorageBackend("redis", factory)` or custom | `ALGOPAY_STORAGE_BACKEND=redis` |
| Protocol adapters | Logic in `PaymentRouter` | `TransferAdapter` + `X402Adapter` classes |
| API reference on MkDocs | This guide + npm README | [API reference](../reference/api.md) (generated from docstrings) |

## Next steps

- [Getting started](../getting-started.md) (Python-focused install path)
- [Platform feature matrix](../PLATFORM_FEATURE_MATRIX.md)
- [Package README](https://github.com/Algodev-Studio/algopay-sdk/blob/main/typescript/README.md)
