# Publishing AlgoPay (alpha) — Python & TypeScript

This document covers **both** distributables:

| Artifact | Registry | Package name | Version source |
| -------- | -------- | ------------ | -------------- |
| Python SDK | [PyPI](https://pypi.org/) | **`algopay-sdk`** (`import algopay`) | `pyproject.toml` → **`0.1.0a1`** (PEP 440) |
| TypeScript SDK | [npm](https://www.npmjs.com/) | **`@algodev-studio/algopay`** | `packages/algopay/package.json` → **`0.1.0-alpha.1`** (semver) |

Keep these **logically aligned** when cutting a release (same minor/patch story; Python `a1` ↔ npm `alpha.1`).

---

## Python (PyPI)

This package uses **PEP 440** pre-release versioning. **`0.1.0a1`** is the first **0.1.0 alpha** (`pip` treats it as older than `0.1.0` and requires an explicit pre-release pin unless using `--pre`).

### Current status

- **Version:** `0.1.0a1` (see `pyproject.toml` and `algopay.__version__`)
- **Trove:** `Development Status :: 3 - Alpha` — APIs and behavior may change; test coverage is still growing ([testing roadmap](TESTING_ROADMAP.md)).

### Before the first upload

1. **Repository:** [Algodev-Studio/algopay-sdk](https://github.com/Algodev-Studio/algopay-sdk) — `[project.urls]` in `pyproject.toml` points here.
2. **PyPI account** at [pypi.org](https://pypi.org/account/register/) and an **API token** ([Account settings → API tokens](https://pypi.org/manage/account/token/)) scoped to the project (create the **`algopay-sdk`** project on first upload or use an “entire account” token for the first release only, then narrow scope).
3. **Project name:** The PyPI distribution is **`algopay-sdk`** ([project on PyPI](https://pypi.org/project/algopay-sdk/)). The importable Python package remains **`algopay`** (`import algopay`).
4. **`README.md`** is the PyPI long description via `readme = "README.md"`.

### Build artifacts

```bash
pip install build twine
python -m build
```

This produces `dist/algopay_sdk-0.1.0a1-py3-none-any.whl` and `dist/algopay_sdk-0.1.0a1.tar.gz`.

Sanity check:

```bash
twine check dist/*
```

### TestPyPI (recommended first)

Configure `~/.pypirc` or use environment variables for credentials, then:

```bash
twine upload --repository testpypi dist/*
```

Install from TestPyPI:

```bash
pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ "algopay-sdk==0.1.0a1"
```

(`--extra-index-url` pulls normal dependencies like `py-algorand-sdk` from PyPI.)

### Production PyPI

**Do not commit tokens.** Use an environment variable (works on Windows PowerShell too):

```bash
python -m build
twine check dist/*
# Linux/macOS:
TWINE_USERNAME=__token__ TWINE_PASSWORD=pypi-AgEI... twine upload dist/*
```

PowerShell:

```powershell
$env:TWINE_USERNAME = "__token__"
$env:TWINE_PASSWORD = "pypi-AgEIcHlwaS5vcmcvc1Rva2..."
python -m build
twine check dist/*
twine upload dist/*
Remove-Item Env:TWINE_PASSWORD
```

Replace the password value with your [PyPI API token](https://pypi.org/manage/account/token/) (must include the `pypi-` prefix).

### Consumers

Stable pin (alpha):

```bash
pip install "algopay-sdk==0.1.0a1"
```

Or allow pre-releases in a range:

```bash
pip install --pre "algopay-sdk>=0.1.0a1,<0.2"
```

### After 1.0

- Drop the `a`/`b` suffix (e.g. `1.0.0`).
- Consider **`Development Status :: 5 - Production/Stable`** when the [testing roadmap](TESTING_ROADMAP.md) exit criteria are met.

---

## TypeScript (npm)

Package path: **`packages/algopay/`**. Scoped name: **`@algodev-studio/algopay`**.

### Prerequisite

- [npm](https://www.npmjs.com/) organization or user that owns the **`@algodev-studio`** scope (or change the scope in `package.json` before first publish).
- **Node 20+** for local publish (matches repo `engines`).

### One-time login

```bash
npm login
# or: npm config set //registry.npmjs.org/:_authToken YOUR_NPM_TOKEN
```

Use an [automation token](https://docs.npmjs.com/about-access-tokens) in CI (`NPM_TOKEN`); never commit it.

### Dry run (recommended)

From **repository root**:

```bash
npm install
npm run build --workspace=@algodev-studio/algopay
npm publish --workspace=@algodev-studio/algopay --access public --dry-run
```

### Publish

```bash
npm publish --workspace=@algodev-studio/algopay --access public
```

`prepublishOnly` in `packages/algopay/package.json` runs `tsc` so the `dist/` folder is fresh.

### Consumers

```bash
npm install @algodev-studio/algopay@0.1.0-alpha.1
```

Pre-releases: use an explicit version or `npm install @algodev-studio/algopay@alpha` if you tag dist-tags accordingly.

---

## GitHub Actions (optional)

Workflow **`.github/workflows/publish.yml`** provides **manual** publish jobs. Configure repository secrets:

| Secret | Used for |
| ------ | -------- |
| `PYPI_API_TOKEN` | `twine upload` as `__token__` |
| `NPM_TOKEN` | npm automation token |

Run **Publish** workflow from the Actions tab; enable **Python** and/or **npm** jobs as needed.

---

## Release checklist (both SDKs)

1. Update versions in **`pyproject.toml`** and **`packages/algopay/package.json`**; align alpha numbering.
2. **`python -m build`** + **`twine check`**; **`npm run build`** for the TS workspace.
3. Run **tests**: `pytest -m "not integration"`; `npm run test:js`.
4. Tag git (optional): `v0.1.0-alpha.1` or project convention.
5. Publish PyPI then npm (or reverse); verify install in a clean directory.
