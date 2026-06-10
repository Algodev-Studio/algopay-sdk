# AlgoPay — Full Presentation Script (3 minutes)

Practice until **2:50–3:00**. *[Brackets]* = stage directions, not spoken.
**Bold** = emphasize. Pause marks: `…` = 1 beat, `——` = full breath.

---

## SLIDE 1 — The Machine Economy Is Here (~45s)

> "Hi, we're **AlgoPay** — payment infrastructure for AI agents.
>
> Let me start with where the world is already going.
>
> **Stripe** now documents x402 machine payments in their official developer docs.
> **Visa** launched live stablecoin settlement in the United States.
> And **J.P. Morgan** is publishing research saying micropayments are about to have their moment.
>
> The signal is clear: **stablecoins are becoming internet-native money** — programmable, global, and built for software, not just people swiping cards.
>
> At the same time, a standard called **x402** is reviving HTTP status code 402 — 'Payment Required' — so AI agents can pay for APIs automatically, without a human clicking checkout every time.
>
> The rails are forming. But there is one question nobody has answered yet. ——"

*[Advance to Slide 2]*

---

## SLIDE 2 — When Machines Crash, Who Pays? (~55s)

> "Think about **self-driving cars**.
>
> When an autonomous vehicle crashes — who is liable?
>
> In the **United States**, regulators are still debating whether fault sits with the owner, the manufacturer, or the software. **No clear answer.**
>
> In the **European Union**, proposed AI liability rules lean toward the **deployer** — the company that put the system on the road.
>
> In **China**, pilot program regulations treat the **vehicle operator** as primarily responsible — even when no human is actually driving.
>
> Three countries. Three different answers. The law has not caught up to the technology. ——
>
> **Agent payments are the exact same story.**
>
> x402 tells us *how* an agent pays. It does not tell us *who is accountable* when something goes wrong. When a runaway agent loop drains a wallet in minutes — when an agent pays a scam endpoint — when your CFO asks 'who authorized this?'
>
> Is it **you**, the developer? Your **company**? Your **AI provider**? The **API seller**?
>
> Right now… nobody knows. **That is the gap AlgoPay fills.** ——"

*[Advance to Slide 3]*

---

## SLIDE 3 — AlgoPay: Control + Observability (~55s)

> "Here is what we built.
>
> **Two layers.** First, an **open-source SDK** — Python and TypeScript, on PyPI and npm — that any agent developer can embed in minutes. One function, `pay()`, routes to either a direct **USDC transfer** on Algorand or an **x402 HTTP payment** to a paid API. Before any money moves, our **guards** run: daily budgets, per-transaction caps, recipient allowlists, rate limits, justification text, and optional human confirmation. Every payment is written to a **ledger** you can audit.
>
> Second, a **hosted control plane** — live today — where teams get an encrypted vault, API keys for agents, workspace policies, and a dashboard showing exactly what their agents spent and why. Every transaction hash links directly to the block explorer — **full traceability, in real time.**
>
> We built this **machine-first** from day one. Not a human checkout flow with agents bolted on later. Observability and accountability are not features we added — they are the foundation.
>
> **Why blockchain?** Agents cannot pass KYC or open a bank account. They need programmatic wallets and micropayments at fractions of a cent per call — economics card rails were never designed for.
>
> **Why Algorand specifically?** Four-second finality. Fees under a fraction of a cent. Native USDC. And the official **x402-avm** stack — so we are building on the same protocol Coinbase and Cloudflare are pushing, settled on Algorand. And because we enforce spending policy **before** the transaction hits the chain, we're faster and cheaper than putting every budget rule in a smart contract. ——"

*[Advance to Slide 4]*

---

## SLIDE 4 — What We Built + What the Community Built (~25s)

> "We are not just planning this — we have shipped it.
>
> PyPI and npm packages published, live today. **109 Python tests.** CI running on every push. Hosted console at algopay-sdk-pay.vercel.app.
>
> And here is what developers have already built with our SDK in the alpha. **BudgetBot** — a LangChain agent with a hard daily spending cap that blocks itself before it overspends. **MCP Weather Payer** — a TypeScript MCP server that pays x402 weather APIs per call, zero human interaction. **Research Agent Receipts** — an agent that logs every API payment as an expense report.
>
> The SDK is free and open source. We charge for the hosted control plane — the same model Stripe uses with its client libraries versus the Stripe Dashboard. ——"

*[Advance to Slide 5]*

---

## SLIDE 5 — The Road Ahead + The Ask (~20s)

> "What is next: **human-in-the-loop approval queues** in the dashboard, a hosted x402 endpoint, a wrapped API gateway where agents discover and pay for third-party data in one place, and enterprise audit exports for compliance teams.
>
> The x402 ecosystem on Base has already processed over 35 million dollars. Algorand governance tooling is underserved, and we are building the control plane for it.
>
> AlgoPay. **Control before spend. Proof after.**
>
> Thank you — happy to take questions."

---

## Timing

| Section | Target | Slide |
|---------|--------|-------|
| Machine economy | 0:00–0:45 | 1 |
| Car crash / accountability gap | 0:45–1:40 | 2 |
| What we built + why Algorand | 1:40–2:35 | 3 |
| Traction + community | 2:35–3:00 | 4 |
| Roadmap + ask | 3:00–3:20 | 5 |

