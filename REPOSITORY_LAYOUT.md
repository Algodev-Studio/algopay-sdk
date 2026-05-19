# Repository layout

Monorepo: **three product surfaces**, each its own directory at the repo root.

```
algopay-sdk/
├── python/                   # PyPI algopay-sdk (`import algopay`)
│   ├── pyproject.toml
│   ├── src/algopay/
│   ├── tests/
│   ├── examples/
│   └── scripts/              # dev / demo helpers
├── typescript/               # npm @algodev-studio/algopay (mirrors python/src/algopay layout)
│   ├── src/                  # client, guards, ledger, intents, storage, payment
│   └── package.json
├── pay/                      # Next.js dashboard (workspace algopay-console)
├── docs/                     # MkDocs
├── mkdocs.yml
├── package.json              # npm workspaces (typescript + pay)
└── README.md
```

## Naming

- **PyPI:** `algopay-sdk` → `import algopay` (**folder `python/`**).
- **npm:** `@algodev-studio/algopay` (**folder `typescript/`**).
- **Dashboard:** **`pay/`**, workspace **`algopay-console`**.

## Commands

```bash
## Python SDK
pip install -e "./python[dev]"
cd python && pytest

## TypeScript + dashboard (repo root)
npm install
npm run build
npm run dev
```

**Documentation:** [docs/DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md) · [PLATFORM_FEATURE_MATRIX.md](docs/PLATFORM_FEATURE_MATRIX.md) · MkDocs entry [docs/index.md](docs/index.md).

