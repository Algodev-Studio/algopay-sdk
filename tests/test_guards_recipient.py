"""RecipientGuard."""

from __future__ import annotations

from decimal import Decimal

import pytest
from algosdk import account

from algopay.guards.base import PaymentContext
from algopay.guards.recipient import RecipientGuard


@pytest.mark.asyncio
async def test_recipient_whitelist_allows_match():
    _, allowed_addr = account.generate_account()
    g = RecipientGuard(mode="whitelist", addresses=[allowed_addr], name="r")
    ctx = PaymentContext(wallet_id="w", recipient=allowed_addr, amount=Decimal("1"))
    assert (await g.check(ctx)).allowed


@pytest.mark.asyncio
async def test_recipient_whitelist_blocks_unknown():
    _, allowed_addr = account.generate_account()
    _, other_addr = account.generate_account()
    g = RecipientGuard(mode="whitelist", addresses=[allowed_addr], name="r")
    ctx = PaymentContext(wallet_id="w", recipient=other_addr, amount=Decimal("1"))
    assert not (await g.check(ctx)).allowed


@pytest.mark.asyncio
async def test_recipient_blacklist_blocks_match():
    _, blocked_addr = account.generate_account()
    g = RecipientGuard(mode="blacklist", addresses=[blocked_addr], name="r")
    ctx = PaymentContext(wallet_id="w", recipient=blocked_addr, amount=Decimal("1"))
    assert not (await g.check(ctx)).allowed


@pytest.mark.asyncio
async def test_recipient_domain_match():
    g = RecipientGuard(mode="whitelist", domains=["good.example"], name="r")
    ctx = PaymentContext(
        wallet_id="w",
        recipient="https://api.good.example/path",
        amount=Decimal("1"),
    )
    assert (await g.check(ctx)).allowed


def test_recipient_invalid_mode():
    with pytest.raises(ValueError, match="mode"):
        RecipientGuard(mode="unknown")
