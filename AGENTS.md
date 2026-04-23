# Instructions for coding agents (Cursor, CI bots, LLMs)

Use this file as the **fastest orientation** for automated helpers. Humans can ignore it or skim [docs/DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md) for the same content with more context.

## Read first

1. **[docs/DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md)** — **Task routing**, canonical paths, naming (`algopay-sdk` vs `algopay`, `algopay-console` vs obsolete `algopay-web`).
2. **[REPOSITORY_LAYOUT.md](REPOSITORY_LAYOUT.md)** — Directory tree and workspace names.

## Code locations

| Concern | Path |
| ------- | ---- |
| Python SDK | `src/algopay/` |
| Python tests | `tests/` |
| TypeScript SDK | `packages/algopay/` → npm `@algodev-studio/algopay` |
| Hosted console | `apps/console/` → workspace `algopay-console` |

## Common mistakes to avoid

- Do not reference **`apps/web`** or **`algopay-web`**; the app is **`apps/console`** / **`algopay-console`**.
- Python **PyPI name** is **`algopay-sdk`**; **import** is **`algopay`**.
- Console **environment** is separate from Python `ALGOPAY_*` vars — see **`apps/console/.env.example`** and [docs/ecosystem/CONTROL_PLANE.md](docs/ecosystem/CONTROL_PLANE.md).

## Docs and site

- MkDocs sources: **`docs/`**; config: **`mkdocs.yml`**.
- When changing behavior, update **code** and the relevant **`docs/`** page; prefer linking to **DOCUMENTATION_MAP.md** for navigation updates.
- Capability status vs typical agent-payment platforms: **[docs/PLATFORM_FEATURE_MATRIX.md](docs/PLATFORM_FEATURE_MATRIX.md)**. Releases: **[docs/PUBLISHING.md](docs/PUBLISHING.md)**.
