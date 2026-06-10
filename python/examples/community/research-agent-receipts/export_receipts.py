"""
Research Agent Receipts — x402-ready agent with CSV expense export from the ledger.

Uses AlgoPay ledger.query() to produce an audit file for finance / compliance review.
Set ALGOPAY_DEMO_MODE=mock for offline demo (mock router).
"""

from __future__ import annotations

import asyncio
import csv
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "src"))

from algopay import AlgoPay
from algopay.core.types import Network, PaymentMethod, PaymentResult, PaymentStatus

FAKE_RECIPIENT = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ"
X402_URL = os.environ.get("ALGOPAY_X402_URL", "https://example.com/paid-research-api")


def _enable_mock_router(client: AlgoPay) -> None:
    async def _mock_pay(**kwargs):
        recipient = kwargs["recipient"]
        method = PaymentMethod.X402 if str(recipient).startswith("http") else PaymentMethod.TRANSFER
        return PaymentResult(
            success=True,
            transaction_id="MOCK-TX",
            blockchain_tx="MOCK-TX",
            amount=kwargs["amount"],
            recipient=recipient,
            method=method,
            status=PaymentStatus.COMPLETED,
        )

    client._router.pay = _mock_pay  # type: ignore[method-assign]


async def run_research_session(client: AlgoPay, wallet_id: str) -> None:
    """Simulate a research agent paying for data APIs."""
    calls = [
        (FAKE_RECIPIENT, "0.02", "Academic paper metadata lookup"),
        (X402_URL, "0.05", "x402 research API — market signals"),
        (FAKE_RECIPIENT, "0.01", "Citation graph expansion"),
    ]
    for recipient, amount, purpose in calls:
        result = await client.pay(
            wallet_id,
            recipient,
            amount,
            purpose=purpose,
            skip_guards=False,
        )
        status = "ok" if result.success else result.status.value
        print(f"  {status:8} {amount} USDC -> {recipient[:40]}... -- {purpose}".encode("ascii", "replace").decode())


async def main() -> None:
    demo_mode = os.environ.get("ALGOPAY_DEMO_MODE", "mock").lower()
    out = Path(os.environ.get("ALGOPAY_RECEIPTS_CSV", "research_receipts.csv"))

    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    if demo_mode == "mock":
        _enable_mock_router(client)
        print("[demo] Mock router — ledger export works offline.\n")

    ws = client.wallet.create_wallet_set("research-agent")
    wallet = client.wallet.create_wallet(ws.id)
    await client.add_budget_guard(wallet.id, daily_limit="1.0", name="research_budget")

    print("Research session:")
    await run_research_session(client, wallet.id)

    count = await _export_async(client, wallet.id, out)
    print(f"\nExported {count} rows -> {out.resolve()}")
    print("Every API call is now accounted for — ready for expense review.")


async def _export_async(client: AlgoPay, wallet_id: str, out_path: Path) -> int:
    entries = await client.ledger.query(wallet_id=wallet_id, limit=500)
    rows = [
        {
            "timestamp": e.timestamp.isoformat(),
            "wallet_id": e.wallet_id,
            "recipient": e.recipient,
            "amount_usdc": str(e.amount),
            "status": e.status.value,
            "purpose": e.purpose or "",
            "tx_hash": e.tx_hash or "",
            "method": e.method,
        }
        for e in entries
    ]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "timestamp",
        "wallet_id",
        "recipient",
        "amount_usdc",
        "status",
        "purpose",
        "tx_hash",
        "method",
    ]
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return len(rows)


if __name__ == "__main__":
    asyncio.run(main())
