"""InMemoryStorage behavior."""

from __future__ import annotations

import pytest

from algopay.storage.memory import InMemoryStorage


@pytest.mark.asyncio
async def test_memory_save_get_roundtrip():
    s = InMemoryStorage()
    await s.save("c", "k", {"a": 1, "nested": {"x": True}})
    got = await s.get("c", "k")
    assert got == {"a": 1, "nested": {"x": True}}
    assert await s.get("c", "missing") is None


@pytest.mark.asyncio
async def test_memory_delete_update():
    s = InMemoryStorage()
    await s.save("c", "k", {"status": "pending"})
    assert await s.update("c", "k", {"status": "done"})
    assert (await s.get("c", "k"))["status"] == "done"
    assert await s.delete("c", "k")
    assert await s.get("c", "k") is None
    assert not await s.update("c", "k", {"x": 1})


@pytest.mark.asyncio
async def test_memory_query_filters():
    s = InMemoryStorage()
    await s.save("ledger", "a", {"wallet_id": "w1", "status": "completed"})
    await s.save("ledger", "b", {"wallet_id": "w2", "status": "completed"})
    rows = await s.query("ledger", filters={"wallet_id": "w1"})
    assert len(rows) == 1
    assert rows[0]["wallet_id"] == "w1"


@pytest.mark.asyncio
async def test_memory_atomic_add():
    s = InMemoryStorage()
    assert await s.atomic_add("g", "k", "5") == "5"
    assert await s.atomic_add("g", "k", "3") == "8"


@pytest.mark.asyncio
async def test_memory_clear_and_count():
    s = InMemoryStorage()
    await s.save("x", "1", {"v": 1})
    await s.save("x", "2", {"v": 2})
    assert await s.count("x") == 2
    n = await s.clear("x")
    assert n == 2
    assert await s.count("x") == 0
