"""Ledger."""

from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal

import pytest

from algopay.ledger.ledger import Ledger, LedgerEntry, LedgerEntryStatus, LedgerEntryType
from algopay.storage.memory import InMemoryStorage


@pytest.mark.asyncio
async def test_ledger_record_get():
    storage = InMemoryStorage()
    ledger = Ledger(storage)
    e = LedgerEntry(wallet_id="w1", recipient="r1", amount=Decimal("2"), wallet_set_id="s1")
    eid = await ledger.record(e)
    got = await ledger.get(eid)
    assert got is not None
    assert got.wallet_id == "w1"
    assert got.amount == Decimal("2")


@pytest.mark.asyncio
async def test_ledger_update_status_merges_metadata():
    storage = InMemoryStorage()
    ledger = Ledger(storage)
    e = LedgerEntry(wallet_id="w1", recipient="r1", amount=Decimal("1"), metadata={"a": 1})
    await ledger.record(e)
    await ledger.update_status(e.id, LedgerEntryStatus.COMPLETED, tx_hash="txh", metadata_updates={"b": 2})
    got = await ledger.get(e.id)
    assert got.status == LedgerEntryStatus.COMPLETED
    assert got.tx_hash == "txh"
    assert got.metadata["a"] == 1
    assert got.metadata["b"] == 2


@pytest.mark.asyncio
async def test_ledger_query_filters():
    storage = InMemoryStorage()
    ledger = Ledger(storage)
    e1 = LedgerEntry(wallet_id="w1", recipient="r1", amount=Decimal("1"), status=LedgerEntryStatus.COMPLETED)
    e2 = LedgerEntry(wallet_id="w2", recipient="r2", amount=Decimal("2"), status=LedgerEntryStatus.PENDING)
    await ledger.record(e1)
    await ledger.record(e2)
    rows = await ledger.query(wallet_id="w1", status=LedgerEntryStatus.COMPLETED)
    assert len(rows) == 1
    assert rows[0].recipient == "r1"


@pytest.mark.asyncio
async def test_ledger_query_date_window():
    storage = InMemoryStorage()
    ledger = Ledger(storage)
    old = LedgerEntry(
        wallet_id="w1",
        recipient="r",
        amount=Decimal("1"),
        timestamp=datetime.now() - timedelta(days=10),
    )
    new = LedgerEntry(wallet_id="w1", recipient="r", amount=Decimal("1"))
    await ledger.record(old)
    await ledger.record(new)
    from_dt = datetime.now() - timedelta(days=2)
    rows = await ledger.query(wallet_id="w1", from_date=from_dt)
    assert len(rows) == 1


@pytest.mark.asyncio
async def test_ledger_get_total_spent():
    storage = InMemoryStorage()
    ledger = Ledger(storage)
    ok = LedgerEntry(
        wallet_id="w1",
        recipient="r",
        amount=Decimal("3"),
        status=LedgerEntryStatus.COMPLETED,
        entry_type=LedgerEntryType.PAYMENT,
    )
    pend = LedgerEntry(
        wallet_id="w1",
        recipient="r",
        amount=Decimal("5"),
        status=LedgerEntryStatus.PENDING,
        entry_type=LedgerEntryType.PAYMENT,
    )
    await ledger.record(ok)
    await ledger.record(pend)
    total = await ledger.get_total_spent("w1")
    assert total == Decimal("3")
