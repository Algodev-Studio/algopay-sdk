# Testing roadmap: alpha → 1.0 / enterprise-ready

This document explains **what “thoroughly tested” means** for AlgoPay, a **minimal file + scenario checklist**, and **when environment variables** are required.

## Do you need env vars to test everything?

| Layer | Env vars needed? | Notes |
| ----- | ---------------- | ----- |
| **Unit tests** (default CI) | **No** | Mock HTTP (`httpx`, `respx`), mock or stub Algod/Indexer responses, use **fakeredis** or **in-memory** storage. |
| **Integration tests (testnet)** | **Optional** | Funded testnet account, optional Redis URL, optional real x402 HTTPS URL. Use `pytest -m "not integration"` in CI without env. |
| **Staging / production** | **Yes** | Real Algod/Indexer (or your node), Redis if shared storage, merchant x402 URLs. |

**Bottom line:** You can reach **high coverage and CI green** without any secrets. **Env vars** are for **live chain / live HTTP** checks you run manually or in a gated job.

---

## Minimal checklist toward **1.0**

Use this as a backlog. File names are suggestions; merge/split as you prefer.

### 1. Configuration & types

| File | Scenarios |
| ---- | --------- |
| `tests/test_config.py` | `from_env()` with `patch.dict(os.environ)` for every `ALGOPAY_*` / `ALGOD_URL` / `INDEXER_URL`; mainnet vs testnet defaults; invalid `ALGOPAY_USDC_ASA_ID`; `with_updates()`. |
| `tests/test_types.py` | `Network.from_string`, CAIP-2, edge cases. |

### 2. Storage

| File | Scenarios |
| ---- | --------- |
| `tests/test_storage_memory.py` | CRUD for keys used by guards/ledger; TTL or cleanup if applicable. |
| `tests/test_storage_redis.py` | Same contract against **fakeredis** (no Docker) or **pytest-redis** / **testcontainers** if you want a real server. |
| `tests/test_get_storage.py` | `get_storage()` respects `ALGOPAY_STORAGE_BACKEND` and fails clearly without `ALGOPAY_REDIS_URL` when `redis`. |

### 3. Guards

| File | Scenarios |
| ---- | --------- |
| `tests/test_guards_budget.py` | Under/over budget, reset window, concurrent updates (memory backend). |
| `tests/test_guards_rate_limit.py` | Burst allowed, then block; per-key isolation. |
| `tests/test_guards_recipient.py` | Allowlist / blocklist / unknown. |
| `tests/test_guards_single_tx.py` | One in-flight; release on success/failure. |
| `tests/test_guards_confirm.py` | Confirmation / delay paths if implemented. |
| `tests/test_guards_manager.py` | Order of execution, short-circuit on failure, integration with mock `PaymentContext`. |

### 4. Ledger & intents

| File | Scenarios |
| ---- | --------- |
| `tests/test_ledger.py` | Append entry, idempotency, list/filter, sync with **mocked** indexer client. |
| `tests/test_intents.py` | Create, complete, expire, cancel; storage persistence. |

### 5. Protocols (mocked chain / HTTP)

| File | Scenarios |
| ---- | --------- |
| `tests/test_transfer_adapter.py` | `supports`, `simulate` success/failure; **mock** `AlgorandClient` / suggested params / send; opt-in path. |
| `tests/test_x402_adapter.py` | Parse 402 body, build payment payload, **mock** `httpx` for resource + facilitator if used; error paths (timeout, invalid schema). |

### 6. Payment router & batch

| File | Scenarios |
| ---- | --------- |
| `tests/test_payment_router.py` | Routing: URL → x402, address → transfer; guard hooks invoked; failure surfaces correct exception. |
| `tests/test_payment_batch.py` | Multiple pays, partial failure, ordering. |

### 7. Wallet service

| File | Scenarios |
| ---- | --------- |
| `tests/test_wallet_service.py` | Create set/wallet, get, sign bytes, opt-in simulation (mock algod), errors for missing wallet. |

### 8. `AlgoPay` client

| File | Scenarios |
| ---- | --------- |
| `tests/test_client.py` | `pay()` delegates to router with mocks; default wallet from env/config; logging; batch API. |

### 9. Integration (optional, marked)

| File | Scenarios |
| ---- | --------- |
| `tests/integration/test_transfer_testnet.py` | Real **testnet** USDC transfer (small amount); requires funded wallet. `@pytest.mark.integration`. |
| `tests/integration/test_x402_e2e.py` | Real HTTPS x402 resource; requires `ALGOPAY_X402_URL` or similar. |

**pytest.ini / pyproject:** register `integration` marker; CI runs `pytest -m "not integration"` by default.

---

## Enterprise-ready extras (beyond minimal 1.0)

- **CI:** GitHub Actions / GitLab CI: Python 3.10–3.13, `pytest`, `ruff check`, `mypy` (strict on `src/algopay`), coverage gate (e.g. ≥80% on critical modules).
- **Supply chain:** `pip-audit` or `uv pip audit` in CI.
- **Release:** signed tags, changelog, semantic versioning post-1.0.
- **Docs:** migration guide when breaking changes ship.
- **Support matrix:** pinned minimum versions of `py-algorand-sdk`, `x402-avm`, tested in CI.

---

## How to obtain values for **integration** / manual testing

### Algod & Indexer (testnet)

- **Defaults:** AlgoPay already defaults to public AlgoNode endpoints (no API key) for testnet/mainnet.
- **Custom:** Run [AlgoKit](https://github.com/algorandfoundation/algokit) localnet, or use a provider that gives you URLs + optional keys. Set `ALGOD_URL` / `INDEXER_URL` (or `ALGOPAY_*` aliases).

### Test ALGO

- Use the official **[TestNet dispenser](https://bank.testnet.algorand.network/)** (or your org’s dispenser) to fund the agent wallet address for fees.

### Testnet USDC (ASA)

- Use your network’s documented **test USDC** ASA ID (AlgoPay defaults per `Network`). You may need a **faucet** or internal tap; see [Algorand developer docs](https://developer.algorand.org/) and [AlgoBharat dev portal](https://algobharat.in/devportal/) for current faucets and ASAs.

### Opt-in to USDC

- Your code path (`opt_in_usdc` or equivalent) must run once per wallet before receiving ASA.

### Redis

- Local: `docker run -p 6379:6379 redis` → `ALGOPAY_REDIS_URL=redis://localhost:6379/0`.
- Managed: use the URL from your cloud provider (TLS URLs supported by your client version).

### x402 HTTPS URL

- Deploy a resource server using the **Algorand x402** stack (e.g. `@x402-avm/express` / facilitator patterns in [scheme_exact_algo](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_algo.md)), or use a **demo endpoint** your team hosts. Set `ALGOPAY_X402_URL` for the example script or integration test.

### No Circle / no API keys for AlgoPay core

- Unlike EVM Circle WaaS flows, **AlgoPay does not require `CIRCLE_API_KEY`** for Algorand transfers. Keys are generated locally in `WalletRepository` unless you add a custom custody integration.

---

## Suggested exit criteria for **1.0.0** (non-alpha)

1. All checklist sections **1–8** implemented with **mocks** (no env required in CI).
2. **Integration** tests documented and runnable with a short “funding + env” doc (this file + [ENVIRONMENT.md](ENVIRONMENT.md)).
3. **Coverage** target on `client`, `payment/router`, `protocols/*`, `guards/*` agreed and enforced (e.g. ≥75–85%).
4. **mypy + ruff** clean on `src/algopay`.
5. **Changelog** and stable **`1.0.0`** on PyPI.
