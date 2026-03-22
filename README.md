# AlgoPay

Python SDK for **AI agent payments on Algorand**: local wallets, **USDC (ASA)** transfers, **x402** HTTP 402 flows, guards, ledger, and payment intents.

## Install

```bash
pip install -e ".[dev]"
```

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

- [Environment variables](docs/ENVIRONMENT.md)
- [Legacy OmniAgentPay / arc-merchant reference](docs/REFERENCE_LEGACY_OMNIAGENTPAY_AND_ARC_MERCHANT.md) (after removing reference trees from the repo)
- `examples/` and the [Algorand x402 scheme](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_algo.md)

## License

MIT
