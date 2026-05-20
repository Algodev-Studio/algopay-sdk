#!/usr/bin/env python3
"""Verify built wheel/sdist contains the importable `algopay` package. Exit 1 on failure."""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path

REQUIRED = (
    "algopay/__init__.py",
    "algopay/client.py",
)


def _check_wheel(path: Path) -> list[str]:
    errors: list[str] = []
    with zipfile.ZipFile(path) as zf:
        names = set(zf.namelist())
        if len(names) < 10:
            errors.append(f"{path.name}: wheel has only {len(names)} entries (expected full package)")
        for req in REQUIRED:
            if req not in names:
                errors.append(f"{path.name}: missing {req}")
    return errors


def main() -> int:
    dist = Path(__file__).resolve().parents[1] / "dist"
    if not dist.is_dir():
        print(f"ERROR: no dist/ directory at {dist}", file=sys.stderr)
        return 1

    wheels = sorted(dist.glob("algopay_sdk-*.whl"))
    if not wheels:
        print(f"ERROR: no algopay_sdk-*.whl in {dist}", file=sys.stderr)
        return 1

    errors: list[str] = []
    for whl in wheels:
        errors.extend(_check_wheel(whl))

    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
        return 1

    print(f"OK: {wheels[-1].name} contains importable algopay package")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
