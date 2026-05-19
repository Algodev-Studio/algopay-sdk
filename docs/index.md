# AlgoPay SDK

**AlgoPay** is **AI-agent payment infrastructure on [Algorand](https://www.algorand.com/)**: wallets, **USDC (ASA)** transfers, **[x402](https://github.com/coinbase/x402)** HTTP 402 flows, **guards**, **ledger**, and **payment intents**.

This repository is a **polyglot monorepo**: **`python/`** ships **PyPI `algopay-sdk`**; **`typescript/`** ships **`@algodev-studio/algopay`**; **`pay/`** is the hosted **Next.js** dashboard.


<div class="grid cards" markdown="1">

-   :material-package-variant:{ .lg .middle } __PyPI package__

    ---

    Install **`algopay-sdk`**, import **`algopay`**:

    [`pip install "algopay-sdk==0.1.0a2"`](https://pypi.org/project/algopay-sdk/0.1.0a2/)

-   :material-language-typescript:{ .lg .middle } __npm (TypeScript)__

    ---

    Package **`@algodev-studio/algopay`** — guards, ledger, intents, `pay()`, x402. [TypeScript guide](guides/typescript.md) · [npm install](https://www.npmjs.com/package/@algodev-studio/algopay)

-   :material-book-open-variant:{ .lg .middle } __Guides__

    ---

    [Getting started](getting-started.md) · [Wallets](guides/wallets.md) · [Payments](guides/payments.md) · [x402](guides/x402.md)

-   :material-api:{ .lg .middle } __Reference__

    ---

    [API](reference/api.md) · [Environment](ENVIRONMENT.md)

-   :material-sitemap:{ .lg .middle } __Navigate the repo__

    ---

    [Documentation map — humans & LLMs](DOCUMENTATION_MAP.md) · [Platform feature matrix](PLATFORM_FEATURE_MATRIX.md) · [Control plane](ecosystem/CONTROL_PLANE.md)

</div>

## Status

**0.1.0 alpha** — APIs and behavior may change. See the [testing roadmap](TESTING_ROADMAP.md) before production use. The distribution on PyPI is **[algopay-sdk](https://pypi.org/project/algopay-sdk/)**; the import name remains **`algopay`**.

## At a glance

| Topic | What it does |
| ----- | ------------ |
| **AlgoPay** | Single entry point: config, chain, wallet service, payment router, guards, ledger, intents |
| **Wallets** | In-process key storage, Algorand addresses, USDC opt-in, balances, transfers |
| **Payments** | `pay()` routes to **direct ASA transfer** or **x402** from the recipient string |
| **Guards** | Budget, per-tx limits, recipients, rate limits, human confirmation — wallet or wallet-set scoped |
| **Ledger** | Records attempts; sync with Indexer via `sync_transaction` |
| **Storage** | `memory` or **Redis** (Python built-in; TS: `memory` + custom backends) for guards, ledger, intents |

## Quick install

```bash
pip install "algopay-sdk==0.1.0a2"
# pre-releases: pip install --pre "algopay-sdk>=0.1.0a2,<0.2"
```

From a clone (development):

```bash
pip install -e "./python[dev]"
```

## Minimal example

```python
import asyncio
from algopay import AlgoPay
from algopay.core.types import Network

async def main():
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = client.wallet.create_wallet_set("my-agent")
    w = client.wallet.create_wallet(ws.id)
    # Fund ALGO, opt-in USDC, acquire USDC — then:
    await client.pay(w.id, "RECEIVER58CHARALGORANDADDRESSAAAAAAAAAAAA", "1.0")

asyncio.run(main())
```

## Links

- **Source:** [github.com/Algodev-Studio/algopay-sdk](https://github.com/Algodev-Studio/algopay-sdk)
- **PyPI:** [pypi.org/project/algopay-sdk](https://pypi.org/project/algopay-sdk/)
- **Algorand x402 scheme:** [scheme_exact_algo.md](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_algo.md)
- **Repo navigation:** [DOCUMENTATION_MAP.md](DOCUMENTATION_MAP.md) (task routing, paths, naming)
