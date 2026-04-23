---
name: AlgoPay product scope
overview: Polyglot monorepo — Python (`algopay-sdk`) and TypeScript (`@algodev-studio/algopay`) SDKs for Algorand agent payments, plus a hosted Next.js control plane (`apps/console`). Roadmap toward full **agent payment platform** capabilities (wrapped API gateway, checkout, approvals UI) without tying docs to any single competitor.
todos: []
---

# AlgoPay product scope (internal)

## In scope today

- **SDKs:** USDC (ASA), x402 clients, guards, ledger, intents; console vault + `POST /api/agent/pay`.
- **Docs:** MkDocs under `docs/`; capability matrix: [PLATFORM_FEATURE_MATRIX.md](../../docs/PLATFORM_FEATURE_MATRIX.md).

## Roadmap (high level)

1. Approvals inbox UI; orders model; overview QR / fund / send.
2. Wrapped API gateway + catalog; checkout sessions + webhooks.
3. On-chain policy (AlgoKit) where escrow / router contracts are required.

## Out of scope (unless product expands)

- Paid “deploy my container” verticals; human task marketplaces; card issuance — partner or separate products.

## Custody

- **Default console:** server-encrypted mnemonics (`ALGOPAY_VAULT_MASTER_KEY`); KMS/HSM for production.
- **Optional:** client-held keys + export flow for true self-custody.
