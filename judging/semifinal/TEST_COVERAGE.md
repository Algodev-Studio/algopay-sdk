# Test coverage — technical table talking point

Run from repo clone (editable install, not site-packages):

```bash
cd python
pip install -e ".[dev]"
pytest --cov=algopay --cov-report=term-missing -m "not integration" -q
```

**Last run (semifinal prep):**

| Metric | Value |
|--------|-------|
| Tests passing | 109 |
| Integration tests | 1 deselected (opt-in live TestNet) |
| Line coverage | ~74% |
| Test files | 24 under `python/tests/` |

**Covered areas:** guards (all 6), ledger, intents, payment router, x402 adapter, storage, wallet, client facade.

**Gaps to state honestly:** See updated [TESTING.md](TESTING.md) for full-matrix metrics (Playwright e2e, expanded TS tests, telemetry). x402 HTTPS E2E and live TestNet transfer integration still not in default CI.
