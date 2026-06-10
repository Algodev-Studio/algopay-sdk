# AlgoPay semifinal — 3-minute presentation script

Practice until **2:45–3:00**. *[Brackets]* = stage directions, not spoken.

---

## OPENING — Compare (~60s) | Slide 1

> "Hi, we're **AlgoPay** — payment infrastructure for AI agents on Algorand.
>
> Let me start with where the world is heading. **Stripe** now documents x402 machine payments in their official docs. **Visa** launched stablecoin settlement in the United States. **J.P. Morgan** is publishing research saying micropayments are about to have their moment. The signal is clear: **stablecoins are becoming internet-native money** — programmable, global, and built for software, not just people swiping cards.
>
> At the same time, a new standard called **x402** is reviving HTTP status code 402 — 'Payment Required' — so AI agents can pay for APIs automatically, without a human clicking checkout every time.
>
> But here is the problem nobody has solved yet. Think about **self-driving cars**. When an autonomous vehicle crashes, who is liable? In the **United States**, regulators are still debating whether fault sits with the owner, the manufacturer, or the software. In the **European Union**, proposed AI liability rules lean toward the **deployer** — the company that put the system on the road. In **China**, some pilot programs treat the **vehicle operator** as primarily responsible. The law has not caught up to the technology.
>
> **Agent payments are the same story.** x402 tells us *how* an agent pays. It does not tell us *who is accountable* when something goes wrong — when a runaway loop drains a wallet, when an agent pays a scam endpoint, or when your CFO asks 'who authorized this?' Is it **you**, the developer? Your **company**? The **AI provider**? The **API seller**? Right now, nobody knows.
>
> **That is the gap AlgoPay fills.** We are building the **control and observability layer** for governed agent spend."

---

## MIDDLE — Explain (~75s) | Slides 2–3

> "Here is what we built.
>
> **Two layers.** First, an **open-source SDK** — Python and TypeScript, on PyPI and npm — that any agent developer can embed. One function, `pay()`, routes to either a direct **USDC transfer** on Algorand or an **x402 HTTP payment** to a paid API. Before any money moves, our **guards** run: daily budgets, per-transaction caps, recipient allowlists, rate limits, justification text, and optional human confirmation. Every payment is recorded in a **ledger** you can audit.
>
> Second, a **hosted control plane** — live today at algopay-sdk-pay.vercel.app — where teams who do not want to manage private keys themselves get an encrypted vault, API keys for agents, workspace policies, and a dashboard to see what their agents spent and why.
>
> **Why blockchain?** Because AI agents are not people. They cannot pass KYC, open a bank account, or sign a card receipt. They need **programmatic wallets** and **micropayments** at cents or fractions of a cent per API call — economics that card rails were never designed for.
>
> **Why Algorand specifically?** Three reasons. **One** — fast finality and fees under a fraction of a cent, so micropayments actually work. **Two** — native **USDC** on Algorand plus the official **x402-avm** stack, so we are aligned with the same protocol Coinbase and Cloudflare are pushing — but settled on Algorand. **Three** — we enforce spending policy **before** the transaction hits the chain, which is cheaper and faster than putting every budget rule in a smart contract.
>
> We are not just a wallet library. We are **governed agent payments** — control before spend, observability after."

**Demo transition (~10s):**

> "Let me show you this working. *[Open laptop]* In our console, I have an agent wallet with a daily budget cap. When the agent tries to exceed it — blocked. When it pays within policy — recorded in the ledger instantly. In the SDK, the same guard runs in code with `pip install algopay-sdk`."

*Backup:* "I also have a screen recording and our repo is public with 109 Python tests and CI running on every push."

---

## CLOSE — Future scope (~35s) | Slides 4–5

> "We built AlgoPay **agent-first and machine-first** from day one — not a human checkout flow with agents bolted on later.
>
> **What is next:** human-in-the-loop **approval queues** in the dashboard, x402 through our hosted API, a **wrapped API gateway** so agents can discover and pay for third-party data in one place, and **enterprise audit exports** for teams that need compliance.
>
> **Early validation:** we shared the SDK with developer friends and colleagues in the agent-builder community. Here are a few things they built — **BudgetBot**, a LangChain-style agent with a daily spending cap; **MCP Weather Payer**, a TypeScript MCP server that pays x402 APIs per call; **Research Agent Receipts**, an agent that logs every payment for expense reports.
>
> **Business model:** SDKs stay **free and open source**. We charge for the **hosted control plane** — vault custody, team policies, settlement, and enterprise governance — the same layer companies like Coinbase monetize in the x402 ecosystem.
>
> AlgoPay gives agent builders something the protocol alone does not: **know who spent what, stop bad spend before it happens, and prove it later.** Thank you — happy to take questions."

---

## Panel-specific closings (swap last 15s before "Thank you")

**Technical:** "Adapter-pattern routing, x402 via x402-avm, AES vault in the console, pytest on guards and router. Alpha — TS tests and hosted x402 on roadmap — but core `pay()` is shipped."

**Business:** "Customer today: agent builders who need spend control before production. Tomorrow: enterprises needing approvals and audit. One runaway loop can drain a wallet in minutes."

**Scalability:** "First 100 users from Algorand and MCP communities — not viral. At 10X: Redis guards, signing queue, indexer reads. Human org owns vault; agents are delegated spenders."

---

## Timing

| Section | Target |
|---------|--------|
| Compare | 0:00–1:00 |
| Explain | 1:00–2:15 |
| Demo | 2:15–2:30 |
| Future | 2:30–3:00 |

Cut order if long: (1) shorten law examples, (2) say "three developer prototypes", (3) move panel add-on to Q&A.
