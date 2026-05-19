# Changelog

All notable changes to this project are documented here. Python uses PEP 440 (`0.1.0a1`); TypeScript uses semver pre-release (`0.1.0-alpha.1`).

## [0.1.0a2] / [0.1.0-alpha.2] - 2026-05-19

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

