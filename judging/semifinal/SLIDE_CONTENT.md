# AlgoPay — 5-Slide Deck (paste into Algorand template)

Use [`../Copy of Algorand-Presentation-Template (1).pptx`](../Copy%20of%20Algorand-Presentation-Template%20(1).pptx).
**Do not change branding, fonts, or master slides** — replace title and body text only.

Embed [`architecture.svg`](architecture.svg) on Slide 3.

---

## Slide 1 — The Machine Economy Is Here

**Title:** Stablecoins are becoming the internet's money. AI agents are ready to spend them.

**Three callout stats (large, one per column):**
- **Stripe** — x402 machine payments in official docs
- **Visa** — live stablecoin settlement in the US
- **J.P. Morgan** — "micropayments are about to have their moment"

**Body bullets:**
- Stablecoins are programmable, global, and built for software — not just humans swiping cards
- The **x402** standard revives HTTP 402 "Payment Required" so AI agents pay for APIs automatically, without a human clicking checkout every time
- The infrastructure rails are forming. The question is: **who governs them?**

**Speaker note:** Open with the industry signal. Let the logos land. Pivot on the last bullet — "the question is who governs them" — into Slide 2.

---

## Slide 2 — When Machines Crash, Who Pays?

**Title:** Autonomous vehicles taught us a lesson. Agent payments haven't learned it yet.

**Visual suggestion:** Three-column table with flag icons

| Country | Self-Driving Law | Who Is Liable? |
|---------|-----------------|----------------|
| 🇺🇸 US | NHTSA guidelines still debated | Owner **or** manufacturer — unresolved |
| 🇪🇺 EU | AI Liability Directive (proposed) | **Deployer** — the company that put the system in use |
| 🇨🇳 China | Pilot zone regulations | **Operator** — whoever is behind the wheel, even if no one is |

**Pivot bullets:**
- When a self-driving car crashes, the law is still catching up to the technology
- **Agent payments are the same story.** x402 tells an agent *how* to pay. It does not say *who is accountable* when something goes wrong
- Runaway loop drains a wallet. Agent pays a scam endpoint. CFO asks "who authorized this?" — **Is it you? Your company? Your AI provider? The API seller?**
- Right now, nobody knows. **That is the gap AlgoPay fills.**

**Speaker note:** The car analogy is the hook. Deliver the three-country table fast (~15s each). The pivot line "agent payments are the same story" is your bridge — don't rush it.

---

## Slide 3 — AlgoPay: Control + Observability

**Title:** Open SDK + hosted control plane — built machine-first, not human-checkout-bolted-on

**Image:** `architecture.svg` (full-width below title)

**Left column — What we built:**
- **SDK** (Python + TypeScript): one call `pay()` → USDC transfer or x402 HTTP payment
- **6 guard types** fire before money moves: budget cap · per-tx cap · allowlist · rate limit · justification · human confirm
- **Ledger** records every intent, decision, and outcome — full audit trail
- **Hosted console** (live today): encrypted vault, API keys, workspace policies, spend dashboard

**Right column — Why this stack:**
- AI agents **cannot pass KYC**, open a bank account, or sign a card receipt → they need programmatic wallets and micropayments
- **Why blockchain:** verifiable settlement and programmable wallets without legacy rails
- **Why Algorand:** 4-second finality · fees under $0.001 · native USDC ASA · official **x402-avm** stack · we enforce spend policy *before* the chain, cheaper than smart-contract guards
- **Observability + traceability baked in:** every `pay()` call is logged with guard results, tx hash, and explorer link — control before spend, proof after

**Speaker note:** Spend ~20s on the architecture image. The "why Algorand" column answers the question before judges ask it.

---

## Slide 4 — What We Built + What the Community Built

**Title:** Shipped, tested, and already in developers' hands

