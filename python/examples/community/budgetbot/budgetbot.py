"""
BudgetBot — LangChain-style agent loop with AlgoPay spend guards.

Demonstrates BudgetGuard + JustificationGuard before each simulated "tool" payment.
Set ALGOPAY_DEMO_MODE=mock to run without TestNet funds (mocks chain settlement).
"""

from __future__ import annotations

import asyncio
import os
import sys
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "src"))

from algopay import AlgoPay
from algopay.core.types import (
    Network,
    PaymentMethod,
    PaymentResult,
    PaymentStatus,
    SimulationResult,
)

# Fake paid APIs the agent might call
TOOLS = [
    {"name": "search_web", "cost": "0.02", "purpose": "Search flights to Tokyo"},
    {"name": "weather_api", "cost": "0.01", "purpose": "Weather forecast for trip dates"},
    {"name": "hotel_api", "cost": "0.05", "purpose": "Hotel availability check"},
    {"name": "translate", "cost": "0.01", "purpose": ""},  # missing justification — should block
    {"name": "premium_data", "cost": "0.50", "purpose": "Market data feed"},  # may exceed budget
]

FAKE_RECIPIENT = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ"


def _enable_mock_router(client: AlgoPay) -> None:
    """Mock on-chain settlement so guards + ledger can be demoed offline."""

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

    async def _mock_simulate(**kwargs):
        return SimulationResult(
            would_succeed=True,
            route=PaymentMethod.TRANSFER,
            reason=None,
        )

    client._router.pay = _mock_pay  # type: ignore[method-assign]
    client._router.simulate = _mock_simulate  # type: ignore[method-assign]


async def agent_pay_for_tool(
    client: AlgoPay,
    wallet_id: str,
    tool: dict[str, str],
) -> None:
    name = tool["name"]
    amount = tool["cost"]
    purpose = tool.get("purpose") or None

    print(f"\n--- Tool: {name} (${amount}) ---")
    result = await client.pay(
        wallet_id,
        FAKE_RECIPIENT,
        amount,
        purpose=purpose,
        wait_for_completion=False,
    )
    if result.success:
        print(f"  pay: OK — guards passed: {result.guards_passed}")
    else:
        print(f"  pay: {result.status.value} — {result.error}")


async def main() -> None:
    demo_mode = os.environ.get("ALGOPAY_DEMO_MODE", "mock").lower()
    daily_limit = os.environ.get("ALGOPAY_DAILY_LIMIT", "0.10")

    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    if demo_mode == "mock":
        _enable_mock_router(client)
        print("[demo] Mock router enabled — no TestNet funds required.\n")

    ws = client.wallet.create_wallet_set("budgetbot")
    wallet = client.wallet.create_wallet(ws.id)
    print(f"Agent wallet: {wallet.address[:12]}… id={wallet.id}")

    await client.add_budget_guard(wallet.id, daily_limit=daily_limit, name="daily_cap")
    await client.add_justification_guard(wallet.id, min_length=8, name="why")

    print(f"Guards: daily_limit={daily_limit} USDC, justification min 8 chars")
    print("Running agent tool loop (LangChain-style pattern)…")

    for tool in TOOLS:
        await agent_pay_for_tool(client, wallet.id, tool)

    entries = await client.ledger.query(wallet_id=wallet.id, limit=20)
    print(f"\nLedger: {len(entries)} entries recorded")
    for e in entries:
        print(f"  {e.status.value:10} {e.amount} USDC — {e.purpose or '(no purpose)'}")


if __name__ == "__main__":
    asyncio.run(main())
