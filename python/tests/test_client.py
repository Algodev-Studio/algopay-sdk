"""AlgoPay facade."""

from __future__ import annotations

from decimal import Decimal
from unittest.mock import AsyncMock

import pytest

from algopay import AlgoPay
from algopay.core.exceptions import PaymentError, ValidationError
from algopay.core.types import (
    Network,
    PaymentIntentStatus,
    PaymentMethod,
    PaymentRequest,
    PaymentResult,
    PaymentStatus,
    SimulationResult,
)
from algopay.ledger.ledger import LedgerEntryStatus


@pytest.mark.asyncio
async def test_alipay_context_manager():
    async with AlgoPay(network=Network.ALGORAND_TESTNET) as client:
        assert client.config.network == Network.ALGORAND_TESTNET


@pytest.mark.asyncio
async def test_pay_requires_wallet_id(valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    with pytest.raises(ValidationError, match="wallet_id"):
        await client.pay("", valid_algorand_address, "1.0", skip_guards=True)


@pytest.mark.asyncio
async def test_pay_requires_positive_amount(valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("p")
    w = await client.create_wallet(wallet_set_id=ws.id)
    with pytest.raises(ValidationError, match="positive"):
        await client.pay(w.id, valid_algorand_address, "0", skip_guards=True)


@pytest.mark.asyncio
async def test_pay_success_updates_ledger(valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("p")
    w = await client.create_wallet(wallet_set_id=ws.id)

    async def _fake_pay(**kwargs):
        return PaymentResult(
            success=True,
            transaction_id="tx1",
            blockchain_tx="tx1",
            amount=kwargs["amount"],
            recipient=kwargs["recipient"],
            method=PaymentMethod.TRANSFER,
            status=PaymentStatus.COMPLETED,
        )

    client._router.pay = _fake_pay  # type: ignore[method-assign]

    res = await client.pay(w.id, valid_algorand_address, "2.5", skip_guards=True)
    assert res.success
    entries = await client._ledger.query(wallet_id=w.id)  # type: ignore[attr-defined]
    assert len(entries) == 1
    assert entries[0].status == LedgerEntryStatus.COMPLETED


@pytest.mark.asyncio
async def test_pay_blocked_by_guard(valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("p")
    w = await client.create_wallet(wallet_set_id=ws.id)
    await client.add_single_tx_guard(w.id, max_amount="0.001")
    res = await client.pay(w.id, valid_algorand_address, "10.0")
    assert not res.success
    assert res.status == PaymentStatus.BLOCKED


@pytest.mark.asyncio
async def test_simulate_guard_blocks(valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("p")
    w = await client.create_wallet(wallet_set_id=ws.id)
    await client.add_single_tx_guard(w.id, max_amount="0.01")
    sim = await client.simulate(w.id, valid_algorand_address, "5.0")
    assert not sim.would_succeed
    assert "guard" in (sim.reason or "").lower()


@pytest.mark.asyncio
async def test_simulate_delegates_to_router(valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("p")
    w = await client.create_wallet(wallet_set_id=ws.id)

    async def _fake_sim(**kwargs):
        return SimulationResult(would_succeed=True, route=PaymentMethod.TRANSFER)

    client._router.simulate = _fake_sim  # type: ignore[method-assign]

    sim = await client.simulate(w.id, valid_algorand_address, "1.0")
    assert sim.would_succeed


def test_can_pay_and_detect_method():
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    assert client.can_pay("https://example.com/r")
    assert client.detect_method("https://example.com/r") == PaymentMethod.X402


@pytest.mark.asyncio
async def test_get_balance(monkeypatch, valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    monkeypatch.setattr(
        client._wallet_service,
        "get_usdc_balance_amount",
        lambda _wid: Decimal("7.5"),
    )
    bal = await client.get_balance("any-id")
    assert bal == Decimal("7.5")


@pytest.mark.asyncio
async def test_wallet_crud_wrappers():
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("crud")
    w = await client.create_wallet(wallet_set_id=ws.id)
    listed = await client.list_wallets(ws.id)
    assert any(x.id == w.id for x in listed)
    got = await client.get_wallet(w.id)
    assert got.address == w.address
    sets = await client.list_wallet_sets()
    assert any(s.id == ws.id for s in sets)


@pytest.mark.asyncio
async def test_add_and_list_guards(valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("g")
    w = await client.create_wallet(wallet_set_id=ws.id)
    await client.add_budget_guard(w.id, daily_limit="100.0", name="mybud")
    names = await client.list_guards(w.id)
    assert "mybud" in names


@pytest.mark.asyncio
async def test_add_guards_for_set(valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("gs")
    w = await client.create_wallet(wallet_set_id=ws.id)
    await client.add_rate_limit_guard_for_set(ws.id, max_per_day=10, name="rls")
    assert "rls" in await client.list_guards_for_set(ws.id)
    assert await client.list_guards(w.id) == []


@pytest.mark.asyncio
async def test_create_payment_intent_requires_simulate_ok(monkeypatch, valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("i")
    w = await client.create_wallet(wallet_set_id=ws.id)
    monkeypatch.setattr(
        client,
        "simulate",
        AsyncMock(
            return_value=SimulationResult(would_succeed=True, route=PaymentMethod.TRANSFER),
        ),
    )
    intent = await client.create_payment_intent(w.id, valid_algorand_address, "1.0")
    assert intent.wallet_id == w.id


@pytest.mark.asyncio
async def test_create_payment_intent_fails_when_simulate_fails(monkeypatch, valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("i")
    w = await client.create_wallet(wallet_set_id=ws.id)
    monkeypatch.setattr(
        client,
        "simulate",
        AsyncMock(
            return_value=SimulationResult(
                would_succeed=False,
                route=PaymentMethod.TRANSFER,
                reason="no route",
            ),
        ),
    )
    with pytest.raises(PaymentError, match="Authorization failed"):
        await client.create_payment_intent(w.id, valid_algorand_address, "1.0")


@pytest.mark.asyncio
async def test_cancel_payment_intent(valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("i")
    w = await client.create_wallet(wallet_set_id=ws.id)
    intent = await client.intents.create(w.id, valid_algorand_address, Decimal("1.0"))
    canceled = await client.cancel_payment_intent(intent.id)
    assert canceled.status.value == "canceled"


@pytest.mark.asyncio
async def test_confirm_payment_intent(monkeypatch, valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("i")
    w = await client.create_wallet(wallet_set_id=ws.id)
    intent = await client.intents.create(w.id, valid_algorand_address, Decimal("1.0"))
    assert intent.status == PaymentIntentStatus.REQUIRES_CONFIRMATION
    monkeypatch.setattr(
        client._router,
        "pay",
        AsyncMock(
            return_value=PaymentResult(
                success=True,
                transaction_id="t",
                blockchain_tx="t",
                amount=Decimal("1"),
                recipient=valid_algorand_address,
                method=PaymentMethod.TRANSFER,
                status=PaymentStatus.COMPLETED,
            ),
        ),
    )
    res = await client.confirm_payment_intent(intent.id)
    assert res.success
    final = await client.get_payment_intent(intent.id)
    assert final is not None
    assert final.status == PaymentIntentStatus.SUCCEEDED


@pytest.mark.asyncio
async def test_batch_pay_delegates(valid_algorand_address, second_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("b")
    w = await client.create_wallet(wallet_set_id=ws.id)
    reqs = [
        PaymentRequest(wallet_id=w.id, recipient=valid_algorand_address, amount=Decimal("1")),
        PaymentRequest(wallet_id=w.id, recipient=second_algorand_address, amount=Decimal("2")),
    ]

    async def _fake_pay(**kwargs):
        return PaymentResult(
            success=True,
            transaction_id="x",
            blockchain_tx="x",
            amount=kwargs["amount"],
            recipient=kwargs["recipient"],
            method=PaymentMethod.TRANSFER,
            status=PaymentStatus.COMPLETED,
        )

    client._router.pay = _fake_pay  # type: ignore[method-assign]
    out = await client.batch_pay(reqs, concurrency=2)
    assert out.success_count == 2
    assert out.failed_count == 0


@pytest.mark.asyncio
async def test_sync_transaction(monkeypatch, valid_algorand_address):
    from algopay.ledger.ledger import LedgerEntry

    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    entry = LedgerEntry(
        wallet_id="w",
        recipient=valid_algorand_address,
        amount=Decimal("1"),
        tx_hash="tid",
        metadata={},
    )
    await client._ledger.record(entry)  # type: ignore[attr-defined]
    monkeypatch.setattr(client._chain, "transaction_by_id", lambda _tid: {"id": "tid"})
    updated = await client.sync_transaction(entry.id)
    assert updated.status == LedgerEntryStatus.COMPLETED


@pytest.mark.asyncio
async def test_simulate_requires_wallet_id():
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    sim = await client.simulate("", "https://example.com", "1.0")
    assert not sim.would_succeed


@pytest.mark.asyncio
async def test_add_recipient_and_confirm_guards(valid_algorand_address):
    client = AlgoPay(network=Network.ALGORAND_TESTNET)
    ws = await client.create_wallet_set("gu")
    w = await client.create_wallet(wallet_set_id=ws.id)
    await client.add_recipient_guard(w.id, mode="whitelist", addresses=[valid_algorand_address], name="rg")
    await client.add_confirm_guard_for_set(ws.id, threshold="0.5", name="cgset")
    assert "rg" in await client.list_guards(w.id)
    assert "cgset" in await client.list_guards_for_set(ws.id)
