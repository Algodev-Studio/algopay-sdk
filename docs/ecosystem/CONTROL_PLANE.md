# Control plane (hosted Next.js console)

The Next.js app under **`apps/console`** (npm workspace **`algopay-console`**) is the **hosted control plane**: users, workspaces, encrypted wallet keys (vault), API keys, and server-side signing on `POST /api/agent/pay`.

## Environment

See `apps/console/.env.example`. Required:

- `DATABASE_URL` — SQLite file for local dev; use Postgres in production.
- `SESSION_SECRET` — min 32 chars for JWT session cookies.
- `ALGOPAY_VAULT_MASTER_KEY` — base64-encoded **32-byte** key (generate with `openssl rand -base64 32`). **Rotate via KMS/HSM** in production; never commit real keys.

Optional:

- `REDIS_URL` — not required for the scaffold. Use the same Redis URL as Python `ALGOPAY_STORAGE_BACKEND=redis` when you want **shared guard counters** between agents using the Python SDK and policies enforced in the dashboard (future integration).

## Agent pay flow

1. Dashboard creates a wallet (mnemonic encrypted with vault).
2. User creates API key; agent sends `Authorization: Bearer sk_live_…`.
3. API validates workspace policy (`requireJustification`, `maxSingleTxUsdc`, allowlist), decrypts mnemonic in memory, submits USDC axfer via Algod.

## Security notes

- Treat API keys like passwords; store only SHA-256 hashes.
- Replace static `ALGOPAY_VAULT_MASTER_KEY` with a cloud KMS envelope encryption pattern for Option 2 parity with HSM-backed permissioned keys.
