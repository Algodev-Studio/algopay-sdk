# Documentation map (humans & LLMs)

**Purpose:** One place to learn **where truth lives** in this repo, **which file to open** for a task, and **how docs are organized**. Paths are **relative to the repository root** unless noted.

---

## How to use this page

| Reader | Suggested use |
| ------ | ------------- |
| **Human** | Skim [Repository surface](#repository-surface), then the [Task routing](#task-routing) table. Use [MkDocs nav](#mkdocs-site-nav) for the published site. |
| **LLM / agent** | Load this file + **[`REPOSITORY_LAYOUT.md`](https://github.com/Algodev-Studio/algopay-sdk/blob/main/REPOSITORY_LAYOUT.md)** + **[`AGENTS.md`](https://github.com/Algodev-Studio/algopay-sdk/blob/main/AGENTS.md)** before inferring layout. Prefer **paths from repo root** (e.g. `python/src/algopay/client.py`, `typescript/src/client.ts`). Dashboard directory is **`pay/`**. |

---

## Repository surface

| Layer | Path | Name on registry | Notes |
| ----- | ---- | ---------------- | ----- |
| Python SDK | `python/src/algopay/` | PyPI **`algopay-sdk`**, import **`algopay`** | `AlgoPay`, guards, ledger, x402 via `x402-avm`. |
| Python tests | `python/tests/` | — | `pytest` run from **`python/`** (see CI). |
| Python examples / scripts | `python/examples/`, `python/scripts/` | — | Demo and helper scripts. |
| Python config | `python/pyproject.toml` | — | Version, dependencies, optional `[docs]` / `[dev]` extras. |
| TypeScript SDK | `typescript/` | npm **`@algodev-studio/algopay`** | **`pay()`** with x402 via `@x402-avm/*`. README: **`typescript/README.md`**. |
| Hosted dashboard | `pay/` | workspace **`algopay-console`** | Next.js: vault, API keys, policies, `POST /api/agent/pay`. Env: **`pay/.env.example`**. |
| User & ecosystem docs | `docs/` | MkDocs site | Entry `docs/index.md`. |

**Monorepo npm:** Root **`package.json`** workspaces: **`typescript`**, **`pay`**. Commands: **`npm run build`**, **`npm run dev`**.

---

## Task routing

| Goal | Start here | Related |
| ---- | ---------- | ------- |
| Install & first Python `pay()` | [Getting started](getting-started.md) | [Payments](guides/payments.md), [ENVIRONMENT](ENVIRONMENT.md) |
| x402 HTTP 402 flows (Python) | [x402 guide](guides/x402.md) | [x402 stack](ecosystem/x402-stack.md), **`python/examples/x402_client_demo.py`** |
| Guards, budgets, confirmations | [Guards](guides/guards.md) | [API — types](reference/api.md) |
| TypeScript agent client | [TypeScript SDK guide](guides/typescript.md) · **`typescript/README.md`** | Full parity with Python `AlgoPay`; `@x402-avm/*` for x402 |
| Hosted dashboard / vault / API keys | [Control plane](ecosystem/CONTROL_PLANE.md) | [Platform feature matrix](PLATFORM_FEATURE_MATRIX.md), **`pay/`** |
| Product capabilities vs typical agent-payment platforms | [PLATFORM_FEATURE_MATRIX.md](PLATFORM_FEATURE_MATRIX.md) | — |
| All env vars (Python SDK) | [ENVIRONMENT.md](ENVIRONMENT.md) | Dashboard vars: Control plane + **`pay/.env.example`** |
| Release Python / TypeScript SDKs | [PUBLISHING.md](PUBLISHING.md) | **`python/pyproject.toml`**, **`typescript/package.json`**, **`.github/workflows/publish.yml`** |
| Test strategy & CI scope | [TESTING_ROADMAP.md](TESTING_ROADMAP.md) | — |
| Repo layout rationale | **[Repository layout](https://github.com/Algodev-Studio/algopay-sdk/blob/main/REPOSITORY_LAYOUT.md)** (repo root) | This file |

---

## MkDocs site nav

The published site follows **`mkdocs.yml`** (repo root).

**Local build:** `pip install -e "./python[docs]"` then `mkdocs serve` (from repo root).

---

## Naming conventions (avoid drift)

| Concept | Correct | Common mistake |
| ------- | ------- | -------------- |
| Python distribution | `algopay-sdk` | Calling the PyPI package `algopay` |
| Python import | `import algopay` | — |
| npm package | `@algodev-studio/algopay` | — |
| Folder for TS SDK | `typescript/` | Legacy paths **`sdk/`**, **`packages/algopay/`** |
| Next.js app | `pay/` | **`apps/console/`**, **`apps/web`** |
| npm workspace name | `algopay-console` | `algopay-web` |

---

## Source-of-truth hierarchy

1. **Runtime behavior:** **`python/src/algopay/`**, **`typescript/src/`**, **`pay/src/`** (UI/API routes).
2. **Shipping versions:** **`python/pyproject.toml`**, **`typescript/package.json`**.
3. **Narrative docs:** **`docs/`** + root **`README.md`**.
4. **Plans under `.cursor/plans/`:** Historical; verify against code if something conflicts.

When docs and code disagree, **treat code as authoritative** and update the doc.

---

## LLM-oriented file picks (copy-paste checklist)

```
README.md                          # Project overview
AGENTS.md                          # Coding-agent orientation
REPOSITORY_LAYOUT.md               # Directory tree
docs/DOCUMENTATION_MAP.md          # This hub
docs/getting-started.md            # Python quick path
python/examples/                   # Runnable Python samples
typescript/README.md               # npm API surface
docs/guides/typescript.md          # TS install, examples, Python↔TS method map
pay/.env.example                   # Dashboard secrets template
python/pyproject.toml              # Python version & deps
```

---

## Changelog for doc maintainers

When you add a route, env var, or workspace:

1. Update **implementation**.
2. Update **ENVIRONMENT.md** / **CONTROL_PLANE.md** / **`pay/.env.example`** as needed.
3. Add a row to **Task routing** or **Repository surface** if it is a new concern.
4. Bump **`mkdocs.yml`** nav for user-facing pages.
