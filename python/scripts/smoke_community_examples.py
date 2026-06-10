#!/usr/bin/env python3
"""Run community example scripts in mock mode and report pass/fail."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAMPLES = ROOT / "examples" / "community"

SCRIPTS: list[tuple[str, Path, dict[str, str]]] = [
    ("budgetbot", EXAMPLES / "budgetbot" / "budgetbot.py", {}),
    ("research-agent-receipts", EXAMPLES / "research-agent-receipts" / "export_receipts.py", {}),
    ("crew-spend-tracker", EXAMPLES / "crew-spend-tracker" / "crew_tracker.py", {}),
    (
        "slack-approval-gate",
        EXAMPLES / "slack-approval-gate" / "approval_gate.py",
        {"ALGOPAY_AUTO_APPROVE": "1"},
    ),
]


def run_script(name: str, path: Path, extra_env: dict[str, str]) -> tuple[str, bool, str]:
    env = os.environ.copy()
    env["ALGOPAY_DEMO_MODE"] = "mock"
    env["PYTHONIOENCODING"] = "utf-8"
    env.update(extra_env)
    try:
        result = subprocess.run(
            [sys.executable, str(path)],
            cwd=str(ROOT),
            env=env,
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )
        ok = result.returncode == 0
        detail = (result.stderr or result.stdout or "").strip()[-500:]
        return name, ok, detail
    except subprocess.TimeoutExpired:
        return name, False, "timeout after 120s"
    except OSError as exc:
        return name, False, str(exc)


def main() -> int:
    print("Community example smoke (ALGOPAY_DEMO_MODE=mock)")
    print("-" * 60)
    results: list[tuple[str, bool, str]] = []
    for name, path, extra in SCRIPTS:
        if not path.is_file():
            results.append((name, False, f"missing: {path}"))
            continue
        results.append(run_script(name, path, extra))

    passed = sum(1 for _, ok, _ in results if ok)
    for name, ok, detail in results:
        status = "PASS" if ok else "FAIL"
        print(f"  [{status}] {name}")
        if not ok and detail:
            print(f"         {detail[:200]}")

    print("-" * 60)
    print(f"Summary: {passed}/{len(results)} passed")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
