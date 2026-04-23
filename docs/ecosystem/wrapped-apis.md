# Wrapped API gateway strategy

**Wrapped APIs** (industry pattern) are a **hosted proxy**: catalog discovery, per-call pricing, reserve → upstream call → charge or refund, provider toggles, and optional **cross-chain machine-payable** flows (402-style on other networks).

## Recommended phases for AlgoPay

1. **Algorand-first** — Expose your catalog via **x402** with Algorand settlement so agents using `x402-avm` clients can pay without a central proxy wallet.
2. **Proxy gateway** — `POST /gateway/:provider/:endpoint` with Bearer workspace key; server enforces allowance, calls upstream with stored secrets, bills USDC to treasury (same pattern as major agent-payment platforms’ wrapped catalogs).
3. **External catalogs** — Optional bridge to third-party MPP/x402 endpoints where settlement is acceptable for your risk model.

No gateway service ships in this repository yet; the dashboard is the control plane for keys and policies that a future gateway would reuse.
