"""PaymentRouter."""

from __future__ import annotations

from decimal import Decimal
from typing import Any

import pytest

from algopay.core.config import Config
from algopay.core.types import (
    FeeLevel,
    Network,
    PaymentMethod,
    PaymentResult,
    PaymentStatus,
)
from algopay.payment.router import PaymentRouter
from algopay.protocols.base import ProtocolAdapter
from algopay.protocols.transfer import TransferAdapter
from algopay.protocols.x402 import X402Adapter
from algopay.wallet.service import WalletService


class EchoAdapter(ProtocolAdapter):
    """Handles recipients prefixed with echo:."""

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
        return recipient.startswith("echo:")

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
        return PaymentResult(
            success=True,
            transaction_id="echo-tx",
            blockchain_tx="echo-tx",
            amount=amount,
            recipient=recipient,
            method=self.method,
            status=PaymentStatus.COMPLETED,
        )

    def get_priority(self) -> int:
        return 5


@pytest.fixture
def router() -> PaymentRouter:
    cfg = Config.from_env(network=Network.ALGORAND_TESTNET)
    ws = WalletService(cfg)
    r = PaymentRouter(cfg, ws)
    r.register_adapter(EchoAdapter())
    r.register_adapter(X402Adapter(cfg, ws))
    r.register_adapter(TransferAdapter(cfg, ws))
    return r


def test_router_detect_method(router: PaymentRouter):
    assert router.detect_method("echo:foo") == PaymentMethod.TRANSFER
    assert router.detect_method("https://x.example") == PaymentMethod.X402


@pytest.mark.asyncio
async def test_router_pay_unknown_recipient(router: PaymentRouter):
    res = await router.pay("w1", "not-echo-and-not-url", Decimal("1"))
    assert not res.success
    assert "No adapter" in (res.error or "")


@pytest.mark.asyncio
async def test_router_pay_echo(router: PaymentRouter):
    res = await router.pay("w1", "echo:test", Decimal("2"))
    assert res.success
    assert res.transaction_id == "echo-tx"


@pytest.mark.asyncio
async def test_router_simulate_no_adapter(router: PaymentRouter):
    sim = await router.simulate("w1", "nope", Decimal("1"))
    assert not sim.would_succeed


@pytest.mark.asyncio
async def test_router_simulate_echo(router: PaymentRouter):
    sim = await router.simulate("w1", "echo:x", Decimal("1"))
    assert sim.would_succeed
    assert sim.route == PaymentMethod.TRANSFER
