# Panel prep cheat sheet — memorize before semifinal

## One-sentence problem

> AI agent builders face uncontrolled autonomous spending with no audit trail — one runaway agent loop can drain a wallet in minutes.

## Revenue one-liner

> SDK is free like Stripe's client libraries; we charge for the hosted control plane, settlement, and enterprise governance.

## Monetization tiers (quick)

| Tier | Price | Key limit |
|------|-------|-----------|
| Starter | Free | 2 wallets, 1K API calls/mo |
| Builder | $39/mo | 10 wallets, 25K calls |
| Team | $149/mo | Approval UI, audit export |
| Enterprise | Custom | SSO, KMS, SLA |
| Usage | +$0.001/tx | After 1K free settlements/mo |

## First 100 users

30 Algorand · 25 MCP/LangChain/CrewAI · 20 indie dev · 15 university · 10 ecosystem listings

## 10X users answer

- **SDK agents:** horizontal processes + `ALGOPAY_STORAGE_BACKEND=redis`
- **Console:** Postgres pooling, signing job queue, indexer for reads
- **Chain:** batch pay, fee-payer treasury, fallback indexer/node
- **Cost at 10X:** ~$150–400/mo (Vercel Pro, Postgres, Redis, indexer)

## Honest gaps (say these plainly)

| Gap | Status |
|-----|--------|
| TypeScript test suite | 1 file vs 24 Python test files |
| Hosted x402 URLs | SDK yes; `POST /api/agent/pay` USDC-only today |
| Facilitator / checkout | Documented plan, not shipped |
| SDK wallet keys | In-memory; console uses encrypted vault |
| Smart contracts | Off-chain guards by design for alpha |

## Technical walkthrough path

`python/src/algopay/client.py` → `pay()` → `GuardManager` → `Ledger.record` → `payment/router.py` → `protocols/x402.py` or `transfer.py`

## Test stats (cite at technical table)

- **109** pytest tests passing (`pytest -m "not integration"`)
- **~74%** line coverage on `algopay` package
- CI: Python 3.10/3.12, ruff, Next.js build

## Q&A rapid fire

| Question | Answer |
|----------|--------|
| Why not a database? | Agents need programmatic wallets without human KYC; chain = verifiable settlement; guards off-chain for speed |
| Why Algorand vs Base? | Governed control plane for Algorand x402 — fast finality, low fees; same protocol, underserved tooling |
| How make money? | Free SDK; paid hosted vault, policies, settlement fees |
| Validated? | Shared with design partners; community reference apps; alpha on PyPI, console live |
| Who is liable? | Human org that owns vault and sets policy; we make delegation explicit |
| Regulatory? | Aware of KYC/AML for enterprises; consulting legal; recipient screening on roadmap |

## Team (scalability table)

- **Presenting:** AI engineer + CS grad (both engineers)
- **Advisor:** founding engineer at ops startup (not presenting)
- **Learning:** blockchain in production; honest about alpha stage

## Links to have open

- https://github.com/Algodev-Studio/algopay-sdk
- https://algopay-sdk-pay.vercel.app/
- https://dorahacks.io/buidl/42990
- https://algodev-studio.github.io/algopay-sdk/