**Left panel — Traction:**
- PyPI `algopay-sdk` + npm `@algodev-studio/algopay` — published and live
- 109 pytest tests · ~74% coverage · CI on Python 3.10/3.12
- Hosted console live at **algopay-sdk-pay.vercel.app**
- Closed alpha shared with developer design partners

**Center panel — Business model:**

| Tier | Price | Key limit |
|------|-------|-----------|
| Starter | Free | 2 wallets, 1K API calls/mo |
| Builder | $39/mo | 10 wallets, 25K calls |
| Team | $149/mo | Approval UI, audit export |
| Enterprise | Custom | SSO, KMS, SLA |

SDK stays **free and open source** — we charge for the hosted control plane (same model as Stripe client libs vs. Stripe Dashboard).

**Right panel — Community built with our SDK:**
- **BudgetBot** — LangChain agent with a hard daily spending cap; blocks itself if it tries to overspend
- **MCP Weather Payer** — TypeScript MCP server that pays x402 weather APIs per call, zero human interaction
- **Research Agent Receipts** — academic research agent that logs every API payment for expense reports
- **[Your example 1]** — *(add before judging)*
- **[Your example 2]** — *(add before judging)*

**Speaker note:** Quote slots — fill with real names from design partners before judging day. The community panel shows adoption is already happening.

---

## Slide 5 — The Road Ahead + The Ask

**Title:** Agent-first today. Enterprise-ready tomorrow. AlgoPay gives operators control before spend and proof after.

**Roadmap (6 milestones, horizontal timeline — ordered per [FUTURE_SCOPE](../../docs/FUTURE_SCOPE.md)):**
- **M1** Redis shared guards · MCP server · LangChain/CrewAI adapters *(near-term: horizontal agents, same policy everywhere)*
- **M2** Wrapped API gateway — Algorand-first x402 catalog + proxy billing *(near-term: gateway revenue, one place to discover and pay APIs)*
- **M3** Facilitator network + gas sponsorship on Algorand mainnet *(medium-term: agents pay in USDC, we cover ALGO fees)*
- **M4** Agent Marketplace v1 — on-chain registration, trust scores, pay-per-call *(medium-term: govern discovery + monetization, not just spend)*
- **M5** Enterprise governance — approval queues · SSO/SAML · audit export · KMS *(medium-term: Team → Enterprise tier upsell)*
- **M6** Cross-chain settlement + sanctions screening *(long-term: Wormhole/CCTP reach + regulated deployments)*

**Growth & infra (one line under timeline):**
- **Users:** first 100 from Algorand + MCP/LangChain communities → 1,000 via enterprise design partners on Team/Enterprise tiers
- **From Algorand:** x402-avm co-marketing, ARC metadata guidance for marketplace ASAs, mainnet facilitator ALGO pool best practices
- **Infra at scale:** Redis guard state · Postgres + signing job queue · indexer for reads (~$150–400/mo at 1K workspaces)

**Why now:**
- x402 cumulative volume on Base already **$35M+** — Algorand governance tooling is underserved
- OpenAI ACP, Google AP2, and every major AI lab are pushing toward agent-native payment standards
- First-mover on Algorand = owning the governed control plane for the x402 Algorand ecosystem

**The ask / closing:**
> "We are not just a wallet library. We are the accountability layer for the machine economy. AlgoPay — control before spend, proof after. Thank you."

**Links (QR or text):**
- github.com/Algodev-Studio/algopay-sdk
- algopay-sdk-pay.vercel.app
- dorahacks.io/buidl/42990

**Speaker note:** Walk milestones left-to-right in ~30s total. M1–M2 are shipped-path engineering (see FUTURE_SCOPE near-term). M3–M5 are monetization (facilitator tx fees, gateway markup, enterprise contracts). M6 is optional reach for EVM x402 volume without leaving Algorand as home chain. If asked "why not approval first?" — approval ships in M5 with enterprise RBAC; Redis + gateway unblock scale before compliance sales. End on the closing line verbatim — pause after "proof after" before "thank you."
