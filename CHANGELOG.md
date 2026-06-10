# Changelog

All notable changes to this project are documented here. Python uses PEP 440 (`0.1.0a1`); TypeScript uses semver pre-release (`0.1.0-alpha.1`).

## [0.1.0a4] / [0.1.0-alpha.4] - 2026-06-11

### Added

- **TypeScript:** `WalletService.optInUsdc()` — opt a wallet into the configured USDC ASA before receiving transfers.
- **SDK telemetry** (both languages): optional fire-and-forget event reporting to the hosted console via `ALGOPAY_CONSOLE_URL` + `ALGOPAY_API_KEY`.
- **TypeScript tests:** Vitest coverage for guards, router, client, and telemetry.

## [0.1.0a3] - 2026-05-20

### Fixed

- **PyPI wheel:** `0.1.0a2` wheels contained no `algopay/` package (`ModuleNotFoundError` after `pip install`). Build config corrected; CI runs `scripts/check_wheel.py` before publish.
- **Dependencies:** Removed unused `cryptography` (conflicted with Google Colab’s `pydrive2` / `pyOpenSSL`). Moved `redis` to optional extra `algopay-sdk[redis]` (default storage remains `memory`).

### Added

- `python/scripts/check_wheel.py` — fails the build if the wheel is missing `algopay/__init__.py`.

## [0.1.0a2] / [0.1.0-alpha.2] - 2026-05-19

### Deprecated

- **Do not use PyPI `0.1.0a2`** — broken empty wheel. Upgrade to **`0.1.0a3`** or newer.

### Changed

- Re-release with expanded dual-SDK documentation, full TypeScript client parity, and updated PyPI README (replaces earlier `0.1.0a1` wheel on PyPI).

## [0.1.0a1] / [0.1.0-alpha.1] - 2026-05-19

### Added

- **Python SDK** (`algopay-sdk` on PyPI): Algorand wallets, USDC (ASA) transfers, x402 HTTP 402 flows, guards, ledger, payment intents, batch payments, in-memory and Redis storage backends.
- **TypeScript SDK** (`@algodev-studio/algopay` on npm): Feature parity with the Python `AlgoPay` client surface (guards, ledger, intents, batch, simulate, x402, error types).
- Monorepo documentation (MkDocs), examples under `python/examples/`, and optional hosted control plane under `pay/`.

### Known limitations (TypeScript alpha)

- No built-in **Redis** storage backend (default `memory`; use `registerStorageBackend()` for custom backends).
- Protocol routing lives in `PaymentRouter` rather than separate `TransferAdapter` / `X402Adapter` classes (behavior matches Python).

