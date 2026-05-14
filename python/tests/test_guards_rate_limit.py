"""RateLimitGuard."""

from __future__ import annotations

from decimal import Decimal

import pytest

from algopay.guards.base import PaymentContext
from algopay.guards.rate_limit import RateLimitGuard
from algopay.storage.memory import InMemoryStorage


def test_rate_limit_requires_window():
    with pytest.raises(ValueError, match="At least one rate limit"):
        RateLimitGuard()


@pytest.mark.asyncio
async def test_rate_limit_second_reserve_same_window_fails():
    storage = InMemoryStorage()
    g = RateLimitGuard(max_per_day=1, name="rl")
    g.bind_storage(storage)
    ctx = PaymentContext(wallet_id="w1", recipient="x", amount=Decimal("1"))
    await g.reserve(ctx)
    with pytest.raises(ValueError, match="Rate limit exceeded"):
        await g.reserve(ctx)


@pytest.mark.asyncio
async def test_rate_limit_release_allows_retry():
    storage = InMemoryStorage()
    g = RateLimitGuard(max_per_day=1, name="rl")
    g.bind_storage(storage)
    ctx = PaymentContext(wallet_id="w1", recipient="x", amount=Decimal("1"))
    token = await g.reserve(ctx)
    await g.release(token)
    await g.reserve(ctx)
