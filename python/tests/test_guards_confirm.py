"""ConfirmGuard."""

from __future__ import annotations

from decimal import Decimal

import pytest

from algopay.guards.base import PaymentContext
from algopay.guards.confirm import ConfirmGuard


@pytest.mark.asyncio
async def test_confirm_below_threshold_skips():
    g = ConfirmGuard(threshold=Decimal("100"), name="c")
    ctx = PaymentContext(wallet_id="w", recipient="x", amount=Decimal("50"))
    r = await g.check(ctx)
    assert r.allowed


@pytest.mark.asyncio
async def test_confirm_above_threshold_blocks_without_callback():
    g = ConfirmGuard(threshold=Decimal("10"), name="c")
    ctx = PaymentContext(wallet_id="w", recipient="x", amount=Decimal("20"))
    r = await g.check(ctx)
    assert not r.allowed
    assert "confirmation" in (r.reason or "").lower()


@pytest.mark.asyncio
async def test_confirm_callback_allows():
    async def ok(_ctx: PaymentContext) -> bool:
        return True

    g = ConfirmGuard(threshold=Decimal("1"), confirm_callback=ok, name="c")
    ctx = PaymentContext(wallet_id="w", recipient="x", amount=Decimal("99"))
    assert (await g.check(ctx)).allowed


@pytest.mark.asyncio
async def test_confirm_always_confirm():
    g = ConfirmGuard(always_confirm=True, name="c")
    ctx = PaymentContext(wallet_id="w", recipient="x", amount=Decimal("0.01"))
    assert not (await g.check(ctx)).allowed
