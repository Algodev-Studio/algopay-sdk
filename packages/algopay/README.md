# @algodev-studio/algopay

TypeScript client for **AlgoPay** on Algorand: wallet sets, USDC (ASA) transfers, balances. **x402** payment routing returns a clear “not bundled” message in this alpha; use the Python SDK with `x402-avm` for full x402 until TS wiring lands.

## Install

```bash
npm install @algodev-studio/algopay
```

(From this monorepo: `npm install` at repo root, then `npm run build --workspace=@algodev-studio/algopay`.)

## Usage

```typescript
import { AlgoPay, Network } from "@algodev-studio/algopay";

const client = new AlgoPay({ network: Network.ALGORAND_TESTNET });
const set = await client.createWalletSet("my-agent");
const w = await client.createWallet(set.id);
console.log(w.address);
const bal = await client.getBalance(w.id);
const result = await client.pay(w.id, "RECEIVER58CHAR...", "1.0", {
  purpose: "invoice #1",
});
```

## Environment

Same as Python: `ALGOPAY_NETWORK`, `ALGOD_URL`, `INDEXER_URL`, `ALGOPAY_USDC_ASA_ID`, optional `ALGOD_TOKEN`.

## Hosted control plane

For **Locus-style** server-assisted signing and dashboard, run `apps/web` in this repository (vault + API keys + `POST /api/agent/pay`).
