# AlgoPay Semifinal — Slide content (paste into Algorand template)

Use [`../Copy of Algorand-Presentation-Template (1).pptx`](../Copy%20of%20Algorand-Presentation-Template%20(1).pptx). **Do not change branding, fonts, or master slides** — only replace title and body text on 5 content slides.

Embed [`architecture.svg`](architecture.svg) on Slide 2.

---

## Slide 1 — Business hook (Compare)

**Title:** Agents can pay now. Nobody knows who is accountable.

**Bullets:**
- Stripe, Visa, and J.P. Morgan are betting on stablecoins as **internet-native money**
- **x402** revives HTTP 402 so AI agents pay for APIs without human checkout
- Self-driving liability is unsettled globally (US / EU / China) — **agent payments have the same gap**
- x402 defines *how* money moves, not *who* is responsible when spend goes wrong
- **AlgoPay** = control + observability for governed agent spend on Algorand

**Speaker note:** Open with compare hook (~60s). Pivot to AlgoPay on last bullet.

---

## Slide 2 — Technical (Explain + architecture)

**Title:** Open SDK + hosted control plane

**Image:** `architecture.svg` (full width below title)

**Bullets:**
- **SDK** (Python + TypeScript): `pay()` → USDC transfer or x402 HTTP payment
- **Guards** before spend: budget, caps, allowlist, rate limit, justification, confirm
- **Ledger** + payment intents for audit and human-in-the-loop
- **Hosted console:** encrypted vault, API keys, workspace policies, agent-pay API
- **Why Algorand:** fast finality, sub-cent fees, native USDC + x402-avm stack

**Footer line:** 6 guard types · adapter-pattern router · pytest CI on 109 tests · ~74% coverage

---

## Slide 3 — Business use case

**Title:** Governed spend for agent builders → enterprises

**Problem (large callout):**
> AI agent builders face uncontrolled autonomous spending with no audit trail — one runaway loop can drain a wallet in minutes.

**Bullets:**
- **Today:** AI agent builders and indie devs (design partners on alpha)
- **Tomorrow:** Enterprises needing approvals, audit exports, compliance
- **Value:** block runaway spend · every `pay()` logged · `pip install algopay-sdk` in minutes
- **TAM wedge:** x402 ecosystem ($35M+ cumulative on Base) — we own Algorand governance tooling
- **Revenue:** free OSS SDK · paid hosted control plane (vault, policies, settlement)

---

## Slide 4 — Scalability & execution

**Title:** First 100 users + 6-month roadmap

**First 100 users:**

| Channel | # |
|---------|---|
| Algorand Discord / hackathon alumni | 30 |
| MCP, LangChain, CrewAI communities | 25 |
| Indie dev / Show HN | 20 |
| University workshops | 15 |
| x402 / Algorand ecosystem listings | 10 |

**6-month milestones:** M1 approvals UI · M2 hosted x402 · M3 wrapped API gateway · M4 facilitator · M5 enterprise audit · M6 Redis shared guards

**10X scale:** stateless agents + Redis guards · Postgres pool + signing queue · indexer reads · ~$150–400/mo infra at 1K workspaces

---

## Slide 5 — Demos + proof (Future scope)

**Title:** Agent-first today · enterprise-ready tomorrow

**Bullets:**
- Built **machine-first** — not human checkout with agents bolted on
- **Live:** [github.com/Algodev-Studio/algopay-sdk](https://github.com/Algodev-Studio/algopay-sdk) · [algopay-sdk-pay.vercel.app](https://algopay-sdk-pay.vercel.app/)
- **Community prototypes:** BudgetBot · MCP Weather Payer · Research Agent Receipts
- **Early feedback:** shared alpha with developer design partners
- **Ask:** AlgoPay gives operators control before spend and proof after — thank you

**Quote slots (fill with real names before judging):**
1. *"[Name], agent builder: 'I finally have a kill switch for agent spend.'"*
2. *"[Name], MCP dev: 'Plugged it into my agent in an afternoon.'"*
3. *"[Name], researcher: 'Every API call is now accounted for.'"*
