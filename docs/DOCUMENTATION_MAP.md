# Documentation map (humans & LLMs)

**Purpose:** One place to learn **where truth lives** in this repo, **which file to open** for a task, and **how docs are organized**. Paths are **relative to the repository root** unless noted.

---

## How to use this page

| Reader | Suggested use |
| ------ | ------------- |
| **Human** | Skim [Repository surface](#repository-surface), then the [Task routing](#task-routing) table. Use [MkDocs nav](#mkdocs-site-nav) for the published site. |
| **LLM / agent** | Load this file + [`REPOSITORY_LAYOUT.md`](../REPOSITORY_LAYOUT.md) + root [`AGENTS.md`](../AGENTS.md) before inferring layout. Prefer **paths from repo root** in answers (e.g. `src/algopay/client.py`, `packages/algopay/src/client.ts`). Do not assume `apps/web`; the console is **`apps/console`**. |

---

## Repository surface

| Layer | Path | Name on registry | Notes |
| ----- | ---- | ---------------- | ----- |
| Python SDK | `src/algopay/` | PyPI **`algopay-sdk`**, import **`algopay`** | Primary SDK; `AlgoPay`, guards, ledger, x402 via `x402-avm`. |
| Python tests | `tests/` | — | `pytest`; integration tests may need env (see [Testing roadmap](TESTING_ROADMAP.md)). |
| Python config | `pyproject.toml` | — | Version, dependencies, optional `[docs]` / `[dev]` extras. |
| TypeScript SDK | `packages/algopay/` | npm **`@algodev-studio/algopay`** | Wallets, USDC transfer, **`pay()`** with x402 via `@x402-avm/*`. README: `packages/algopay/README.md`. |
| Hosted console | `apps/console/` | workspace **`algopay-console`** | Next.js control plane: auth, vault, API keys, policies, `POST /api/agent/pay`. Env: `apps/console/.env.example`. |
| User & ecosystem docs | `docs/` | MkDocs site | Built with `mkdocs`; entry `docs/index.md`. |
| CI | `.github/workflows/` | — | e.g. `ci.yml` for Python + JS builds. |

**Monorepo npm:** Root `package.json` workspaces: `packages/*`, `apps/*`. Commands: `npm run build` (TS SDK + console), `npm run dev` (console).

---

## Task routing

| Goal | Start here | Related |
| ---- | ---------- | ------- |
| Install & first Python `pay()` | [Getting started](getting-started.md) | [Payments](guides/payments.md), [ENVIRONMENT](ENVIRONMENT.md) |
| x402 HTTP 402 flows (Python) | [x402 guide](guides/x402.md) | [x402 stack](ecosystem/x402-stack.md), `examples/x402_client_demo.py` |
| Guards, budgets, confirmations | [Guards](guides/guards.md) | [API — types](reference/api.md) |
| TypeScript agent client | `packages/algopay/README.md` | Same `pay()` semantics; uses `@x402-avm/fetch` for HTTPS recipients |
| Hosted dashboard / vault / API keys | [Control plane](ecosystem/CONTROL_PLANE.md) | [Platform feature matrix](PLATFORM_FEATURE_MATRIX.md), `apps/console/` |
| Product capabilities vs typical agent-payment platforms | [PLATFORM_FEATURE_MATRIX.md](PLATFORM_FEATURE_MATRIX.md) | — |
| All env vars (Python SDK) | [ENVIRONMENT.md](ENVIRONMENT.md) | Console vars documented in Control plane + `.env.example` |
| Release Python / TypeScript SDKs | [PUBLISHING.md](PUBLISHING.md) | `pyproject.toml`, `packages/algopay/package.json`, `.github/workflows/publish.yml` |
| Test strategy & CI scope | [TESTING_ROADMAP.md](TESTING_ROADMAP.md) | — |
| Repo layout rationale | [`REPOSITORY_LAYOUT.md`](../REPOSITORY_LAYOUT.md) (repo root) | This file |

---

## MkDocs site nav

The published site follows `mkdocs.yml` (root). Sections:

- **Home** → `index.md`
- **Getting started** → `getting-started.md`
- **User guide** → `guides/*.md`
- **Reference** → `reference/api.md`, `ENVIRONMENT.md`
- **Ecosystem** → `ecosystem/*.md`, `PLATFORM_FEATURE_MATRIX.md`
- **Project** → `PUBLISHING.md`, `TESTING_ROADMAP.md`, legacy reference doc

**Local build:** `pip install -e ".[docs]"` then `mkdocs serve` (from repo root).

---

## Naming conventions (avoid drift)

| Concept | Correct | Common mistake |
| ------- | ------- | -------------- |
| Python distribution | `algopay-sdk` | Calling the PyPI package `algopay` |
| Python import | `import algopay` | — |
| npm package | `@algodev-studio/algopay` | — |
| Folder for TS SDK | `packages/algopay/` | Assuming `packages/sdk-typescript` (rename optional; see `REPOSITORY_LAYOUT.md`) |
| Next.js app | `apps/console/` | `apps/web` (removed; use **console**) |
| npm workspace name | `algopay-console` | `algopay-web` |

---

## Source-of-truth hierarchy

1. **Runtime behavior:** `src/algopay/` (Python), `packages/algopay/src/` (TypeScript), `apps/console/src/` (UI/API routes).
2. **Shipping versions:** `pyproject.toml`, `packages/algopay/package.json`.
3. **Narrative docs:** `docs/` + root `README.md`.
4. **Plans under `.cursor/plans/`:** Historical design notes; verify against code if something conflicts.

When docs and code disagree, **treat code as authoritative** and file an issue or update the doc.

---

## LLM-oriented file picks (copy-paste checklist)

```
README.md                          # Project overview, install, monorepo commands
AGENTS.md                          # Short orientation for coding agents / LLMs
REPOSITORY_LAYOUT.md               # Directory tree and workspace names
docs/DOCUMENTATION_MAP.md          # This navigation hub
docs/getting-started.md            # Python quick path
docs/ENVIRONMENT.md                # ALGOPAY_* variables
docs/guides/payments.md            # pay() routing
docs/guides/x402.md                # x402 client usage
docs/ecosystem/CONTROL_PLANE.md   # Console + agent pay
docs/PLATFORM_FEATURE_MATRIX.md   # Capabilities & roadmap (neutral)
docs/PUBLISHING.md                # PyPI + npm + release checklist
packages/algopay/README.md         # TypeScript API surface
apps/console/.env.example          # Console secrets template
```

---

## Changelog for doc maintainers

When you add a route, env var, or workspace:

1. Update the **implementation** (code).
2. Update **ENVIRONMENT.md** or **CONTROL_PLANE.md** / `.env.example` as appropriate.
3. Add a row to **Task routing** or **Repository surface** here if it is a new top-level concern.
4. Bump **MkDocs nav** in `mkdocs.yml` if the doc is user-facing.
