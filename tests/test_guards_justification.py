"""Tests for JustificationGuard."""

from decimal import Decimal

import pytest

from algopay.guards.base import PaymentContext
from algopay.guards.justification import JustificationGuard


@pytest.mark.asyncio
async def test_justification_blocks_empty() -> None:
    g = JustificationGuard(min_length=1)
    ctx = PaymentContext(wallet_id="w1", recipient="X", amount=Decimal("1"), purpose=None)
    r = await g.check(ctx)
    assert not r.allowed


@pytest.mark.asyncio
async def test_justification_allows_with_purpose() -> None:
    g = JustificationGuard(min_length=3)
    ctx = PaymentContext(
        wallet_id="w1",
        recipient="X",
        amount=Decimal("1"),
        purpose="  pay vendor  ",
    )
    r = await g.check(ctx)
    assert r.allowed


@pytest.mark.asyncio
async def test_justification_min_length() -> None:
    g = JustificationGuard(min_length=10)
    ctx = PaymentContext(
        wallet_id="w1",
        recipient="X",
        amount=Decimal("1"),
        purpose="short",
    )
    r = await g.check(ctx)
    assert not r.allowed
