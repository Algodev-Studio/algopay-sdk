# Testing — judge one-pager

**Date:** 2026-06-11 · Full report: [docs/TESTING.md](../../docs/TESTING.md)

---

## Slide-ready metrics

| Metric | Value |
|--------|-------|
| **Python unit tests** | **114 passing** (1 opt-in integration deselected) |
| **Python line coverage** | **75%** |
| **TypeScript unit tests** | **18 passing** (was 1) |
| **TypeScript coverage** | **44%** on critical paths (guards, router, telemetry, client) |
| **Dashboard E2E (Playwright)** | **17 automated specs** in CI |
| **Community example smoke** | **4/4** pass in mock mode |
| **CI jobs** | Python 3.10/3.12, Node 22 + Playwright, community smoke |

---

## What we test end-to-end

1. **SDK (Python)** — all six guard types, ledger, intents, payment router, x402 adapter (mocked HTTP), telemetry reporter.
2. **SDK (TypeScript)** — budget/rate-limit/manager guards, router detection, client delegation, telemetry POST contract.
3. **Hosted console (`pay/`)** — register/login, navigation, agents/merchants/gas CRUD, API key generation, SDK event ingestion → dashboard list, playground API runner, simulated payment settlement (`SIM_*` txn id).
4. **Community demos** — BudgetBot, receipts export, crew tracker, Slack approval gate (mock chain).

---

## Honest gaps (panel Q&A)

| Question | Answer |
|----------|--------|
| Dashboard fully tested? | **17 Playwright specs** cover core flows; wallet connect (Pera) and on-chain submit are **manual**. |
| Approvals page? | UI exists; **approve/reject API routes not implemented** — documented, not hidden. |
| TypeScript parity with Python? | Growing — **18 tests** vs **114**; wallet/x402 execute still thin. |
| Live TestNet in CI? | **No** — opt-in `ALGOPAY_LIVE_TESTNET=1` for smoke only. |
| x402 HTTPS E2E? | **Not yet** — unit tests use `respx` mocks. |
| Design partner validation? | See [VALIDATION_KIT.md](VALIDATION_KIT.md) — separate from automated tests. |

---

## Commands judges can run (5 min, no secrets)

```bash
cd python && pip install -e ".[dev]" && pytest -m "not integration" -q
npm run test:js
npm run smoke:community
```

---

## Related

- [TEST_COVERAGE.md](TEST_COVERAGE.md) — prior Python-only snapshot (superseded by this file)
- [VALIDATION_KIT.md](VALIDATION_KIT.md) — design partner outreach
- [LIVE_DEMO_RUNBOOK.md](LIVE_DEMO_RUNBOOK.md) — live demo steps
