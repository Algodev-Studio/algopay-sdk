# @algodev-studio/algopay

TypeScript client for **AlgoPay** on Algorand — wallet sets, USDC (ASA) transfers, **x402** HTTP 402 flows, **guards**, **ledger**, **payment intents**, and **batch** payments. API surface matches the Python [`algopay-sdk`](https://pypi.org/project/algopay-sdk/) client (camelCase method names).

## Install

```bash
npm install @algodev-studio/algopay@0.1.0-alpha.2
```

From this monorepo (repo root):

```bash
npm install
npm run build --workspace=@algodev-studio/algopay
```

Requires **Node 20+**.

## Quick start

```typescript
import { AlgoPay, Network } from "@algodev-studio/algopay";

const client = new AlgoPay({ network: Network.ALGORAND_TESTNET });
const set = await client.createWalletSet("my-agent");
const w = await client.createWallet(set.id);

await client.addBudgetGuard(w.id, { dailyLimit: "100" });
const result = await client.pay(w.id, "RECEIVER58CHARALGORANDADDRESSAAAAAAAAAAAA", "0.01", {
  purpose: "invoice #1",
});
console.log(result.success, result.blockchainTx);
```

### x402

```typescript
await client.pay(w.id, "https://api.example.com/paid-resource", "1.0");
```

Uses `@x402-avm/fetch` and `@x402-avm/avm` (Algorand exact scheme), aligned with Python `X402Adapter`.

## Main API (`AlgoPay`)

| Area | Methods |
| ---- | ------- |
| Wallets | `createWalletSet`, `createWallet`, `listWallets`, `listWalletSets`, `getWallet`, `getBalance`, `listTransactions` |
| Payments | `pay`, `simulate`, `canPay`, `detectMethod`, `batchPay` |
| Intents | `createPaymentIntent`, `confirmPaymentIntent`, `getPaymentIntent`, `cancelPaymentIntent` |
| Ledger | `ledger` property, `syncTransaction` |
| Guards | `guards` property; `addBudgetGuard`, `addSingleTxGuard`, `addRecipientGuard`, `addRateLimitGuard`, `addConfirmGuard`, `addJustificationGuard` (+ `*ForSet` variants); `listGuards`, `listGuardsForSet` |

Lower-level exports: `WalletService`, `GuardManager`, `Ledger`, guard classes, `PaymentRouter`, `BatchProcessor`, error types — see [`src/index.ts`](src/index.ts).

## Environment

Same as Python ([ENVIRONMENT.md](https://github.com/Algodev-Studio/algopay-sdk/blob/main/docs/ENVIRONMENT.md)):

- `ALGOPAY_NETWORK`, `ALGOD_URL`, `INDEXER_URL`, `ALGOPAY_USDC_ASA_ID`
- `ALGOPAY_STORAGE_BACKEND` — only **`memory`** is built in; use `registerStorageBackend()` for Redis or other backends
- `ALGOPAY_LOG_LEVEL`, optional `ALGOD_TOKEN`

## Python ↔ TypeScript

See [TypeScript SDK guide](https://github.com/Algodev-Studio/algopay-sdk/blob/main/docs/guides/typescript.md) for a full method name map.

## Hosted control plane

Optional Next.js dashboard under **`pay/`** (vault + API keys). [Control plane docs](https://github.com/Algodev-Studio/algopay-sdk/blob/main/docs/ecosystem/CONTROL_PLANE.md).

## License

MIT
