"""BudgetGuard."""

from __future__ import annotations

from decimal import Decimal

import pytest

from algopay.guards.base import PaymentContext
from algopay.guards.budget import BudgetGuard
from algopay.storage.memory import InMemoryStorage


def test_budget_guard_requires_limit():
    with pytest.raises(ValueError, match="At least one limit"):
        BudgetGuard()


@pytest.mark.asyncio
async def test_budget_guard_check_hourly_blocks():
    storage = InMemoryStorage()
    g = BudgetGuard(hourly_limit=Decimal("10"), name="h")
    g.bind_storage(storage)
    ctx = PaymentContext(wallet_id="w1", recipient="x", amount=Decimal("11"))
    r = await g.check(ctx)
    assert not r.allowed


@pytest.mark.asyncio
async def test_budget_guard_reserve_commit_then_block_total():
    storage = InMemoryStorage()
    g = BudgetGuard(total_limit=Decimal("10"), name="tot")
    g.bind_storage(storage)
    ctx = PaymentContext(wallet_id="w1", recipient="x", amount=Decimal("3"))
    token = await g.reserve(ctx)
    await g.commit(token)
    ctx2 = PaymentContext(wallet_id="w1", recipient="x", amount=Decimal("8"))
    with pytest.raises(ValueError, match="budget limit"):
        await g.reserve(ctx2)


@pytest.mark.asyncio
async def test_budget_guard_release_after_reserve():
    storage = InMemoryStorage()
    g = BudgetGuard(total_limit=Decimal("10"), name="tot")
    g.bind_storage(storage)
    ctx = PaymentContext(wallet_id="w1", recipient="x", amount=Decimal("3"))
    token = await g.reserve(ctx)
    await g.release(token)
    token2 = await g.reserve(ctx)
    assert token2 is not None
