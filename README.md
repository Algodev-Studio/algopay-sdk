# AlgoPay SDK

Python package (**PyPI:** `algopay-sdk`) for **AI agent payments on Algorand**: local wallets, **USDC (ASA)** transfers, **x402** HTTP 402 flows, guards, ledger, and payment intents.

> **Status: 0.1.0 alpha (`0.1.0a1` on PyPI when published)** — APIs and behavior may change. Test coverage is still expanding; see **[Testing roadmap → 1.0](docs/TESTING_ROADMAP.md)** before relying on this in production.  
> **Source:** [github.com/Algodev-Studio/algopay-sdk](https://github.com/Algodev-Studio/algopay-sdk)

## Install

**From PyPI (alpha — pin the version or use `--pre`):**

On PyPI the distribution is **`algopay-sdk`**; you still **`import algopay`** in code.

```bash
pip install "algopay-sdk==0.1.0a1"
# or: pip install --pre "algopay-sdk>=0.1.0a1,<0.2"
```

**From a clone (development):**

```bash
pip install -e ".[dev]"
```

## Monorepo (TypeScript SDK + hosted console)

This repository also contains:

- **`packages/algopay`** — npm package **`@algodev-studio/algopay`** (wallets, USDC transfer, balance).
- **`apps/console`** — Next.js **control plane**: dashboard, encrypted key **vault**, APIs & keys, workspace policies, **`POST /api/agent/pay`** for server-assisted signing.

From the repo root (Node 20+):

```bash
npm install
cp apps/console/.env.example apps/console/.env
# Set SESSION_SECRET (32+ chars), ALGOPAY_VAULT_MASTER_KEY (base64 32 bytes), DATABASE_URL=file:./dev.db
npm run db:push --workspace=algopay-console
npm run dev
```

See [REPOSITORY_LAYOUT.md](REPOSITORY_LAYOUT.md) and [docs/PLATFORM_FEATURE_MATRIX.md](docs/PLATFORM_FEATURE_MATRIX.md).

Docs: [docs/ecosystem/CONTROL_PLANE.md](docs/ecosystem/CONTROL_PLANE.md).

## Requirements

- Python 3.10+

**Environment variables:** see **[docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)** for a full table (`ALGOPAY_NETWORK`, Algod/Indexer URLs, USDC ASA ID, Redis, logging, and example-only vars).

Short version:

- `ALGOPAY_NETWORK` — `algorand-mainnet` or `algorand-testnet` (default: testnet)
- Optional: `ALGOD_URL` / `ALGOPAY_ALGOD_URL`, `INDEXER_URL` / `ALGOPAY_INDEXER_URL`, `ALGOPAY_USDC_ASA_ID`
- Redis: `ALGOPAY_STORAGE_BACKEND=redis`, `ALGOPAY_REDIS_URL`

## Quick start

```python
import asyncio
from algopay import AlgoPay
from algopay.core.types import Network

async def main():
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = client.wallet.create_wallet_set("my-agent")
    w = client.wallet.create_wallet(ws.id)
    # Fund the address with test ALGO + opt-in to USDC, then:
    # client.wallet.opt_in_usdc(w.id)
    # ... acquire USDC ...
    await client.pay(w.id, "RECEIVER58CHARALGORANDADDRESSAAAAAAAAAAAA", "1.0")

asyncio.run(main())
```

## Documentation

- **[Documentation map](docs/DOCUMENTATION_MAP.md)** — repo navigation for humans and LLMs (paths, naming, task routing)
- **[AGENTS.md](AGENTS.md)** — concise instructions for AI coding agents (Cursor, bots)
- **Site (guides + API):** [algodev-studio.github.io/algopay-sdk](https://algodev-studio.github.io/algopay-sdk/) — build locally with `pip install -e ".[docs]"` then `mkdocs serve`
- [Environment variables](docs/ENVIRONMENT.md)
- [Publishing (PyPI + npm)](docs/PUBLISHING.md) — optional **`Publish`** workflow in `.github/workflows/publish.yml`
- [Testing roadmap & enterprise readiness](docs/TESTING_ROADMAP.md)
- [Legacy OmniAgentPay / arc-merchant reference](docs/REFERENCE_LEGACY_OMNIAGENTPAY_AND_ARC_MERCHANT.md)
- `examples/` and the [Algorand x402 scheme](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_algo.md)

## License

MIT
