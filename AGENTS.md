# Instructions for coding agents (Cursor, CI bots, LLMs)

Use this file as the **fastest orientation** for automated helpers. Humans can ignore it or skim [docs/DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md) for the same content with more context.

## Read first

1. **[docs/DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md)** — **Task routing**, canonical paths, naming (`algopay-sdk` vs `algopay`, `algopay-console`).
2. **[REPOSITORY_LAYOUT.md](REPOSITORY_LAYOUT.md)** — Directory tree and workspace names.

## Code locations

| Concern | Path |
| ------- | ---- |
| Python SDK | **`python/src/algopay/`** (PyPI `algopay-sdk`, `import algopay`) |
| Python tests · examples · scripts | **`python/tests/`**, **`python/examples/`**, **`python/scripts/`** |
| TypeScript SDK | **`typescript/`** → npm **`@algodev-studio/algopay`** |
| Hosted dashboard | **`pay/`** → workspace **`algopay-console`** |
| Marketing site | **`site/`** → workspace **`algopay-site`** |

## Common mistakes to avoid

- Do not reference **`apps/web`**, **`apps/console`**, **`packages/algopay`**, or **`sdk/`** paths; TS lives under **`typescript/`**, dashboard under **`pay/`**.
- Python **PyPI name** is **`algopay-sdk`**; **import** is **`algopay`**; **`pyproject.toml`** is **`python/pyproject.toml`**.
- Dashboard **environment** is separate from Python `ALGOPAY_*` vars — **`pay/.env.example`** and [docs/ecosystem/CONTROL_PLANE.md](docs/ecosystem/CONTROL_PLANE.md).

## Docs and site

- MkDocs sources: **`docs/`**; config: **`mkdocs.yml`**.
- Python docstrings indexed from **`python/src`** (mkdocstrings paths in `mkdocs.yml`).
- Capability status vs typical agent-payment platforms: **[docs/PLATFORM_FEATURE_MATRIX.md](docs/PLATFORM_FEATURE_MATRIX.md)**. Releases: **[docs/PUBLISHING.md](docs/PUBLISHING.md)**.
