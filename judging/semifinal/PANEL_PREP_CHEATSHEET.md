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

---

## NEW — Extended Q&A for new narrative angles

### Self-driving car analogy pushback

**Q: "Isn't the car analogy a stretch? Cars cause physical harm, agents just move money."**
> The analogy holds on accountability structure, not harm type. In both cases: autonomous system acting on behalf of a human principal, making decisions the principal can't supervise in real time, under laws that haven't caught up. The EU's AI Liability Directive explicitly covers autonomous systems causing *financial* harm. We're building the accountability layer before regulators force someone to.

**Q: "What specific law makes you worried about agent payment liability?"**
> EU AI Liability Directive (in progress) places liability on the **deployer** — the company using the AI system. In the US, existing agency law likely makes the developer or employer of the agent responsible. Neither framework has agent payment specifics yet. Our pitch is: build the audit trail now, so when regulators do catch up, our customers have proof they governed their agents responsibly.

**Q: "You say 'who is liable' but AlgoPay doesn't solve liability — it just logs things."**
> Correct — we don't eliminate liability, we make it auditable and delegatable. The vault owner sets policy, the ledger records every decision. When a dispute happens, there's a clear, cryptographically verifiable chain of delegation: org → workspace → agent → policy → transaction. That's the accountability layer. It doesn't prevent all bad outcomes, but it makes them explainable and defensible.

---

### Competitive moat

**Q: "Coinbase and Circle are heavily investing in x402. Why don't they just add a guard layer?"**
> They're building the payment protocol infrastructure — horizontal, multi-chain. We're building the governance layer vertical on Algorand. Coinbase's x402 has no budget enforcement, no audit ledger, no hosted non-custodial vault. Their incentive is transaction volume, not spend governance. Our incentive is the opposite: we want every payment to be deliberate and auditable, which is what enterprise buyers pay for.

**Q: "What stops Algorand Foundation from building this themselves?"**
> Foundations build protocols and tooling for the chain. Governance and spend control for AI agents is an application-layer problem, not a protocol problem. Same reason Ethereum Foundation doesn't build Aave — the ecosystem companies do. We're the Aave of agent spend governance on Algorand.

**Q: "What if OpenAI or Anthropic builds agent payment governance into their platforms?"**
> They would solve it for their own agents on their own infrastructure. We're chain-native and SDK-agnostic — any agent using any LLM framework (LangChain, CrewAI, AutoGPT, custom) can embed `pip install algopay-sdk`. We're the neutral infrastructure layer, not tied to any one AI provider. That's a feature when regulators eventually want auditable records that aren't self-certified by AI companies.

---

### Technical depth

**Q: "Why off-chain guards instead of smart contract enforcement?"**
> On-chain guards: every policy check costs gas, adds ~4s latency, requires a blockchain RPC call before money moves. Our guards run in-process in milliseconds — budget checks, rate limits, allowlists, justification text. Only the final payment hits the chain. For enterprise customers with human approval queues and daily cap enforcement, that interaction pattern must be fast and cheap. We can add on-chain policy attestation as an upgrade without changing the developer API.

**Q: "How do you prevent a bad actor from bypassing the SDK and calling the chain directly?"**
> The SDK guards are the first line; the vault is the second line. In the hosted console, the private key never leaves the server-side vault (AES-256-GCM encrypted at rest). Agents authenticate with an API key that is scoped to specific wallet sets and has daily caps enforced server-side. Even if someone calls the chain directly, they need the decrypted private key to sign — and that only happens through our API with policy applied.

**Q: "How does the ledger handle failures? What if a payment submits but the ledger write fails?"**
> We use payment intents: the ledger record is created before the transaction is submitted, marked `pending`. On success the tx hash is written back; on failure the intent is marked `failed` with the error. If the server crashes between submission and the write-back, the intent stays `pending` and the next ledger sync picks up the on-chain state from the indexer. It's not perfectly atomic today — honest gap — but the intent record always exists before money moves.

---

### Market and numbers

**Q: "35M on Base x402 is cumulative since launch. That's not much traction."**
> We agree it's early-stage. That's the point — the market is forming right now. The first $35M on Base took months and is already accelerating. Our position is to own the Algorand governance layer before the ecosystem reaches that scale. Being early is the strategy.

**Q: "Why would enterprises trust a crypto-native startup with agent payment governance?"**
> Same reason they trusted Stripe before Stripe had enterprise customers — the infrastructure has to be built by someone, and the builders who understand both the protocol and the use case tend to win. We're not asking enterprises to trust crypto; we're giving them a non-custodial vault with policy enforcement and an audit ledger that works like a compliance tool, backed by blockchain settlement. The crypto is the settlement layer, invisible to the compliance team.

---

## Industry signals to cite (memorize 1-2 stats per judge type)

| Signal | Detail | Cite to |
|--------|--------|---------|
| Stripe x402 | Stripe officially documented x402 machine payments in their developer portal | Technical judges |
| Visa stablecoin | Visa launched USDC settlement on Solana + Ethereum for US merchants (2024) | Business judges |
| JPM micropayments | J.P. Morgan published research: micropayments "inflection point" from AI agent commerce | Business judges |
| Base x402 volume | $35M+ cumulative x402 volume on Base since protocol launch | Scalability judges |
| EU AI Liability | EU AI Liability Directive proposal places financial harm liability on AI deployers | Regulatory questions |

## Team (scalability table)

- **Presenting:** AI engineer + CS grad (both engineers)
- **Advisor:** founding engineer at ops startup (not presenting)
- **Learning:** blockchain in production; honest about alpha stage

## Links to have open

- https://github.com/Algodev-Studio/algopay-sdk
- https://algopay-sdk-pay.vercel.app/
- https://dorahacks.io/buidl/42990
- https://algodev-studio.github.io/algopay-sdk/
