# AlgoPay — judge one-pager (print or PDF)

## Problem

AI agent builders face uncontrolled autonomous spending with no audit trail — one runaway loop can drain a wallet in minutes.

## Solution

**AlgoPay** — governed agent payments on Algorand: guards before spend, ledger after.

| Layer | What |
|-------|------|
| OSS SDK | Python (`algopay-sdk`) + TypeScript (`@algodev-studio/algopay`) |
| Hosted console | Vault, API keys, policies, ledger — algopay-sdk-pay.vercel.app |

## Why Algorand

Fast finality · sub-cent fees · USDC ASA · x402-avm stack

## Traction (alpha)

- PyPI + npm published · CI green · 109 pytest tests · ~74% coverage
- 5 community reference integrations under `examples/community/`
- Design partner feedback: see semifinal slide 5

## Revenue (planned)

Free SDK · Paid hosted tiers ($0 / $39 / $149 / Enterprise) · $0.001/tx settlement after 1K free/mo

Details: [docs/ecosystem/MONETIZATION.md](../../docs/ecosystem/MONETIZATION.md)

## First 100 users

30 Algorand · 25 agent Discords · 20 indie dev · 15 university · 10 ecosystem listings

## Honest gaps

TS tests thin · hosted API USDC-only (x402 client in SDK) · facilitator/checkout planned

## Links

- https://github.com/Algodev-Studio/algopay-sdk
- https://algopay-sdk-pay.vercel.app/
- https://dorahacks.io/buidl/42990
