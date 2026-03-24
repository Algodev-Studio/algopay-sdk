"""BatchProcessor."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

import pytest

from algopay.core.config import Config
from algopay.core.types import (
    FeeLevel,
    Network,
    PaymentMethod,
    PaymentRequest,
    PaymentResult,
    PaymentStatus,
)
from algopay.payment.batch import BatchProcessor
from algopay.payment.router import PaymentRouter
from algopay.protocols.base import ProtocolAdapter
from algopay.wallet.service import WalletService


class FlakyAdapter(ProtocolAdapter):
    def __init__(self) -> None:
        self.calls = 0

    @property
    def method(self) -> PaymentMethod:
        return PaymentMethod.TRANSFER

    def supports(
        self,
        recipient: str,
        source_network: Network | str | None = None,
        destination_chain: Network | str | None = None,
        **kwargs: Any,
    ) -> bool:
        return recipient.startswith("batch:")

    async def execute(
        self,
        wallet_id: str,
        recipient: str,
        amount: Decimal,
        fee_level: FeeLevel = FeeLevel.MEDIUM,
        idempotency_key: str | None = None,
        purpose: str | None = None,
        destination_chain: Network | str | None = None,
        source_network: Network | str | None = None,
        wait_for_completion: bool = False,
        timeout_seconds: float | None = None,
        **kwargs: Any,
    ) -> PaymentResult:
        self.calls += 1
        if "fail" in recipient:
            raise RuntimeError("simulated failure")
        return PaymentResult(
            success=True,
            transaction_id="ok",
            blockchain_tx="ok",
            amount=amount,
            recipient=recipient,
            method=self.method,
            status=PaymentStatus.COMPLETED,
        )

    def get_priority(self) -> int:
        return 5


@pytest.mark.asyncio
async def test_batch_partial_failure():
    cfg = Config.from_env(network=Network.ALGORAND_TESTNET)
    ws = WalletService(cfg)
    router = PaymentRouter(cfg, ws)
    ad = FlakyAdapter()
    router.register_adapter(ad)
    proc = BatchProcessor(router)
    reqs = [
        PaymentRequest(wallet_id="w1", recipient="batch:ok", amount=Decimal("1")),
        PaymentRequest(wallet_id="w1", recipient="batch:fail", amount=Decimal("1")),
    ]
    out = await proc.process(reqs, concurrency=2)
    assert out.total_count == 2
    assert out.success_count == 1
    assert out.failed_count == 1
    assert out.results[0].success
    assert not out.results[1].success
    assert "simulated failure" in (out.results[1].error or "")
