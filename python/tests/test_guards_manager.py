"""GuardManager and GuardChain."""

from __future__ import annotations

from decimal import Decimal

import pytest
from algosdk import account

from algopay.guards.base import GuardChain, PaymentContext
from algopay.guards.manager import GuardConfig, GuardManager, GuardType
from algopay.guards.recipient import RecipientGuard
from algopay.guards.single_tx import SingleTxGuard
from algopay.storage.memory import InMemoryStorage


@pytest.mark.asyncio
async def test_guard_chain_short_circuits_on_failure():
    chain = GuardChain()
    chain.add(SingleTxGuard(max_amount=Decimal("5"), name="a"))
    chain.add(SingleTxGuard(max_amount=Decimal("100"), name="b"))
    ctx = PaymentContext(wallet_id="w", recipient="x", amount=Decimal("10"))
    r = await chain.check(ctx)
    assert not r.allowed
    assert r.metadata and "a" not in (r.metadata.get("passed_guards") or [])


@pytest.mark.asyncio
async def test_guard_chain_all_pass():
    chain = GuardChain()
    chain.add(SingleTxGuard(max_amount=Decimal("100"), name="a"))
    chain.add(SingleTxGuard(max_amount=Decimal("100"), name="b"))
    ctx = PaymentContext(wallet_id="w", recipient="x", amount=Decimal("1"))
    r = await chain.check(ctx)
    assert r.allowed
    assert r.metadata and set(r.metadata["passed_guards"]) == {"a", "b"}


@pytest.mark.asyncio
async def test_guard_manager_wallet_and_set_merged_order():
    storage = InMemoryStorage()
    gm = GuardManager(storage)
    await gm.add_guard_for_set(
        "set1",
        RecipientGuard(mode="whitelist", addresses=[], name="set_recv"),
    )
    _, addr = account.generate_account()
    await gm.add_guard(
        "w1",
        RecipientGuard(mode="whitelist", addresses=[addr], name="wallet_recv"),
    )
    chain = await gm.get_guard_chain("w1", "set1")
    assert len(chain) == 2
    ctx = PaymentContext(wallet_id="w1", wallet_set_id="set1", recipient=addr, amount=Decimal("1"))
    r = await chain.check(ctx)
    assert not r.allowed
    assert "set_recv" in (r.guard_name or "")


@pytest.mark.asyncio
async def test_guard_manager_list_names():
    storage = InMemoryStorage()
    gm = GuardManager(storage)
    await gm.add_guard("w1", SingleTxGuard(max_amount=Decimal("9"), name="st"))
    names = await gm.list_wallet_guard_names("w1")
    assert names == ["st"]


@pytest.mark.asyncio
async def test_guard_config_roundtrip_through_storage():
    storage = InMemoryStorage()
    gm = GuardManager(storage)
    g = SingleTxGuard(max_amount=Decimal("3"), min_amount=Decimal("1"), name="sx")
    await gm.add_guard("w1", g)
    chain = await gm.get_wallet_guards("w1")
    assert len(chain) == 1
    ctx = PaymentContext(wallet_id="w1", recipient="x", amount=Decimal("2"))
    assert (await chain.check(ctx)).allowed


def test_guard_config_enum_and_dict():
    cfg = GuardConfig(guard_type=GuardType.BUDGET, name="b", daily_limit=Decimal("1"))
    restored = GuardConfig.from_dict(cfg.to_dict())
    assert restored.guard_type == GuardType.BUDGET
    assert restored.daily_limit == Decimal("1")
