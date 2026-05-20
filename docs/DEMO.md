# AlgoPay live demo guide

Use this document as your **talk track** and **runbook** for demos (recordings, investors, workshops).

| Format | Resource |
| ------ | -------- |
| **5-minute voiceover script** | [DEMO_SCRIPT_5MIN.md](DEMO_SCRIPT_5MIN.md) — what to say, timed for SDK + console |
| **Google Colab (SDK voiceover)** | [`notebooks/AlgoPay_SDK_Demo.ipynb`](../notebooks/AlgoPay_SDK_Demo.ipynb) — `pip install "algopay-sdk==0.1.0a3"` ([PyPI](https://pypi.org/project/algopay-sdk/); **do not use 0.1.0a2**) |
| **Local terminal (explorer link)** | [`python/scripts/live_demo_tx.py`](../python/scripts/live_demo_tx.py) |
| **Hosted console (UI only)** | [Console showcase](#console-showcase-ui-only--no-on-chain-tx) below |

---

## What to show (priority order)

Focus on capabilities that are **shipped** and **visually verifiable** on testnet. Skip stubs (orders, approvals inbox UI, wrapped API gateway).

| Priority | Feature | Why show it | How |
| -------- | ------- | ------------- | --- |
| **1** | **Agent wallet on Algorand** | Establishes “this is real chain custody” | Generate address, show balance, copy address |
| **2** | **USDC transfer (`pay` → address)** | Core value: agents pay in stablecoin | Self-transfer 0.01–0.02 USDC; open explorer link |
| **3** | **x402 pay-per-call (`pay` → URL)** | Differentiator vs “just a wallet” | Pay `https://x402.goplausible.xyz/examples/weather`; show `resource_data` |
| **4** | **Guards block a payment** | Trust / policy story | Whitelist guard → pay to random address → `BLOCKED` |
| **5** | **Ledger + `sync_transaction`** | Audit trail for agents | Show ledger row after pay; sync from Indexer |
| **6** | **`simulate` / `can_pay`** | Safe agent loops | Simulate before spend; no chain tx |
| **7** | **Payment intent** (optional) | Authorize → capture pattern | `create_payment_intent` → `confirm_payment_intent` |
| **8** | **Hosted console** (UI showcase) | Teams, API keys, vault wallets — **no chain tx required** | See [Console showcase](#console-showcase-ui-only--no-on-chain-tx) below |

**Do not spend time on:** mainnet unless you have production keys, **Gas pool “Top Up”** (marked coming soon), deep **Checkout** flows unless you already have merchants/sessions.

**SDK vs console in one recording:** Do the **terminal / testnet block first** (real explorer link), then switch to the **dashboard** for “how operators manage agents” — no second funding step needed for the UI part.

---

## Prep checklist (do this before the demo)

1. **Install SDK (from repo root)**

   ```bash
   pip install -e "./python[dev]"
   ```

2. **Create a persistent demo wallet** (secrets go to `local/`, gitignored):

   ```bash
   python python/scripts/generate_live_demo_wallet.py
   ```

3. **Fund testnet ALGO** (fees + opt-in):
   - Open [TestNet dispenser](https://bank.testnet.algorand.network/) and paste the printed address, **or**
   - Use the AWS faucet (same as console): `POST https://dispenser.testnet.aws.algodev.network/faucet?account=<ADDRESS>`

4. **Opt in to testnet USDC** (one-time per wallet):

   ```bash
   set OPT_IN_USDC=1
   python python/scripts/live_demo_tx.py
   ```

   (On Unix: `OPT_IN_USDC=1 python python/scripts/live_demo_tx.py`.)

5. **Acquire testnet USDC** on that address (ASA ID `10458941` — printed by the generate script). Use your org’s tap or a documented testnet USDC faucet. You need roughly **0.05 USDC** for a safe demo (transfer + x402).

6. **Dry run** (must print `Explorer:` with a real tx id):

   ```bash
   python python/scripts/live_demo_tx.py
   ```

7. **Console (UI segment)** — see [Console prep](#console-prep-before-the-ui-segment) if you are showing the dashboard.

---

## Console prep (before the UI segment)

From the **repository root**:

```bash
npm install
cp pay/.env.example pay/.env
```

Edit `pay/.env`:

| Variable | How to set |
| -------- | ---------- |
| `DATABASE_URL` | SQLite for local demo: `file:./dev.db` (or use your Postgres URLs from the example) |
| `SESSION_SECRET` | Any random string **≥ 32 characters** |
| `ALGOPAY_VAULT_MASTER_KEY` | `openssl rand -base64 32` (PowerShell: `[Convert]::ToBase64String((1..32|%{Get-Random -Max 256})))` |

Then:

```bash
npm run db:push --workspace=algopay-console
npm run dev
```

Open **http://localhost:3000/register**, create a demo account (e.g. `demo@yourcompany.test` — use a password you will reuse). You stay logged in for the recording.

**Optional seed data (makes Overview / Agents prettier, still no on-chain tx):**

1. **Gas Pools → Create** — e.g. balance `100` USDC, daily cap `100000` cents, alert `10` USDC.
2. Copy a **pool id** from the Gas Pools list (you need it for Create Agent).

---

## Console showcase (UI only — no on-chain tx)

**Goal:** Show the **hosted control plane** — workspace, policies, API keys, vault wallets, x402 endpoint catalog, and API playground. **Do not** submit agent pays or fund wallets on-chain during this segment unless you want to.

**Length:** ~5–6 minutes.

### What to show vs skip

| Show | Route | Why |
| ---- | ----- | --- |
| **API key for agents** | `/dashboard/settings` | Clear “agent authenticates with Bearer token” story |
| **Workspace spending caps** | `/dashboard/settings` (Spending Policies) | Mirrors SDK guards at workspace level |
| **Vault wallets** | `/dashboard/wallets` | Create set + wallet; show Algorand address (encrypted server-side) |
| **Register x402 API** | `/dashboard/apis` | Add custom paid endpoint; toggle catalog providers |
| **Agent registry** | `/dashboard/agents` + `/dashboard/agents/create` | Name, address, daily limit, gas pool |
| **Gas pool** | `/dashboard/gas/create` | Fee/subsidy pool for agent spends (UI only) |
| **API playground** | `/dashboard/playground` | Run **List Agents** (GET) — proves REST without paying |
| **Overview** | `/dashboard` | KPI cards + recent payments table (fine if empty) |

| Skip or one glance only | Route | Why |
| ----------------------- | ----- | --- |
| Approvals | `/dashboard/approvals` | Only interesting if you have **pending** payments |
| Payments “Settle” | `/dashboard/payments` | Implies real settlement — skip in UI-only demo |
| Checkout sessions | `/dashboard/checkout` | Longer commerce flow; mention as roadmap |
| Gas **Top Up** button | `/dashboard/gas` | UI says “coming soon” |
| Connect Pera wallet in header | Shell | Optional; not required for vault demo |

### Step-by-step walkthrough

**Transition from SDK (15 s)**

> “Agents can embed the SDK in-process. Teams that want a vault, API keys, and a dashboard use the AlgoPay console — same policies, server-assisted signing when you call the agent pay API.”

| Step | Where | Action | Say |
| ---- | ----- | ------ | --- |
| 1 | `/login` or already in app | Log in as demo user | “Each workspace is isolated — testnet by default.” |
| 2 | `/dashboard` | Point at KPI row + payments table | “Overview is volume and settlement health for the workspace.” |
| 3 | `/dashboard/settings` | **API Keys:** name `Demo Agent Key` → **Generate** → show full key once → Copy | “The agent uses this once — we only store a hash. This is how your bot calls `POST /api/agent/pay` without holding mnemonics in your repo.” |
| 4 | `/dashboard/settings` | **Spending Policies:** set e.g. max daily `100`, max single tx `25`, approval `50` → Save | “Workspace-level caps align with SDK budget and confirm guards.” |
| 5 | `/dashboard/wallets` | Create set `demo-agents` → Create wallet in that set | “Keys are created in the vault — address appears immediately; funding is a separate ops step.” |
| 6 | `/dashboard/gas/create` | Pool: balance `100`, daily cap `100000`, alert `10` | “Gas pools budget ALGO/USDC spend for agents.” |
| 7 | `/dashboard/agents/create` | Name `Purchase Bot`, paste any valid 58-char test address (or your SDK demo address), daily limit `50000`, select pool → Create | “Agents are registered spenders tied to a pool and daily USD cap.” |
| 8 | `/dashboard/apis` | **Add Custom x402 Endpoint** — see sample values below → **Validate & Add** | “Catalog of paid HTTP APIs your agents can call via the console proxy slug.” |
| 9 | `/dashboard/apis` | Toggle a **wrapped provider** on/off (if listed) | “Curated providers can be enabled per workspace.” |
| 10 | `/dashboard/playground` | **Agents → List Agents** → Run | “Operators and integrators can probe APIs without leaving the browser.” |
| 11 | `/dashboard/transactions` | Quick scroll | “Activity feed ties back to payments and settlement state.” |

**Sample values for “Add Custom x402 Endpoint” (no payment required to save):**

| Field | Value |
| ----- | ----- |
| Endpoint URL | `https://x402.goplausible.xyz/examples/weather` |
| Slug | `demo-weather` |
| Name | `Demo Weather API` |
| Description | `x402 weather example for AlgoPay demo` |
| HTTP Method | `GET` |

After save, point at the hint: agents can call `POST /api/x402/demo-weather` (slug from your form).

### Console talk track (short)

> “Settings is where security starts — API keys and workspace-wide USDC limits. Wallets are server-vaulted Algorand identities for agents that should not hold mnemonics in your codebase. APIs is where you register x402 endpoints so agents pay per call through your workspace. Agents and gas pools are how you attach spend limits and subsidy pools. Playground is for trying the REST surface without wiring curl.”

### Console troubleshooting

| Symptom | Fix |
| ------- | --- |
| Registration fails | Check `SESSION_SECRET` length and `DATABASE_URL`; run `db:push` again |
| Generate API key errors | Ensure logged in; refresh session |
| Create agent fails “pool” | Create a gas pool first and select it in the form |
| Wallets balance `0` | Expected without funding — say “balance reads chain; funding is ops” |
| Custom endpoint validation error | Use a reachable `https://` URL; check slug is unique |

---

## Suggested flow (~17 minutes: SDK + console)

### 0. Hook (30 s)

> “AI agents need to pay APIs and other agents autonomously, but operators need limits and an audit trail. AlgoPay is payment infrastructure on Algorand: local agent wallets, USDC, spending guards, and HTTP 402 x402 pay-per-call — in Python or TypeScript.”

### 1. Architecture (60 s)

Show the README diagram or say:

- **`pay()`** runs **guards** → writes **ledger** → routes recipient:
  - 58-char address → **USDC asset transfer**
  - `https://` URL → **x402** discovery + payment
- Keys live in-process unless you use the **hosted console** vault.

### 2. Live SDK — wallet + balance (90 s)

**Terminal:** run generate (if not done) or restore:

```bash
python python/scripts/live_demo_tx.py --check-only
```

**Say:**

> “We create a wallet set and wallet — this is the agent’s Algorand identity. Balance is USDC on the testnet ASA, not ALGO.”

**Show:** address, USDC balance, Algod connectivity.

### 3. Live SDK — on-chain USDC transfer (2 min) — **must-have**

```bash
python python/scripts/live_demo_tx.py
```

**Say:**

> “`pay()` with an Algorand address sends USDC. We use a tiny self-transfer so the receiver is already opted in. Guards can be on or off; for the first tx we skip guards to keep the demo predictable.”

**Show on screen:**

- `success: True`
- `blockchain_tx: <TXID>`
- **`Explorer: https://testnet.explorer.perawallet.app/tx/<TXID>`** ← bookmark this tab before the call

### 4. x402 pay-per-call (2 min) — **strong second act**

```bash
set ALGOPAY_X402_URL=https://x402.goplausible.xyz/examples/weather
python python/scripts/live_demo_tx.py --x402-only
```

**Say:**

> “The same `pay()` API accepts an HTTPS URL. The SDK runs x402: the server returns 402, we pay in USDC, then we get the resource — weather JSON here.”

**Show:** `resource_data` snippet; second explorer link if x402 returns `blockchain_tx`.

### 5. Guards (90 s) — optional but high impact

```bash
python python/scripts/live_demo_exhaustive.py
```

Or narrate from code: `add_recipient_guard` whitelist → pay to non-listed address → status **`BLOCKED`**, ledger records it.

**Say:**

> “Budget caps, per-tx limits, allowlists, rate limits, human confirm, and required justification — all run before we hit the chain.”

### 6. Console showcase (5–6 min) — UI only

Follow [Console showcase](#console-showcase-ui-only--no-on-chain-tx). **Highlight:** Settings → API key, Wallets, APIs → add endpoint, Agents, Playground list.

### 7. Close (30 s)

> “Same surface in TypeScript on npm, Python on PyPI, optional hosted control plane. Testnet links prove settlement on Algorand; production is mainnet with the same APIs.”

---

## Demo script (verbatim lines you can read)

**Opening**

> “I’ll show an AI agent wallet on Algorand testnet, a real USDC transfer you can verify on-chain, and an x402 payment to an HTTP API — all through one `pay()` method with spending policies behind it.”

**Wallet**

> “This address is the agent. Fund it with testnet ALGO for fees and testnet USDC for spend. The SDK tracks USDC balance via the ASA AlgoPay configures for testnet.”

**Transfer**

> “I’m calling `pay(wallet_id, address, amount)`. Under the hood that’s an Algorand asset transfer for USDC. Here’s the transaction on Pera’s testnet explorer.”

**x402**

> “For machine-to-machine APIs, the recipient string can be a URL. AlgoPay implements the Algorand x402 ‘exact’ scheme: discover, pay, retry the request. The agent gets the paid resource in `resource_data`.”

**Guards**

> “Before any of that, guards enforce policy — for example only whitelisted recipients or a daily USDC budget. Failed policy shows up as blocked in the ledger, not as a failed on-chain tx.”

**Closing**

> “You get auditability from the ledger, safety from guards, and one client in your agent process — or the hosted console if you want team policies and API keys without embedding keys in the agent.”

**Console — API key**

> “This key is what your agent sends on every server-side pay request. We show it once; after that you only see the prefix in the list.”

**Console — x402 API**

> “You register paid HTTP endpoints here so the workspace knows which x402 resources agents are allowed to hit — same pay-per-call model as the SDK, managed from the UI.”

---

## Commands quick reference

| Goal | Command |
| ---- | ------- |
| Create demo wallet | `python python/scripts/generate_live_demo_wallet.py` |
| **One guaranteed explorer link (USDC transfer)** | `python python/scripts/live_demo_tx.py` |
| x402 only (after wallet funded) | `python python/scripts/live_demo_tx.py --x402-only` |
| Balance / chain check only | `python python/scripts/live_demo_tx.py --check-only` |
| Full SDK tour | `python python/scripts/live_demo_exhaustive.py` |
| Skip x402 in tour | `set LIVE_SKIP_X402=1` then exhaustive script |
| Start console locally | `npm run dev` (after `db:push` and `pay/.env`) |
| Console register | http://localhost:3000/register |

**Explorer base URL (testnet):** `https://testnet.explorer.perawallet.app/tx/<TXID>`

---

## Troubleshooting during a live demo

| Symptom | Fix |
| ------- | --- |
| `Missing local/live_demo_wallet.json` | Run `generate_live_demo_wallet.py` |
| `insufficient balance` / pay fails | Fund USDC; run opt-in (`OPT_IN_USDC=1`) |
| Opt-in fails | Fund ALGO first (dispenser) |
| x402 fails, transfer works | Set `SKIP_X402=1` on smoke script or use `--transfer-only` on `live_demo_tx.py` |
| Slow confirmation | Script uses `wait_for_completion=True` with 180s timeout; mention testnet block times |

---

## Recording tips

- **Two-act structure:** Terminal first (explorer link), then browser tab on `localhost:3000/dashboard` (pre-logged-in).
- Zoom terminal to 18–20pt; open explorer link in browser **before** saying “on-chain”.
- Pre-copy wallet address to clipboard for dispenser.
- Run `live_demo_tx.py` once off-camera; keep the explorer tab from the dry run as fallback if live network is slow.
- For console: pre-create API key is **not** possible (shown once) — either blur the key in post or generate a throwaway key live.
- Widen browser to ~1280px so the sidebar (Overview, Agents, APIs, Settings) is visible in one frame.
