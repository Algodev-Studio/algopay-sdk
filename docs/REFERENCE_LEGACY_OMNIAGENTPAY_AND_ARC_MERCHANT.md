# Legacy reference: OmniAgentPay & arc-merchant

The folders **`omniagentpay-main`** (Circle + EVM x402) and **`arc-merchant-main`** (Next.js merchant + Circle) were removed from this repository after porting the agent-payment SDK to Algorand as **AlgoPay**. This note preserves what they were useful for and what to re-derive elsewhere.

## OmniAgentPay (Python, Circle)

**Role:** Reference implementation for wallet sets, Circle WaaS, x402 client, CCTP `GatewayAdapter`, webhooks, guards, ledger, intents, batch pay.

**Already ported into AlgoPay (conceptual mapping):**

- `WalletService` → Algorand keygen + `WalletRepository` + ASA transfers / opt-in
- `TransferAdapter` → direct USDC **axfer** (no ERC-20 approve)
- `X402Adapter` → `x402-avm` + **scheme_exact_algo** (`paymentGroup`, `paymentIndex`)
- Guards, ledger, intents, payment router, batch → same patterns, Algorand indexer for sync

**Not ported (by design):**

- **Circle API** (`CIRCLE_API_KEY`, `ENTITY_SECRET`, `circle_client.py`)
- **CCTP / GatewayAdapter** (`gateway.py`, `cctp_constants.py`, gasless Circle gateway)
- **Webhooks** (`webhooks/parser.py`) — Algorand uses indexer subscriptions / custom webhooks in the merchant app
- **EVM networks** in `core/types.py`

**Useful if you re-open a clone of OmniAgentPay:**

- **Tests:** Broader coverage (guards, ledger, client, CCTP) — can inspire additional AlgoPay tests
- **Examples:** `using_guards.py`, `ledger_tracking.py`, `gemini_agent.py`, x402 server demos (EVM-specific)
- **Docs:** `docs/SDK_USAGE_GUIDE.md`, `OMNIAGENTPAY_VISION.md`

**Env names (historical):** `OMNIAGENTPAY_*`, `CIRCLE_API_KEY`, `ENTITY_SECRET` — see AlgoPay `docs/ENVIRONMENT.md` for Algorand equivalents.

## arc-merchant (TypeScript, Next.js)

**Role:** Merchant dashboard, stats API, **resource server** routes (402), facilitator integration, AI tool adapters (Vercel, Google, MCP), **Circle** wallet helpers.

**Belongs in the separate Algorand merchant app (not the SDK):**

- x402 **resource server** middleware (compare `@x402-avm/express` / Next patterns on [Algorand x402 developers](https://algorand.co/agentic-commerce/x402/developers))
- **Facilitator** verify/settle (see `servers/facilitator.ts` ideas → self-hosted or managed facilitator)
- Dashboard, article paywall, stats persistence
- `circle-wallet.ts` → replace with Algorand signing / merchant receive address

**Useful if you re-open a clone:**

- End-to-end **HTTP 402** shape and retry headers as consumed by a browser/agent
- How **tools** wrap pay flows for Vercel AI / MCP (patterns, not Circle APIs)
- `lib/x402.ts` — high-level client/server expectations (adapt to `@x402-avm/*` + Algorand)

## Synergy: SDK vs merchant

| Concern | AlgoPay SDK | Merchant / facilitator app |
| ------- | ----------- | --------------------------- |
| Agent wallet, sign, pay URL | Yes | No |
| Protect APIs with 402 | No | Yes |
| Verify `paymentGroup`, submit to chain | No | Yes (facilitator) |
| Dashboard, webhooks, stats | No | Yes (indexer-driven) |

## Official Algorand resources

- [x402 scheme (Algorand)](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_algo.md)
- [x402 for developers](https://algorand.co/agentic-commerce/x402/developers)
- [AlgoBharat Developer Hub](https://algobharat.in/devportal/)
- [Algorand Python (Puya)](https://algorandfoundation.github.io/puya/) — smart contracts; SDK uses `py-algorand-sdk` for off-chain transactions
