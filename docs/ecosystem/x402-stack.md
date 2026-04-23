# x402 stack alignment (Algorand)

Per [x402 for developers on Algorand](https://algorand.co/agentic-commerce/x402/developers):

- **Python agents** — Use `algopay-sdk` with `x402-avm` (already integrated in `X402Adapter`).
- **TypeScript agents** — Use `@algodev-studio/algopay` for **direct ASA transfer** today; wire **@x402-avm** fetch client for full x402 parity in a follow-up.
- **Servers** — Prefer official middleware packages (Express, Hono, Next, FastAPI) + **scheme_exact_algo** + facilitator from the Algorand guide.

The hosted app does **not** implement a resource server or facilitator; it implements **custodial signing** for simple USDC transfers via Algod.
