# Repository layout

Polyglot monorepo: **Python SDK** stays at the repo root (standard for Hatch/setuptools); **TypeScript** and the **hosted console** live under `packages/` and `apps/`.

```
algopay-sdk/
├── pyproject.toml              # Python package algopay-sdk (PyPI)
├── src/algopay/                # Python SDK source
├── tests/                      # Python tests
├── docs/                       # MkDocs (user + ecosystem guides)
├── packages/
│   └── algopay/                # npm @algodev-studio/algopay (TypeScript SDK)
│       ├── src/
│       └── package.json
├── apps/
│   └── console/                # Next.js hosted control plane (npm: algopay-console)
│       ├── prisma/
│       └── src/
├── package.json                # npm workspaces root
└── package-lock.json
```

**Naming**

- **PyPI:** `algopay-sdk` → `import algopay`
- **npm:** `@algodev-studio/algopay` (folder `packages/algopay` — can rename to `packages/sdk-typescript` later if tooling allows; IDE locks may block renames on Windows)
- **Console:** workspace `algopay-console` in `apps/console` (formerly `apps/web`)

**Commands**

```bash
pip install -e ".[dev]"          # Python
npm install                       # JS workspaces
npm run dev                       # console dev server
npm run build                     # TS SDK + console production build
```

**Documentation:** [docs/DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md) (navigation hub), [docs/PLATFORM_FEATURE_MATRIX.md](docs/PLATFORM_FEATURE_MATRIX.md) (capabilities), [docs/index.md](docs/index.md) (MkDocs home).
