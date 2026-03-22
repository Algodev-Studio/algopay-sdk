# AlgoPay environment variables

This document describes every environment variable used by the **AlgoPay** SDK and its **examples**. Values can usually be overridden in code via `Config(...)` or `AlgoPay(..., config=...)`.

**Testing note:** Automated **unit tests** should **not** depend on these variables (use mocks). For **live testnet / x402** checks, see **[TESTING_ROADMAP.md](TESTING_ROADMAP.md)** (integration markers, how to obtain ALGO/USDC URLs, Redis, etc.).

## Core SDK (`Config.from_env`)

| Variable | Required | Default / behavior | Purpose |
| -------- | -------- | ------------------ | ------- |
| **`ALGOPAY_NETWORK`** | No | `algorand-testnet` | Which Algorand network the SDK targets. Use `algorand-mainnet` or `algorand-testnet`. Drives default Algod/Indexer URLs and default USDC ASA ID when not overridden. |
| **`ALGOD_URL`** | No | AlgoNode public API for the chosen network | HTTP(S) URL of an **Algod** REST API. Used to submit transactions, query suggested params, and confirm rounds. **`ALGOPAY_ALGOD_URL`** is an alias (checked if `ALGOD_URL` is unset). |
| **`ALGOPAY_ALGOD_URL`** | No | Same as `ALGOD_URL` | Alternate name for the Algod URL; useful if you want all AlgoPay vars prefixed with `ALGOPAY_`. |
| **`INDEXER_URL`** | No | AlgoNode public indexer for the chosen network | HTTP(S) URL of the **Indexer** API. Used for account balances, transaction lookup (`sync_transaction`), and history. **`ALGOPAY_INDEXER_URL`** is an alias. |
| **`ALGOPAY_INDEXER_URL`** | No | Same as `INDEXER_URL` | Alternate name for the Indexer URL. |
| **`ALGOPAY_USDC_ASA_ID`** | No | Network default (e.g. mainnet USDCa) | Integer **ASA ID** for USDC on that network. Override if you use a different USDC ASA, a sandbox asset, or a non-standard deployment. |
| **`ALGOPAY_STORAGE_BACKEND`** | No | `memory` | Where guard/ledger/intent metadata is stored: `memory` (process-local) or `redis` (shared across processes). Wallet **key material** uses `WalletRepository` in memory unless you implement persistence separately. |
| **`ALGOPAY_REDIS_URL`** | If using Redis | None | Redis connection string (e.g. `redis://localhost:6379/0`) when `ALGOPAY_STORAGE_BACKEND=redis`. |
| **`ALGOPAY_LOG_LEVEL`** | No | `INFO` | Logging verbosity for the SDK (`DEBUG`, `INFO`, `WARNING`, …). Also read when constructing `AlgoPay` if log level is not passed explicitly. |
| **`ALGOPAY_DEFAULT_WALLET`** | No | None | Optional default **wallet ID** string so calls can omit the wallet when a single agent wallet is standard for the process. |
| **`ALGOPAY_ENV`** | No | `development` | Arbitrary environment label (e.g. `production`) for logging or future behavior switches; does not change chain RPC by itself. |

## Example scripts only

These are **not** read by `Config.from_env`; they only configure `examples/*.py`.

| Variable | Used in | Purpose |
| -------- | ------- | ------- |
| **`ALGOPAY_TO_ADDRESS`** | `examples/basic_payment.py` | 58-character **receiver** Algorand address for a demo USDC transfer. |
| **`ALGOPAY_AMOUNT`** | `examples/basic_payment.py` | Demo transfer amount in USDC (string, e.g. `0.01`). |
| **`ALGOPAY_X402_URL`** | `examples/x402_client_demo.py` | HTTPS URL of a resource that returns **x402** payment requirements (402 flow). |
| **`ALGOPAY_MAX_USDC`** | `examples/x402_client_demo.py` | Maximum USDC the demo client allows the resource to charge (safety cap). |

## Not configured via environment (today)

The `Config` dataclass includes fields such as `http_timeout`, `request_timeout`, `transaction_poll_interval`, and `transaction_poll_timeout` with code defaults. They are **not** currently loaded from environment variables; set them in Python if you need to change them.

## Quick `.env` template

```bash
ALGOPAY_NETWORK=algorand-testnet
# Optional overrides:
# ALGOD_URL=https://testnet-api.algonode.cloud
# INDEXER_URL=https://testnet-idx.algonode.cloud
# ALGOPAY_USDC_ASA_ID=10458941
# ALGOPAY_STORAGE_BACKEND=memory
# ALGOPAY_REDIS_URL=redis://localhost:6379/0
# ALGOPAY_LOG_LEVEL=INFO
# ALGOPAY_DEFAULT_WALLET=
# ALGOPAY_ENV=development
```

Load with `python-dotenv` in your app if desired; the SDK does not auto-load `.env` files.
