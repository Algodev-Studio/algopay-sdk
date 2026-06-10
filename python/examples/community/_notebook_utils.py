"""Shared helpers for community example Jupyter notebooks."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

# python/examples/community/_notebook_utils.py -> python/src
_SRC = Path(__file__).resolve().parents[2] / "src"
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from algopay import AlgoPay
from algopay.core.types import (
    PaymentMethod,
    PaymentResult,
    PaymentStatus,
    SimulationResult,
)

FAKE_RECIPIENT = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ"


def enable_mock_router(client: AlgoPay, *, x402_aware: bool = False) -> None:
    """Patch router so notebooks run without TestNet funds."""

    async def _mock_pay(**kwargs: Any) -> PaymentResult:
        recipient = kwargs["recipient"]
        method = PaymentMethod.TRANSFER
        if x402_aware and str(recipient).startswith("http"):
            method = PaymentMethod.X402
        return PaymentResult(
            success=True,
            transaction_id="MOCK-TX",
            blockchain_tx="MOCK-TX",
            amount=kwargs["amount"],
            recipient=recipient,
            method=method,
            status=PaymentStatus.COMPLETED,
        )

    async def _mock_simulate(**kwargs: Any) -> SimulationResult:
        return SimulationResult(
            would_succeed=True,
            route=PaymentMethod.TRANSFER,
            reason=None,
        )

    client._router.pay = _mock_pay  # type: ignore[method-assign]
    client._router.simulate = _mock_simulate  # type: ignore[method-assign]


def ledger_rows(entries: list[Any]) -> list[dict[str, str]]:
    return [
        {
            "status": e.status.value,
            "amount_usdc": str(e.amount),
            "purpose": e.purpose or "",
            "recipient": (e.recipient or "")[:36],
            "tx_hash": e.tx_hash or "",
        }
        for e in entries
    ]


def display_ledger(entries: list[Any]) -> None:
    """Pretty-print ledger in Jupyter (pandas table if available)."""
    rows = ledger_rows(entries)
    if not rows:
        print("(no ledger entries)")
        return
    try:
        import pandas as pd
        from IPython.display import display

        display(pd.DataFrame(rows))
    except ImportError:
        for row in rows:
            print(row)
