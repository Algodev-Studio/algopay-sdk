"""
Crew Spend Tracker — multiple agents sharing one wallet set with rate limits.

Demonstrates wallet sets, RateLimitGuard, and ledger export for multi-agent crews.
"""

from __future__ import annotations

import asyncio
import os
import sys
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "src"))

from algopay import AlgoPay
from algopay.core.types import Network, PaymentMethod, PaymentResult, PaymentStatus

FAKE_RECIPIENT = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ"

AGENTS = [
    {"role": "researcher", "calls": 3},
    {"role": "writer", "calls": 2},
    {"role": "reviewer", "calls": 4},
]


def _enable_mock_router(client: AlgoPay) -> None:
    async def _mock_pay(**kwargs):
        return PaymentResult(
            success=True,
            transaction_id="MOCK-TX",
            blockchain_tx="MOCK-TX",
            amount=kwargs["amount"],
            recipient=kwargs["recipient"],
            method=PaymentMethod.TRANSFER,
            status=PaymentStatus.COMPLETED,
        )

    client._router.pay = _mock_pay  # type: ignore[method-assign]


async def main() -> None:
    demo_mode = os.environ.get("ALGOPAY_DEMO_MODE", "mock").lower()
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    if demo_mode == "mock":
        _enable_mock_router(client)
        print("[demo] Mock router enabled.\n")

    ws = client.wallet.create_wallet_set("crew-alpha")
    await client.add_rate_limit_guard_for_set(ws.id, max_per_minute=5, name="crew_rpm")
    await client.add_budget_guard_for_set(ws.id, daily_limit="0.25", name="crew_daily")

    wallets = {}
    for agent in AGENTS:
        w = client.wallet.create_wallet(ws.id, name=agent["role"])
        wallets[agent["role"]] = w
        print(f"Agent '{agent['role']}' wallet: {w.id[:8]}…")

    print("\nCrew payment simulation (rate limit: 5/min across set):")
    for agent in AGENTS:
        w = wallets[agent["role"]]
        for i in range(agent["calls"]):
            purpose = f"{agent['role']} task #{i + 1}"
            result = await client.pay(
                w.id,
                FAKE_RECIPIENT,
                "0.01",
                wallet_set_id=ws.id,
                purpose=purpose,
            )
            tag = "OK" if result.success else result.status.value
            print(f"  [{agent['role']}] call {i + 1}: {tag}")

    entries = []
    for w in wallets.values():
        entries.extend(await client.ledger.query(wallet_id=w.id, limit=50))
    completed = [e for e in entries if e.status.value == "completed"]
    total = sum(e.amount for e in completed)
    print(f"\nLedger: {len(entries)} entries, {total} USDC completed (set-level guards)")


if __name__ == "__main__":
    asyncio.run(main())
