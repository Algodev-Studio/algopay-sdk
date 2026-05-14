# x402 stack alignment (Algorand)

Per [x402 for developers on Algorand](https://algorand.co/agentic-commerce/x402/developers):

- **Python agents** — Use **`algopay-sdk`** with **`x402-avm`** (integrated in `X402Adapter`; see [x402 HTTP payments](../guides/x402.md)).
- **TypeScript agents** — Use **`@algodev-studio/algopay`** (`typescript/`): **`pay()`** routes **direct USDC transfer** (Algorand address) and **x402** (HTTPS recipient) via **`@x402-avm/fetch`**, **`@x402-avm/avm`**, **`@x402-avm/core`** — aligned with the Python router.
- **Servers** — Prefer official middleware packages (Express, Hono, Next, FastAPI) + **scheme_exact_algo** + facilitator from the Algorand guide.

The **hosted dashboard** (`pay/`) does **not** implement a resource server or facilitator; it implements **vault-backed signing** for **USDC transfers** via Algod on **`POST /api/agent/pay`** (see [Control plane](CONTROL_PLANE.md)).
