# AlgoPay testing — quick reference

**Last run:** 2026-06-11

Full report: **[docs/TESTING.md](docs/TESTING.md)** · Backlog: **[docs/TESTING_ROADMAP.md](docs/TESTING_ROADMAP.md)** · Judges: **[judging/semifinal/TESTING.md](judging/semifinal/TESTING.md)**

## Key metrics

| Layer | Passing | Coverage / scope |
|-------|---------|------------------|
| Python SDK | 114 tests | 75% line coverage |
| TypeScript SDK | 18 tests | 44% stmt coverage; guards + telemetry + router |
| pay/ Playwright | 17 E2E specs | Auth, CRUD, API keys, telemetry, playground |
| Community smoke | 4/4 scripts | Mock mode, no TestNet |
| Integration (opt-in) | 1 test | Live TestNet; not in CI |

## Run everything (unit + smoke)

```bash
cd python && pip install -e ".[dev]" && pytest -m "not integration" -q
npm run test:js
npm run smoke:community
```

## Dashboard E2E (needs Docker Postgres on port 5433)

```bash
cd pay
docker compose -f docker-compose.e2e.yml up -d --wait
npx playwright install chromium
npm run test:e2e
```

## CI

Push/PR to `main` runs Python matrix, TypeScript vitest, Playwright e2e (with Postgres service), and community smoke — see `.github/workflows/ci.yml`.
