"""SingleTxGuard."""

from __future__ import annotations

from decimal import Decimal

import pytest

from algopay.guards.base import PaymentContext
from algopay.guards.single_tx import SingleTxGuard


@pytest.mark.asyncio
async def test_single_tx_blocks_over_max():
    g = SingleTxGuard(max_amount=Decimal("5"), name="st")
    ctx = PaymentContext(wallet_id="w", recipient="x", amount=Decimal("6"))
    r = await g.check(ctx)
    assert not r.allowed


@pytest.mark.asyncio
async def test_single_tx_blocks_under_min():
    g = SingleTxGuard(max_amount=Decimal("10"), min_amount=Decimal("2"), name="st")
    ctx = PaymentContext(wallet_id="w", recipient="x", amount=Decimal("1"))
    r = await g.check(ctx)
    assert not r.allowed


@pytest.mark.asyncio
async def test_single_tx_allows_range():
    g = SingleTxGuard(max_amount=Decimal("10"), min_amount=Decimal("2"), name="st")
    ctx = PaymentContext(wallet_id="w", recipient="x", amount=Decimal("5"))
    assert (await g.check(ctx)).allowed
