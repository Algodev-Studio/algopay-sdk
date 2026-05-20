# AlgoPay — 5-minute demo voiceover script

**Total time:** ~5:00  
**Format:** Colab notebook (SDK) → browser tab (console)  
**Prep:** Colab notebook run through install + wallet cells; console logged in at `localhost:3000/dashboard`; optional: one testnet tx pre-run so explorer link is ready.

---

## [0:00–0:25] Opening — both tabs ready, Colab visible

> Hi — quick tour of **AlgoPay**: payment infrastructure for **AI agents on Algorand**.
>
> Agents need to pay in **USDC**, call **paid HTTP APIs** with **x402**, and stay inside **spending policies** — with an audit trail.
>
> You get two things: the **SDK** in your agent process — Python on PyPI as `algopay-sdk` — and an optional **console** for teams that want vaults, API keys, and a dashboard.
>
> I’ll show the SDK first in Colab, then the console.

---

## [0:25–2:35] SDK (Google Colab) — `notebooks/AlgoPay_SDK_Demo.ipynb`

### [0:25–0:45] Install + client

**On screen:** Run the install cell, then “Initialize client.”

> We install from PyPI — `algopay-sdk` — and import `AlgoPay`.
>
> Out of the box we’re on **Algorand testnet**, with public Algod and Indexer endpoints. No API keys needed just to talk to the chain.

---

### [0:45–1:05] Wallet

**On screen:** Create wallet set + wallet; point at the address.

> Every agent gets a **wallet set** and a **wallet** — a real Algorand address and keypair in this runtime.
>
> In production you’d fund this address with testnet **ALGO** for fees and **USDC** for spend. The SDK tracks **USDC balance** on the testnet ASA.

---

### [1:05–1:25] Routing

**On screen:** `can_pay` / `detect_method` cell.

> One method — **`pay()`** — and the **recipient string** decides what happens.
>
> A **58-character address** → USDC transfer. An **HTTPS URL** → **x402** pay-per-call. No separate “mode” flag.

---

### [1:25–1:50] Guards (no chain spend)

**On screen:** Guards cell — blocked payment, `BLOCKED` status.

> Before any chain transaction, **guards** run — here a **recipient allowlist**.
>
> I try to pay an address that isn’t allowed. The payment is **blocked** in the SDK — status **BLOCKED** — not a failed on-chain tx. That’s how you enforce policy for autonomous agents.

---

### [1:50–2:10] Simulate + ledger (quick)

**On screen:** Simulate cell, then ledger query.

> Agents can **`simulate`** first — guards, balance, routing — without spending.
>
> Every payment attempt also hits an internal **ledger** — pending, completed, failed, or blocked — for audit and debugging.

---

### [2:10–2:35] Live pay (optional — skip if not funded)

**On screen:** Either run live transfer + show explorer URL, **or** say this line without running:

> With a funded wallet, the same **`pay()`** submits a **USDC transfer** on testnet — here’s the transaction on the explorer — and the same API pays an **x402 URL** and returns the **resource**, for example weather JSON from a paid endpoint.

**If you have a tx link ready:** paste or click `https://testnet.explorer.perawallet.app/tx/...` — don’t read the full tx id aloud.

---

## [2:35–2:45] Transition — switch to browser

**On screen:** Alt-tab to console; sidebar visible (Overview, Agents, APIs, Settings).

> For teams that don’t want mnemonics in the agent repo, there’s the **AlgoPay console** — workspace, vault, API keys, and operator policies. Same ideas as the SDK, managed from the UI.

---

## [2:45–4:45] Console — `http://localhost:3000/dashboard`

### [2:45–3:00] Overview (glance)

**On screen:** `/dashboard` — KPI cards.

> This is the **workspace overview** — payment volume and settlement health. Testnet by default.

---

### [3:00–3:35] Settings — API key + policies

**On screen:** `/dashboard/settings` — Generate API key named `Demo Agent Key`; copy once. Then spending policies → Save.

> In **Settings**, operators create an **API key** for the agent. We only show the full key **once**; after that it’s hashed — same idea as production API security.
>
> Your agent calls our **`agent pay`** endpoint with **Bearer** auth — no private key in your codebase if you use server-side signing.
>
> **Spending policies** here mirror SDK guards — max daily USDC, max per transaction, approval threshold — at the **workspace** level.

---

### [3:35–4:00] Wallets

**On screen:** `/dashboard/wallets` — create set `demo-agents`, create one wallet.

> **Wallets** are **vaulted** on the server — we generate the Algorand address here. Funding is a separate ops step; balance reads the chain when you connect it.

---

### [4:00–4:25] APIs (x402 catalog)

**On screen:** `/dashboard/apis` — Add Custom x402 Endpoint (weather URL, slug `demo-weather`) → Validate & Add.

> Under **APIs**, you register **x402 endpoints** your agents are allowed to hit — URL, slug, name. Agents can call through the workspace proxy, for example **`/api/x402/demo-weather`**, instead of hard-coding paid URLs in every agent.

---

### [4:25–4:45] Agents + Playground (quick)

**On screen:** `/dashboard/agents` — show list or one agent row. Then `/dashboard/playground` → **List Agents** → Run.

> **Agents** tie a name, address, daily limit, and **gas pool** to a registered spender.
>
> **Playground** lets you hit the REST API from the browser — here **list agents** — without wiring curl.

**Skip in 5-min cut:** Gas pool create, merchants, checkout, approvals, payments settle.

---

## [4:45–5:00] Close — either tab

> So: **SDK** for agents in your stack — wallets, USDC, guards, x402, ledger — on PyPI as **`algopay-sdk`**. **Console** for operators — keys, policies, vault, and API catalog.
>
> Docs and links are on GitHub and PyPI. Thanks for watching.

---

## Cheat sheet — what to click (no narration)

| Time | Where | Do this |
| ---- | ----- | ------- |
| 0:25 | Colab | Install → Init → Wallet |
| 1:05 | Colab | Routing → Guards → Simulate → Ledger |
| 2:10 | Colab | Live `pay` + explorer *(optional)* |
| 2:45 | Console | Overview → Settings (key + policies) |
| 3:35 | Console | Wallets → APIs (add endpoint) |
| 4:25 | Console | Agents list → Playground List Agents |

---

## If you’re running short on time

Cut in this order:

1. Live testnet + explorer (narrate in one sentence only)  
2. Simulate + ledger (one sentence: “simulate and ledger exist”)  
3. Playground  
4. Overview KPIs  

**Never cut:** wallet + routing + guards (SDK); API key + wallets + APIs (console).

---

## If you’re running long

- Pause less between cells  
- Don’t open Gas Pools, Merchants, or Checkout  
- Don’t read explorer tx ids or API keys aloud — point and say “link in the output”
