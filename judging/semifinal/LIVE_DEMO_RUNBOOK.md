# Live demo runbook — semifinal (3 min presentation + backup)

Rehearse this path until it takes **under 90 seconds**. Record a 30s backup video before judging day.

---

## Path A — Hosted console (primary)

**Prerequisites:** Account on https://algopay-sdk-pay.vercel.app/ with a funded TestNet wallet and USDC.

### Steps (narrate while clicking)

1. **Login** → Dashboard overview
2. **Wallets** → show agent wallet address + USDC balance
3. **Policies** → point out daily cap / max single tx / justification toggle
4. **Trigger policy block** (choose one):
   - Set `maxSingleTxUsdc` below next payment amount, OR
   - Exhaust daily budget with a small test payment first
5. **API / agent pay** → show successful pay within policy (curl or dashboard if available)
6. **Transactions / ledger** → show blocked attempt + successful row with timestamp and amount

### Narration script

> "This is our hosted control plane. The agent wallet has a daily budget. Watch — when I try to pay over the cap, the policy blocks it before anything hits chain. When I pay within policy, it lands in the ledger immediately with amount, recipient, and timestamp. Same guards exist in the open-source SDK for developers who self-host."

### Curl backup (API key)

```bash
curl -s -X POST "https://algopay-sdk-pay.vercel.app/api/agent/pay" \
  -H "Authorization: Bearer sk_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"walletId\":\"WALLET_ID\",\"to\":\"ALGORAND_ADDRESS\",\"amountUsdc\":\"0.01\",\"justification\":\"semifinal demo\"}"
```

---

## Path B — Jupyter notebook demo (technical table, recommended)

**Prerequisites:** Python 3.10+, `pip install -e "./python[dev]" jupyter pandas` from repo clone.

```bash
cd python
jupyter notebook examples/community/budgetbot/demo.ipynb
```

Run all cells — shows budget + justification guards and ledger table. No TestNet funds required.

Other notebooks: `research-agent-receipts/demo.ipynb`, `crew-spend-tracker/demo.ipynb`, `slack-approval-gate/demo.ipynb`.

## Path B2 — SDK guard script (terminal fallback)

```bash
cd python
set ALGOPAY_DEMO_MODE=mock
python examples/community/budgetbot/budgetbot.py
```

---

## Path C — x402 client (technical table backup)

```bash
cd python
set ALGOPAY_X402_URL=https://your-x402-resource.example
set ALGOPAY_MAX_USDC=1.0
python examples/x402_client_demo.py
```

Requires funded TestNet wallet + x402-protected URL.

---

## If Wi-Fi or live demo fails

1. Say: *"I have a recording — let me talk through the architecture while it loads."*
2. Show **Slide 2** architecture diagram
3. Open GitHub Actions CI green check
4. Open `python/tests/` file list (24 files)

---

## Pre-demo checklist (day of)

- [ ] Console logged in; session cookie valid
- [ ] Wallet funded (TestNet ALGO + USDC opt-in)
- [ ] Policy configured to show one block + one success
- [ ] Backup screen recording on phone
- [ ] GitHub repo open in second tab
- [ ] `budgetbot.py` tested offline

---

## Rehearsal timer

| Segment | Target |
|---------|--------|
| Console walkthrough | 60–75s |
| SDK or x402 mention | 15s |
| Return to slides | 10s |