**If you must cut:** (1) shorten the three-country table to "US, EU, China — three different answers, none settled", (2) skip individual community app descriptions, (3) cut M3–M6 roadmap items.

---

## Demo transition (if live demo is included, ~15s between slides 3 and 4)

> "Let me show you this working. *[Open console]* Here is an agent wallet with a daily budget cap. When the agent tries to exceed it — **blocked**. When it pays within policy — recorded in the ledger instantly, with a transaction hash linking directly to the Algorand block explorer. In the SDK, the same guard runs in code with `pip install algopay-sdk`."

**Backup line if demo fails:**
> "I have a screen recording and our repo is public — 109 tests, CI green, console live."

---

## Panel-specific closing variants (swap last 15s of Slide 5 before "Thank you")

**Technical panel:**
> "Adapter-pattern routing, x402 via x402-avm, AES-256-GCM vault in the console, 109 pytest tests on guards, router, and ledger. Alpha — TypeScript tests and hosted x402 are on the roadmap — but core `pay()` is shipped and working."

**Business panel:**
> "Customer today: agent builders who need spend control before going to production. One runaway loop can drain a wallet in minutes — we stop that. Tomorrow: enterprises needing approval workflows and audit trails for compliance."

**Scalability panel:**
> "First 100 users from Algorand and MCP communities. At 10X: Redis shared guards for horizontal agents, Postgres connection pooling, signing job queue, indexer for all reads. Infra cost at 1,000 workspaces: roughly $150–400 per month."

---

## Rapid-fire Q&A prep

### "The self-driving car analogy — isn't that a stretch? Cars cause physical harm. Agents just move money."
> "The analogy holds on the accountability structure, not the harm type. In both cases you have an autonomous system acting on behalf of a human principal, making decisions the principal cannot supervise in real time, under laws that haven't caught up. The EU's AI Liability Directive explicitly covers autonomous systems causing *financial* harm. We're building the accountability layer before regulators force someone to."

### "Who is actually liable when an agent AlgoPay governs makes a bad payment?"
> "The human organization that owns the vault and set the policy. We make that delegation explicit and auditable — there's a signed ledger record of every guard that passed and every transaction submitted. That's our value: when the CFO or regulator asks 'who authorized this?', there is a clear, cryptographically verifiable answer."

### "Why not just use smart contracts for the guards? That's more trustless."
> "We evaluated that. On-chain guards mean every policy check costs gas, adds latency, and requires a blockchain call before money moves. Our guards run off-chain in milliseconds — budget checks, rate limits, justification text — and only the final payment hits the chain. For enterprise customers who want daily budget caps and human approval queues, that interaction pattern needs to be fast and cheap. We can add on-chain verification of outcomes on our roadmap without changing the developer interface."

### "Coinbase and Circle are pushing x402 hard. What's your moat against them?"
> "They are building the payment protocol — we are building the governance layer on top of it. Coinbase's x402 tells an agent how to pay. It has no guard system, no budget enforcement, no audit ledger, no hosted console for non-custodial vault management. We are vertical on Algorand — they are horizontal across all chains. Our bet is that the Algorand ecosystem needs a dedicated governed control plane, and we are building it before anyone else does."

### "Why Algorand and not Base or Solana? Those have more developer mindshare."
> "Three reasons. One: Algorand has the official x402-avm stack — the same x402 protocol Base is running, but with native Algorand tooling. We are aligned with the same standard, on an underserved chain. Two: Algorand's fee model and finality are genuinely superior for agent micropayments — sub-cent fees and four-second finality, not gas wars. Three: the Algorand developer ecosystem is underserved for agent payment tooling — the competitive surface is clear. If we were building on Base we would be fighting Coinbase directly on their home turf."

### "74% test coverage — what's not covered? Should we be worried?"
> "The uncovered 26% is mostly TypeScript SDK (one test file vs. 24 Python files) and the hosted x402 path in the console API. Core `pay()`, all six guard types, the ledger, and the payment router have full Python coverage and CI. We're honest about the TS gap — it's on the roadmap. The Python SDK is the primary surface and it's solid."

### "What's your path to 100 users and then 1,000?"
> "First 100: 30 from Algorand Discord and hackathon alumni, 25 from MCP/LangChain/CrewAI communities, 20 indie devs via Show HN, 15 university workshops, 10 from x402 and Algorand ecosystem listings. Not viral — community-led. 1,000: enterprise design partners who need approval workflows and audit exports. That's the paid tier and the expansion motion — agent builders start free, enterprises pay for governance."

### "Revenue model — how do you actually make money? SDKs being free feels unsustainable."
> "Stripe's client libraries are free. They monetize the payment API. We do the same. Free SDK brings in developers. Hosted control plane — vault custody, team policies, settlement fees, enterprise governance — is where we charge. Starter is free, Builder is $39/month, Team is $149/month, Enterprise is custom. Plus $0.001 per transaction after 1,000 free settlements per month. At 100 paying Builder workspaces we cover infrastructure. At 50 Team workspaces we're profitable on ops."
