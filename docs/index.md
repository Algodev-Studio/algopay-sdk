# AlgoPay SDK

Python library for **AI agent payments on [Algorand](https://www.algorand.com/)**: local wallets, **USDC (ASA)** transfers, **[x402](https://github.com/coinbase/x402)** HTTP 402 flows, spending **guards**, **ledger**, and **payment intents**.

<div class="grid cards" markdown>

-   :material-package-variant:{ .lg .middle } __PyPI package__

    ---

    Install **`algopay-sdk`**, import **`algopay`**:

    [`pip install "algopay-sdk==0.1.0a1"`](https://pypi.org/project/algopay-sdk/0.1.0a1/)

-   :material-book-open-variant:{ .lg .middle } __Guides__

    ---

    [Getting started](getting-started.md) · [Wallets](guides/wallets.md) · [Payments](guides/payments.md) · [x402](guides/x402.md)

-   :material-api:{ .lg .middle } __Reference__

    ---

    [API](reference/api.md) · [Environment](ENVIRONMENT.md)

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
| **Storage** | `memory` or **Redis** for guards, ledger entries, intents (not wallet keys by default) |

## Quick install

```bash
pip install "algopay-sdk==0.1.0a1"
# pre-releases: pip install --pre "algopay-sdk>=0.1.0a1,<0.2"
```

From a clone (development):

```bash
pip install -e ".[dev]"
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
