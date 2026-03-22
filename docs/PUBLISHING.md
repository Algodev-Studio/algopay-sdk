# Publishing AlgoPay (alpha)

This package uses **PEP 440** pre-release versioning. **`0.1.0a1`** is the first **0.1.0 alpha** (`pip` treats it as older than `0.1.0` and requires an explicit pre-release pin unless using `--pre`).

## Current status

- **Version:** `0.1.0a1` (see `pyproject.toml` and `algopay.__version__`)
- **Trove:** `Development Status :: 3 - Alpha` — APIs and behavior may change; test coverage is still growing ([testing roadmap](TESTING_ROADMAP.md)).

## Before the first upload

1. **Repository:** [Algodev-Studio/algopay-sdk](https://github.com/Algodev-Studio/algopay-sdk) — `[project.urls]` in `pyproject.toml` points here.
2. **PyPI account** at [pypi.org](https://pypi.org/account/register/) and an **API token** ([Account settings → API tokens](https://pypi.org/manage/account/token/)) scoped to the project (create the **`algopay-sdk`** project on first upload or use an “entire account” token for the first release only, then narrow scope).
3. **Project name:** The PyPI distribution is **`algopay-sdk`** ([project on PyPI](https://pypi.org/project/algopay-sdk/)). The importable Python package remains **`algopay`** (`import algopay`).
4. **`README.md`** is the PyPI long description via `readme = "README.md"`.

## Build artifacts

```bash
pip install build twine
python -m build
```

This produces `dist/algopay_sdk-0.1.0a1-py3-none-any.whl` and `dist/algopay_sdk-0.1.0a1.tar.gz`.

Sanity check:

```bash
twine check dist/*
```

## TestPyPI (recommended first)

Configure `~/.pypirc` or use environment variables for credentials, then:

```bash
twine upload --repository testpypi dist/*
```

Install from TestPyPI:

```bash
pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ "algopay-sdk==0.1.0a1"
```

(`--extra-index-url` pulls normal dependencies like `py-algorand-sdk` from PyPI.)

## Production PyPI

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

## Consumers

Stable pin (alpha):

```bash
pip install "algopay-sdk==0.1.0a1"
```

Or allow pre-releases in a range:

```bash
pip install --pre "algopay-sdk>=0.1.0a1,<0.2"
```

## After 1.0

- Drop the `a`/`b` suffix (e.g. `1.0.0`).
- Consider **`Development Status :: 5 - Production/Stable`** when the [testing roadmap](TESTING_ROADMAP.md) exit criteria are met.
