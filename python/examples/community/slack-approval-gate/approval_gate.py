"""
Slack Approval Gate — human-in-the-loop before agent spend.

Uses payment intents: authorize → (human approves in terminal as Slack stand-in) → confirm.
Replace the prompt with a Slack webhook / bot in production.
"""

from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "src"))

from algopay import AlgoPay
from algopay.core.types import (
    Network,
    PaymentMethod,
    PaymentResult,
    PaymentStatus,
    SimulationResult,
)

FAKE_RECIPIENT = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ"


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

    async def _mock_simulate(**kwargs):
        return SimulationResult(
            would_succeed=True,
            route=PaymentMethod.TRANSFER,
            reason=None,
        )

    client._router.pay = _mock_pay  # type: ignore[method-assign]
    client._router.simulate = _mock_simulate  # type: ignore[method-assign]


async def slack_approval_prompt(intent_id: str, amount: str, purpose: str | None) -> bool:
    """Stand-in for Slack interactive approval. Returns True if approved."""
    print("\n[Slack #agent-spend] Approval required")
    print(f"  Intent: {intent_id[:8]}…")
    print(f"  Amount: {amount} USDC")
    print(f"  Purpose: {purpose or '(none)'}")
    if os.environ.get("ALGOPAY_AUTO_APPROVE", "").lower() in ("1", "true", "yes"):
        print("  AUTO_APPROVE=1 → approved")
        return True
    answer = input("  Approve this payment? [y/N]: ").strip().lower()
    return answer in ("y", "yes")


async def main() -> None:
    demo_mode = os.environ.get("ALGOPAY_DEMO_MODE", "mock").lower()
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    if demo_mode == "mock":
        _enable_mock_router(client)

    ws = client.wallet.create_wallet_set("slack-gate")
    wallet = client.wallet.create_wallet(ws.id)
    await client.add_single_tx_guard(wallet.id, max_amount="1.0")

    amount = os.environ.get("ALGOPAY_AMOUNT", "0.25")
    purpose = os.environ.get("ALGOPAY_PURPOSE", "Premium data API — Q1 report")

    print("Agent requests payment (creates intent, does not spend yet)…")
    intent = await client.create_payment_intent(
        wallet.id,
        FAKE_RECIPIENT,
        amount,
        purpose=purpose,
    )
    print(f"Intent created: {intent.id} status={intent.status.value}")

    approved = await slack_approval_prompt(intent.id, amount, purpose)
    if not approved:
        print("Payment rejected by human — no funds moved.")
        return

    print("Human approved — confirming intent…")
    result = await client.confirm_payment_intent(intent.id)
    if result.success:
        print(f"Payment completed: {result.blockchain_tx}")
    else:
        print(f"Payment failed: {result.error}")


if __name__ == "__main__":
    asyncio.run(main())
