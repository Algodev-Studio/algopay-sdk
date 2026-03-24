# Getting started

## Requirements

- **Python 3.10+**
- Access to **Algod** and **Indexer** HTTP APIs (defaults use [AlgoNode](https://algonode.io/) public endpoints for the selected network)

## Install from PyPI

The published package name is **`algopay-sdk`**. You still **`import algopay`** in code.

=== "Pin alpha"

    ```bash
    pip install "algopay-sdk==0.1.0a1"
    ```

=== "Any pre-release in range"

    ```bash
    pip install --pre "algopay-sdk>=0.1.0a1,<0.2"
    ```

=== "From repository (editable)"

    ```bash
    git clone https://github.com/Algodev-Studio/algopay-sdk.git
    cd algopay-sdk
    pip install -e ".[dev]"
    ```

## Configure the network

The SDK reads [environment variables](ENVIRONMENT.md) and applies **constructor overrides** on `AlgoPay`.

**Common choices:**

| Goal | What to set |
| ---- | ----------- |
| Testnet (default) | Nothing, or `ALGOPAY_NETWORK=algorand-testnet` |
| Mainnet | `ALGOPAY_NETWORK=algorand-mainnet` |
| Custom node | `ALGOD_URL`, `INDEXER_URL` (or `ALGOPAY_ALGOD_URL` / `ALGOPAY_INDEXER_URL`) |
| Custom USDC ASA | `ALGOPAY_USDC_ASA_ID` |
| Shared guard/ledger state | `ALGOPAY_STORAGE_BACKEND=redis` and `ALGOPAY_REDIS_URL` |

```python
from algopay import AlgoPay
from algopay.core.types import Network

# Explicit testnet (same as default for most installs)
client = AlgoPay(network=Network.ALGORAND_TESTNET)

# Optional: override RPC URLs
client = AlgoPay(
    network=Network.ALGORAND_TESTNET,
    algod_url="https://testnet-api.algonode.cloud",
    indexer_url="https://testnet-idx.algonode.cloud",
)
```

## Create a wallet and pay USDC

1. **Create** a wallet set and wallet (keys live in the in-process `WalletRepository` unless you plug in persistence).
2. **Fund** the address with ALGO (fee sink) using your preferred faucet or flow.
3. **Opt in** to the USDC ASA: `client.wallet.opt_in_usdc(wallet_id)`.
4. **Acquire** USDC on that address (testnet dispenser, swap, etc.).
5. Call **`await client.pay(wallet_id, receiver_address, amount)`**.

See `examples/basic_payment.py` in the repository for a script that uses `ALGOPAY_TO_ADDRESS` and `ALGOPAY_AMOUNT`.

```python
import asyncio
from algopay import AlgoPay
from algopay.core.types import Network

async def main():
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = client.wallet.create_wallet_set("demo")
    w = client.wallet.create_wallet(ws.id)
    print(w.address, w.id)
    # After fund + opt-in + USDC:
    result = await client.pay(
        w.id,
        "RECEIVER58CHARALGORANDADDRESSAAAAAAAAAAAA",
        "0.01",
        wait_for_completion=True,
    )
    print(result.success, result.blockchain_tx, result.error)

asyncio.run(main())
```

## Pay an x402 URL

If `recipient` is an **https://** URL, the router uses the **x402** adapter (HTTP 402 discovery, quote, payment, retry). Cap the spend with `amount` as the maximum USDC you allow.

```python
result = await client.pay(wallet_id, "https://api.example.com/paid-resource", "1.0")
```

See [x402 HTTP payments](guides/x402.md) and `examples/x402_client_demo.py`.

## Next steps

- [Wallets](guides/wallets.md) — sets, balances, opt-in, signing
- [Payments & routing](guides/payments.md) — `pay`, `simulate`, idempotency, fees
- [Guards](guides/guards.md) — budgets, allowlists, rate limits
- [API reference](reference/api.md) — `AlgoPay`, `Config`, types, exceptions
