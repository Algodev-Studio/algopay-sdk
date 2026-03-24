"""RedisStorage with fakeredis (no real Redis server)."""

from __future__ import annotations

import pytest

from algopay.storage.redis import RedisStorage


@pytest.fixture
def redis_backend():
    import fakeredis.aioredis

    s = RedisStorage(redis_url="redis://localhost/15")
    s._client = fakeredis.aioredis.FakeRedis(decode_responses=True)
    return s


@pytest.mark.asyncio
async def test_redis_save_get_delete(redis_backend: RedisStorage):
    await redis_backend.save("col", "key1", {"a": "b"})
    got = await redis_backend.get("col", "key1")
    assert got == {"a": "b"}
    assert await redis_backend.delete("col", "key1")
    assert await redis_backend.get("col", "key1") is None


@pytest.mark.asyncio
async def test_redis_update_merge(redis_backend: RedisStorage):
    await redis_backend.save("col", "k", {"status": "p", "metadata": {"m": 1}})
    ok = await redis_backend.update("col", "k", {"status": "c"})
    assert ok
    row = await redis_backend.get("col", "k")
    assert row["status"] == "c"
    assert row["metadata"]["m"] == 1


@pytest.mark.asyncio
async def test_redis_query_and_count(redis_backend: RedisStorage):
    await redis_backend.save("ledger", "e1", {"wallet_id": "w1", "amount": "1"})
    await redis_backend.save("ledger", "e2", {"wallet_id": "w2", "amount": "2"})
    rows = await redis_backend.query("ledger", filters={"wallet_id": "w1"})
    assert len(rows) == 1
    assert await redis_backend.count("ledger") == 2


@pytest.mark.asyncio
async def test_redis_atomic_add(redis_backend: RedisStorage):
    v = await redis_backend.atomic_add("g", "counter", "2.5")
    assert float(v) == 2.5
    v2 = await redis_backend.atomic_add("g", "counter", "0.5")
    assert float(v2) == 3.0


@pytest.mark.asyncio
async def test_redis_clear(redis_backend: RedisStorage):
    await redis_backend.save("x", "a", {"v": 1})
    await redis_backend.save("x", "b", {"v": 2})
    n = await redis_backend.clear("x")
    assert n == 2
    assert await redis_backend.count("x") == 0


@pytest.mark.asyncio
async def test_redis_health_check(redis_backend: RedisStorage):
    assert await redis_backend.health_check() is True
